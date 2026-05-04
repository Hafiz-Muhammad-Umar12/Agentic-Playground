#!/usr/bin/env node
import * as readline from "readline";
import * as ui from "./ui";
import { ClaudeAgent } from "./agent";
import { getConfig, resetConfig } from "./config";

async function main(): Promise<void> {
  if (process.argv[2] === "--reset") {
    await resetConfig();
    process.exit(0);
  }

  const config = await getConfig();
  ui.printBanner();

  const agent = new ClaudeAgent(config.groqApiKey);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    prompt: ui.getPromptSymbol(),
  });

  rl.prompt();

  rl.on("line", async (input: string) => {
    const line = input.trim();

    if (!line) { rl.prompt(); return; }

    if (line.startsWith("/")) {
      const cmd = line.toLowerCase();
      if (cmd === "/exit" || cmd === "/quit") {
        console.log("\n  👋  Goodbye!\n");
        rl.close();
        process.exit(0);
      }
      if (cmd === "/help") { ui.renderHelp(); rl.prompt(); return; }
      if (cmd === "/clear") {
        agent.clearHistory();
        ui.printBanner();
        ui.renderSuccess("Conversation cleared.");
        console.log();
        rl.prompt();
        return;
      }
      if (cmd === "/history") {
        const history = agent.getHistory().filter((m) => typeof m.content === "string");
        ui.renderHistory(history as any);
        rl.prompt();
        return;
      }
      if (cmd === "/model") {
        ui.renderInfo("Model: llama-3.3-70b (Groq)");
        ui.renderInfo("Tools: read_file, write_file, list_directory, web_search");
        console.log();
        rl.prompt();
        return;
      }
      if (cmd === "/reset") {
        await resetConfig();
        console.log();
        rl.prompt();
        return;
      }
      ui.renderError(`Unknown command: ${line}. Type /help for commands.`);
      rl.prompt();
      return;
    }

    ui.renderUserMessage(line);
    rl.pause();

    try {
      await agent.chat(line);
    } catch (err: any) {
      ui.renderError(err.message);
    }

    rl.resume();
    rl.prompt();
  });

  rl.on("close", () => {
    console.log("\n  👋  Goodbye!\n");
    process.exit(0);
  });

  // Ctrl+C — 2 baar dabaao exit ke liye
  let ctrlCCount = 0;

rl.on("SIGINT", () => {
  ctrlCCount++;

  if (ctrlCCount === 1) {
    console.log("\n  Ctrl+C again to exit, or type /exit\n");
    rl.prompt();

    setTimeout(() => {
      ctrlCCount = 0;
    }, 2000);

    return;
  }

  console.log("\n  👋  Goodbye!\n");
  rl.close();
  process.exit(0);
});

  // Jab AI respond kar raha ho tab bhi Ctrl+C kaam kare
  // process.on("SIGINT", () => {
  //   console.log("\n  👋  Goodbye!\n");
  //   process.exit(0);
  // });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
