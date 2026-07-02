import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  ChatInputCommandInteraction,
} from "discord.js";

import * as ban from "./commands/ban.js";
import * as kick from "./commands/kick.js";
import * as timeout from "./commands/timeout.js";
import * as coinflip from "./commands/coinflip.js";
import * as clear from "./commands/clear.js";
import * as eightball from "./commands/eightball.js";
import * as userinfo from "./commands/userinfo.js";
import * as serverinfo from "./commands/serverinfo.js";
import * as ai from "./commands/ai.js";

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
    console.log("Registering slash commands...");
    await rest.put(Routes.applicationCommands(clientId), { body: commandData });
    console.log("Slash commands registered!");
  } catch (err) {
    console.error("Failed to register slash commands:", err);
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
    console.log(`✅ Bot is online as ${readyClient.user.tag}`);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`Error in command ${interaction.commandName}:`, err);
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
