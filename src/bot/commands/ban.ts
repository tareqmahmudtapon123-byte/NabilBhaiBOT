import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ban")
  .setDescription("Ban a member from the server")
  .addUserOption((o) => o.setName("user").setDescription("The user to ban").setRequired(true))
  .addStringOption((o) => o.setName("reason").setDescription("Reason for the ban").setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason") ?? "No reason provided";
  const guild = interaction.guild;
  if (!guild) { await interaction.reply({ content: "Server only.", ephemeral: true }); return; }

  let member;
  try { member = await guild.members.fetch(target.id); } catch { member = null; }

  if (member) {
    if (!member.bannable) { await interaction.reply({ content: "I cannot ban that user.", ephemeral: true }); return; }
    let exe; try { exe = await guild.members.fetch(interaction.user.id); } catch { exe = null; }
    if (exe && interaction.user.id !== guild.ownerId && member.roles.highest.comparePositionTo(exe.roles.highest) >= 0) {
      await interaction.reply({ content: "You cannot ban someone with an equal or higher role.", ephemeral: true }); return;
    }
  }

  await interaction.deferReply();
  try {
    await guild.members.ban(target, { reason: `${interaction.user.tag}: ${reason}` });
    await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0xff0000).setTitle("🔨 Member Banned")
      .addFields({ name: "User", value: `${target.tag} (${target.id})`, inline: true },
        { name: "Moderator", value: interaction.user.tag, inline: true }, { name: "Reason", value: reason }).setTimestamp()] });
  } catch (err) { await interaction.editReply({ content: `Failed: ${err instanceof Error ? err.message : err}` }); }
                                           }
