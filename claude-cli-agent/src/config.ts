import * as fs from "fs-extra";
import * as path from "path";
import * as os from "os";
import * as readline from "readline";
import chalk from "chalk";

const CONFIG_DIR = path.join(os.homedir(), ".claudi");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

interface Config {
  groqApiKey: string;
}

export async function getConfig(): Promise<Config> {
  // Already saved?
  if (await fs.pathExists(CONFIG_FILE)) {
    const config = await fs.readJson(CONFIG_FILE);
    if (config.groqApiKey) return config;
  }

  // Env variable set hai?
  if (process.env.GROQ_API_KEY) {
    const config = { groqApiKey: process.env.GROQ_API_KEY };
    await saveConfig(config);
    return config;
  }

  // Pehli baar — key maango
  return await firstTimeSetup();
}

async function saveConfig(config: Config): Promise<void> {
  await fs.ensureDir(CONFIG_DIR);
  await fs.writeJson(CONFIG_FILE, config, { spaces: 2 });
}

async function firstTimeSetup(): Promise<Config> {
  console.clear();
  console.log(chalk.hex("#a78bfa").bold(`
   ██████╗██╗      █████╗ ██╗   ██╗██████╗ ██╗
  ██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██║
  ██║     ██║     ███████║██║   ██║██║  ██║██║
  ██║     ██║     ██╔══██║██║   ██║██║  ██║██║
  ╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝██║
   ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝╚═╝`));

  console.log(chalk.hex("#60a5fa")("\n  Welcome to Claudi — AI CLI Agent\n"));
  console.log(chalk.hex("#6b7280")("  ─────────────────────────────────────────────\n"));
  console.log(chalk.white("  Pehli baar setup — Groq API key chahiye!\n"));
  console.log(chalk.hex("#6b7280")("  Free key yahan se lo:"));
  console.log(chalk.hex("#a78bfa")("  👉 https://console.groq.com\n"));
  console.log(chalk.hex("#6b7280")("  Key gsk_... se start hogi\n"));
  console.log(chalk.hex("#6b7280")("  ─────────────────────────────────────────────\n"));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const key = await new Promise<string>((resolve) => {
    rl.question(chalk.hex("#a78bfa").bold("  Apni Groq API key enter karo: "), (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });

  if (!key || !key.startsWith("gsk_")) {
    console.log(chalk.hex("#f87171")("\n  ⚠ Invalid key! Key gsk_ se start honi chahiye.\n"));
    console.log(chalk.hex("#6b7280")("  Dobara run karo aur sahi key daalo.\n"));
    process.exit(1);
  }

  const config = { groqApiKey: key };
  await saveConfig(config);

  console.log(chalk.hex("#34d399")(`\n  ✓ Key save ho gayi! (~/.claudi/config.json)\n`));
  console.log(chalk.hex("#6b7280")("  Ab se dobara poochha nahi jayega.\n"));

  await new Promise((r) => setTimeout(r, 1500));
  return config;
}

export async function resetConfig(): Promise<void> {
  if (await fs.pathExists(CONFIG_FILE)) {
    await fs.remove(CONFIG_FILE);
    console.log(chalk.hex("#34d399")("  ✓ Config reset ho gayi!"));
  } else {
    console.log(chalk.hex("#6b7280")("  Config file mili nahi."));
  }
}
