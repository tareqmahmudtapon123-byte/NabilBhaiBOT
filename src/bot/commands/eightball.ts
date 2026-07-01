import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

const RESPONSES = [
  { text: "It is certain.", color: 0x00c853 }, { text: "It is decidedly so.", color: 0x00c853 },
  { text: "Without a doubt.", color: 0x00c853 }, { text: "Yes, definitely.", color: 0x00c853 },
  { text: "You may rely on it.", color: 0x00c853 }, { text: "As I see it, yes.", color: 0x00c853 },
  { text: "Most likely.", color: 0x00c853 }, { text: "Outlook good.", color: 0x00c853 },
  { text: "Yes.", color: 0x00c853 }, { text: "Signs point to yes.", color: 0x00c853 },
  { text: "Reply hazy, try again.", color: 0xffcc00 }, { text: "Ask again later.", color: 0xffcc00 },
  { text: "Better not tell you now.", color: 0xffcc00 }, { text: "Cannot predict now.", color: 0xffcc00 },
  { text: "Concentrate and ask again.", color: 0xffcc00 },
  { text: "Don't count on it.", color: 0xff1744 }, { text: "My reply is no.", color: 0xff1744 },
  { text: "My sources say no.", color: 0xff1744 }, { text: "Outlook not so good.", color: 0xff1744 },
  { text: "Very doubtful.", color: 0xff1744 },
];

export const data = new SlashCommandBuilder().setName("8ball").setDescription("Ask the magic 8-ball")
  .addStringOption((o) => o.setName("question").setDescription("Your yes/no question").setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  const question = interaction.options.getString("question", true);
  const response = RESPONSES[Math.floor(Math.random() * RESPONSES.length)]!;
  await interaction.reply({ embeds: [new EmbedBuilder().setColor(response.color).setTitle("🎱 Magic 8-Ball")
    .addFields({ name: "Question", value: question }, { name: "Answer", value: `> ${response.text}` })
    .setFooter({ text: `Asked by ${interaction.user.tag}` }).setTimestamp()] });
}
