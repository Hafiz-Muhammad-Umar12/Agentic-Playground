import chalk from "chalk";

// ─── THEME ────────────────────────────────────────────────────────────────────

const theme = {
  primary: chalk.hex("#a78bfa"),
  secondary: chalk.hex("#60a5fa"),
  success: chalk.hex("#34d399"),
  warning: chalk.hex("#fbbf24"),
  error: chalk.hex("#f87171"),
  muted: chalk.hex("#6b7280"),
  bold: chalk.bold,
};

// ─── LAYOUT HELPERS ───────────────────────────────────────────────────────────

const line = (char = "─") => theme.muted(char.repeat(52));

const box = (text: string) => {
  console.log(theme.muted("┌" + line("─") + "┐"));
  console.log("│ " + text);
  console.log(theme.muted("└" + line("─") + "┘"));
};

// ─── HEADER ───────────────────────────────────────────────────────────────────

export function printBanner(): void {
  console.clear();

console.log(
  theme.primary.bold(`
 ██████╗██╗      █████╗ ██╗   ██╗██████╗ ██╗
██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██║
██║     ██║     ███████║██║   ██║██║  ██║██║
██║     ██║     ██╔══██║██║   ██║██║  ██║██║
╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝██╗
 ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═╝
      `)
);

  console.log(
    theme.secondary("  🤖 Claudi CLI Agent  ") +
      theme.muted("• production interface")
  );

  console.log(theme.muted("  Hafiz Muhammad Umar\n"));

  box(
    ` ${theme.primary("Enter")} to chat  |  ${theme.primary(
      "/help"
    )} commands  |  ${theme.primary("/exit")} quit `
  );

  console.log("\n");
}

// ─── PROMPT ───────────────────────────────────────────────────────────────────

export function getPromptSymbol(): string {
  return theme.primary.bold("❯ ");
}

// ─── CHAT MESSAGES ────────────────────────────────────────────────────────────

/**
 * ❌ REMOVED USAGE IDEA:
 * renderUserMessage() is intentionally kept but SHOULD NOT be used
 * because readline already prints user input → prevents duplication
 */
export function renderUserMessage(_msg: string): void {
  // 🚫 DO NOTHING (prevents duplicate UI)
  return;
}

// ─── ASSISTANT ───────────────────────────────────────────────────────────────

export function renderAssistantHeader(): void {
  process.stdout.write(
    "\n" +
      theme.primary.bold("● Claude") +
      theme.muted(" ─────────────────────────\n")
  );
}

export function renderStreamChunk(chunk: string): void {
  process.stdout.write(chalk.white(chunk));
}

export function renderAssistantFooter(): void {
  console.log("\n");
}

// ─── TOOL RENDERING ───────────────────────────────────────────────────────────

export function renderToolUse(toolName: string) {
  console.log(
    "\n" +
      theme.warning("⚙ ") +
      theme.warning.bold(toolName) +
      theme.muted(" running...")
  );
}

export function renderToolResult(success: boolean, output: string) {
  const icon = success ? "✓" : "✗";
  const color = success ? theme.success : theme.error;

  console.log(color(`\n  ${icon} Tool Result:`));

  const preview = output.split("\n").slice(0, 6);
  preview.forEach((l) => console.log("   " + theme.muted(l)));

  if (output.split("\n").length > 6) {
    console.log(theme.muted("   ..."));
  }

  console.log();
}

// ─── STATES ───────────────────────────────────────────────────────────────────

export function renderThinking(): void {
  process.stdout.write(theme.muted("\n  ● Thinking...\n"));
}

export function renderError(msg: string): void {
  console.log("\n" + theme.error("  ✕ ") + chalk.white(msg) + "\n");
}

export function renderInfo(msg: string): void {
  console.log(theme.secondary("  ℹ ") + chalk.white(msg));
}

export function renderSuccess(msg: string): void {
  console.log(theme.success("  ✓ ") + chalk.white(msg));
}

// ─── HELP ─────────────────────────────────────────────────────────────────────

export function renderHelp(): void {
  console.log("\n" + theme.primary.bold("  CLI COMMANDS\n"));

  const cmds = [
    ["/help", "Show help menu"],
    ["/clear", "Clear screen"],
    ["/history", "View chat history"],
    ["/exit", "Quit CLI"],
  ];

  cmds.forEach(([c, d]) => {
    console.log("  " + theme.primary(c) + "  " + theme.muted(d));
  });

  console.log("\n" + theme.secondary.bold("  TOOLS\n"));

  const tools = [
    ["read_file", "Read files"],
    ["write_file", "Write files"],
    ["web_search", "Search web"],
  ];

  tools.forEach(([t, d]) => {
    console.log("  " + theme.warning(t) + "  " + theme.muted(d));
  });

  console.log();
}

// ─── HISTORY ──────────────────────────────────────────────────────────────────

export function renderHistory(
  history: Array<{ role: string; content: string }>
): void {
  if (!history.length) {
    renderInfo("No history yet");
    return;
  }

  console.log("\n" + theme.primary.bold("  CHAT HISTORY\n"));

  history.forEach((m, i) => {
    const label =
      m.role === "user"
        ? theme.secondary("You")
        : theme.primary("Claude");

    const text =
      m.content.length > 80
        ? m.content.slice(0, 80) + "..."
        : m.content;

    console.log(
      theme.muted(`[${i + 1}] `) + label + ": " + chalk.white(text)
    );
  });

  console.log();
}