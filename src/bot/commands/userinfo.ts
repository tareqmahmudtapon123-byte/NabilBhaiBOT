import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, GuildMember } from "discord.js";

export const data = new SlashCommandBuilder().setName("userinfo").setDescription("Get info about a user")
  .addUserOption((o) => o.setName("user").setDescription("User to look up (defaults to you)").setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user") ?? interaction.user;
  const guild = interaction.guild;
  await interaction.deferReply();

  let member: GuildMember | null = null;
  if (guild) { try { member = await guild.members.fetch(target.id); } catch {} }

  const createdAt = Math.floor(target.createdTimestamp / 1000);
  const joinedAt = member?.joinedTimestamp ? Math.floor(member.joinedTimestamp / 1000) : null;
  const roles = member?.roles.cache.filter((r) => r.id !== guild?.id).sort((a, b) => b.position - a.position)
    .map((r) => r.toString()).slice(0, 10).join(", ") || "None";

  const embed = new EmbedBuilder().setColor(member?.displayColor || 0x5865f2)
    .setTitle(`User Info — ${target.tag}`).setThumbnail(target.displayAvatarURL({ size: 256 }))
    .addFields({ name: "Username", value: target.tag, inline: true }, { name: "ID", value: target.id, inline: true },
      { name: "Bot", value: target.bot ? "Yes" : "No", inline: true },
      { name: "Account Created", value: `<t:${createdAt}:F> (<t:${createdAt}:R>)` });
  if (member) {
    if (joinedAt) embed.addFields({ name: "Joined Server", value: `<t:${joinedAt}:F> (<t:${joinedAt}:R>)` });
    if (member.nickname) embed.addFields({ name: "Nickname", value: member.nickname, inline: true });
    embed.addFields({ name: `Roles (${member.roles.cache.size - 1})`, value: roles });
  }
  embed.setTimestamp();
  await interaction.editReply({ embeds: [embed] });
}
