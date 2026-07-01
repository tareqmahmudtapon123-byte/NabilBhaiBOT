import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder().setName("coinflip").setDescription("Flip a coin — heads or tails!");

export async function execute(interaction: ChatInputCommandInteraction) {
  const result = Math.random() < 0.5 ? "Heads" : "Tails";
  await interaction.reply({ embeds: [new EmbedBuilder()
    .setColor(result === "Heads" ? 0xffd700 : 0xc0c0c0)
    .setTitle(`🪙 Coin Flip`).setDescription(`**${result}!**`)
    .setFooter({ text: `Flipped by ${interaction.user.tag}` }).setTimestamp()] });
}
