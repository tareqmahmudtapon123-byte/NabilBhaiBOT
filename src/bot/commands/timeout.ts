import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from "discord.js";

const DURATION_MAP: Record<string, number> = {
  "60s": 60000, "5m": 300000, "10m": 600000, "30m": 1800000,
  "1h": 3600000, "6h": 21600000, "12h": 43200000, "1d": 86400000, "3d": 259200000, "1w": 604800000,
};

export const data = new SlashCommandBuilder()
  .setName("timeout").setDescription("Timeout a member temporarily")
  .addUserOption((o) => o.setName("user").setDescription("User to timeout").setRequired(true))
  .addStringOption((o) => o.setName("duration").setDescription("How long").setRequired(true)
    .addChoices({ name: "60 seconds", value: "60s" }, { name: "5 minutes", value: "5m" },
      { name: "10 minutes", value: "10m" }, { name: "30 minutes", value: "30m" }, { name: "1 hour", value: "1h" },
      { name: "6 hours", value: "6h" }, { name: "12 hours", value: "12h" }, { name: "1 day", value: "1d" },
      { name: "3 days", value: "3d" }, { name: "1 week", value: "1w" }))
  .addStringOption((o) => o.setName("reason").setDescription("Reason").setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user", true);
  const durationKey = interaction.options.getString("duration", true);
  const reason = interaction.options.getString("reason") ?? "No reason provided";
  const guild = interaction.guild;
  if (!guild) { await interaction.reply({ content: "Server only.", ephemeral: true }); return; }

  let member; try { member = await guild.members.fetch(target.id); } catch { await interaction.reply({ content: "User not in server.", ephemeral: true }); return; }
  if (!member.moderatable) { await interaction.reply({ content: "I cannot timeout that user.", ephemeral: true }); return; }
  let exe; try { exe = await guild.members.fetch(interaction.user.id); } catch { exe = null; }
  if (exe && interaction.user.id !== guild.ownerId && member.roles.highest.comparePositionTo(exe.roles.highest) >= 0) {
    await interaction.reply({ content: "You cannot timeout someone with an equal or higher role.", ephemeral: true }); return;
  }

  await interaction.deferReply();
  try {
    await member.timeout(DURATION_MAP[durationKey] ?? 60000, `${interaction.user.tag}: ${reason}`);
    await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0xffcc00).setTitle("⏱️ Member Timed Out")
      .addFields({ name: "User", value: `${target.tag} (${target.id})`, inline: true },
        { name: "Moderator", value: interaction.user.tag, inline: true },
        { name: "Duration", value: durationKey, inline: true }, { name: "Reason", value: reason }).setTimestamp()] });
  } catch (err) { await interaction.editReply({ content: `Failed: ${err instanceof Error ? err.message : err}` }); }
}
