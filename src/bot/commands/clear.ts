import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("clear").setDescription("Delete messages from this channel")
  .addIntegerOption((o) => o.setName("amount").setDescription("Number to delete (1–100)").setRequired(true).setMinValue(1).setMaxValue(100))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute(interaction: ChatInputCommandInteraction) {
  const amount = interaction.options.getInteger("amount", true);
  if (!interaction.channel || !(interaction.channel instanceof TextChannel)) {
    await interaction.reply({ content: "Text channels only.", ephemeral: true }); return;
  }
  await interaction.deferReply({ ephemeral: true });
  try {
    const deleted = await interaction.channel.bulkDelete(amount, true);
    await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0x00bfff).setTitle("🧹 Messages Cleared")
      .setDescription(`Deleted **${deleted.size}** message(s).`).setFooter({ text: `Cleared by ${interaction.user.tag}` }).setTimestamp()] });
  } catch (err) { await interaction.editReply({ content: `Failed: ${err instanceof Error ? err.message : err}` }); }
}
