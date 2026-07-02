import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  ChatInputCommandInteraction,
} from "discord.js";
import { logger } from "../lib/logger";

import * as ban from "./commands/ban";
import * as kick from "./commands/kick";
import * as timeout from "./commands/timeout";
import * as coinflip from "./commands/coinflip";
import * as clear from "./commands/clear";
import * as eightball from "./commands/eightball";
import * as userinfo from "./commands/userinfo";
import * as serverinfo from "./commands/serverinfo";
import * as ai from "./commands/ai";

interface Command {
  data: { name: string; toJSON(): object };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

const ALL_COMMANDS: Command[] = [
  ban, kick, timeout, coinflip, clear, eightball, userinfo, serverinfo, ai,
];

export async function startBot(token: string) {
  const clientId = Buffer.from(token.split(".")[0]!, "base64").toString("ascii");
  const rest = new REST().setToken(token);
  const commandData = ALL_COMMANDS.map((cmd) => cmd.data.toJSON());

  try {
    logger.info({ count: commandData.length }, "Registering slash commands...");
    await rest.put(Routes.applicationCommands(clientId), { body: commandData });
    logger.info("Slash commands registered globally");
  } catch (err) {
    logger.error({ err }, "Failed to register slash commands");
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  const commands = new Collection<string, Command>();
  for (const cmd of ALL_COMMANDS) {
    commands.set(cmd.data.name, cmd);
  }

  client.once(Events.ClientReady, (readyClient) => {
    logger.info({ tag: readyClient.user.tag }, "Discord bot is online");
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (err) {
      logger.error({ err, command: interaction.commandName }, "Command error");
      const msg = { content: "An error occurred while running this command.", ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(msg).catch(() => null);
      } else {
        await interaction.reply(msg).catch(() => null);
      }
    }
  });

  await client.login(token);
  return client;
}
