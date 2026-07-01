import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, Guild } from "discord.js";

export const data = new SlashCommandBuilder().setName("serverinfo").setDescription("Get info about this server");

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) { await interaction.reply({ content: "Server only.", ephemeral: true }); return; }
  await interaction.deferReply();

  let g: Guild; try { g = await guild.fetch(); } catch { g = guild; }
  const createdAt = Math.floor(g.createdTimestamp / 1000);
  const textChannels = g.channels.cache.filter((c) => c.isTextBased()).size;
  const voiceChannels = g.channels.cache.filter((c) => c.isVoiceBased()).size;

  const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(`Server Info — ${g.name}`)
    .addFields({ name: "Owner", value: `<@${g.ownerId}>`, inline: true }, { name: "Server ID", value: g.id, inline: true },
      { name: "Created", value: `<t:${createdAt}:F>`, inline: false },
      { name: "Members", value: `${g.memberCount}`, inline: true }, { name: "Roles", value: `${g.roles.cache.size - 1}`, inline: true },
      { name: "Text Channels", value: `${textChannels}`, inline: true }, { name: "Voice Channels", value: `${voiceChannels}`, inline: true },
      { name: "Boost Level", value: `Level ${g.premiumTier}`, inline: true }, { name: "Boosts", value: `${g.premiumSubscriptionCount ?? 0}`, inline: true })
    .setTimestamp();
  if (g.iconURL()) embed.setThumbnail(g.iconURL({ size: 256 }) ?? null);
  if (g.description) embed.setDescription(g.description);
  await interaction.editReply({ embeds: [embed] });
}
