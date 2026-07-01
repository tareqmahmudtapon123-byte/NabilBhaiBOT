import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("kick")
  .setDescription("Kick a member from the server")
  .addUserOption((o) => o.setName("user").setDescription("The user to kick").setRequired(true))
  .addStringOption((o) => o.setName("reason").setDescription("Reason").setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason") ?? "No reason provided";
  const guild = interaction.guild;
  if (!guild) { await interaction.reply({ content: "Server only.", ephemeral: true }); return; }

  let member; try { member = await guild.members.fetch(target.id); } catch { await interaction.reply({ content: "User not in server.", ephemeral: true }); return; }
  if (!member.kickable) { await interaction.reply({ content: "I cannot kick that user.", ephemeral: true }); return; }
  let exe; try { exe = await guild.members.fetch(interaction.user.id); } catch { exe = null; }
  if (exe && interaction.user.id !== guild.ownerId && member.roles.highest.comparePositionTo(exe.roles.highest) >= 0) {
    await interaction.reply({ content: "You cannot kick someone with an equal or higher role.", ephemeral: true }); return;
  }

  await interaction.deferReply();
  try {
    await member.kick(`${interaction.user.tag}: ${reason}`);
    await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0xff6600).setTitle("👢 Member Kicked")
      .addFields({ name: "User", value: `${target.tag} (${target.id})`, inline: true },
        { name: "Moderator", value: interaction.user.tag, inline: true }, { name: "Reason", value: reason }).setTimestamp()] });
  } catch (err) { await interaction.editReply({ content: `Failed: ${err instanceof Error ? err.message : err}` }); }
}
