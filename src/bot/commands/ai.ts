import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env["OPENAI_API_KEY"] });
const MAX_HISTORY = 20;
const conversations = new Map<string, OpenAI.Chat.ChatCompletionMessageParam[]>();
const SYSTEM_PROMPT = `You are a helpful, friendly, and concise Discord bot assistant. 
Answer questions, help with tasks, write code, and have casual conversations.
Keep responses short and Discord-friendly (under 1800 characters).
Use markdown sparingly — Discord supports **bold**, *italic*, \`code\`, and \`\`\`code blocks\`\`\`.`;

export const data = new SlashCommandBuilder().setName("ai").setDescription("Chat with an AI assistant")
  .addStringOption((o) => o.setName("message").setDescription("What do you want to ask?").setRequired(true))
  .addBooleanOption((o) => o.setName("reset").setDescription("Clear conversation history").setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {
  const message = interaction.options.getString("message", true);
  const reset = interaction.options.getBoolean("reset") ?? false;
  const userId = interaction.user.id;
  await interaction.deferReply();

  if (reset) conversations.delete(userId);
  const history = conversations.get(userId) ?? [];
  history.push({ role: "user", content: message });

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
      max_tokens: 600, temperature: 0.8,
    });
    const reply = response.choices[0]?.message?.content ?? "Sorry, no response.";
    history.push({ role: "assistant", content: reply });
    if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
    conversations.set(userId, history);

    const truncated = reply.length > 3900 ? reply.slice(0, 3900) + "\n\n*[Truncated]*" : reply;
    await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0x5865f2)
      .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
      .addFields({ name: "You asked", value: message.length > 1024 ? message.slice(0, 1021) + "..." : message })
      .setDescription(truncated)
      .setFooter({ text: `GPT-4o Mini • ${history.length / 2} message(s) • /ai reset:True to clear` }).setTimestamp()] });
  } catch (err) {
    await interaction.editReply({ content: `AI error: ${err instanceof Error ? err.message : err}` });
  }
      }
