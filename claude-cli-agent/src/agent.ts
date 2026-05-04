import Groq from "groq-sdk";
import { toolDefinitions, executeTool } from "./tools";
import * as ui from "./ui";

const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are a powerful CLI assistant running in the user's terminal.

You have access to these tools:
- read_file: Read files from disk
- write_file: Write/create files on disk
- list_directory: List files in a directory
- web_search: Search the web using DuckDuckGo

Guidelines:
- Be concise and direct — this is a terminal, not a chat app
- When writing code, always save it to a file using write_file
- Use tools proactively when the user asks about files or needs current info
- Format output cleanly — avoid excessive markdown in simple responses
- When unsure about file paths, use list_directory first`;

// Convert tool definitions to Groq/OpenAI format
const groqTools = toolDefinitions.map((t) => ({
  type: "function" as const,
  function: {
    name: t.name,
    description: t.description,
    parameters: t.input_schema,
  },
}));

type Message = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
};

export class ClaudeAgent {
  private client: Groq;
  private conversationHistory: Message[] = [];

  constructor(apiKey: string) {
    this.client = new Groq({ apiKey });
  }

  getHistory() {
    return this.conversationHistory
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content || "" }));
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  async chat(userMessage: string): Promise<void> {
    this.conversationHistory.push({
      role: "user",
      content: userMessage,
    });

    ui.renderAssistantHeader();

    let continueLoop = true;

    while (continueLoop) {
      continueLoop = false;

      try {
        const messages: any[] = [
          { role: "system", content: SYSTEM_PROMPT },
          ...this.conversationHistory,
        ];

        // Stream response from Groq
        const stream = await this.client.chat.completions.create({
          model: MODEL,
          messages,
          tools: groqTools as any,
          tool_choice: "auto",
          stream: true,
          max_tokens: 4096,
        });

        let fullText = "";
        let toolCalls: any[] = [];

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta;

          // Stream text
          if (delta?.content) {
            ui.renderStreamChunk(delta.content);
            fullText += delta.content;
          }

          // Accumulate tool calls
          if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
              if (tc.index !== undefined) {
                if (!toolCalls[tc.index]) {
                  toolCalls[tc.index] = {
                    id: tc.id || "",
                    type: "function",
                    function: { name: "", arguments: "" },
                  };
                }
                if (tc.id) toolCalls[tc.index].id = tc.id;
                if (tc.function?.name)
                  toolCalls[tc.index].function.name += tc.function.name;
                if (tc.function?.arguments)
                  toolCalls[tc.index].function.arguments += tc.function.arguments;
              }
            }
          }
        }

        if (fullText) ui.renderAssistantFooter();

        // Add assistant message to history
        const assistantMsg: Message = {
          role: "assistant",
          content: fullText,
        };
        if (toolCalls.length > 0) {
          assistantMsg.tool_calls = toolCalls;
        }
        this.conversationHistory.push(assistantMsg);

        // Execute tool calls if any
        if (toolCalls.length > 0) {
          for (const tc of toolCalls) {
            const name = tc.function.name;
            let args: Record<string, string> = {};
            try {
              args = JSON.parse(tc.function.arguments || "{}");
            } catch {}

            ui.renderToolUse(name,);
            const result = await executeTool(name, args);
            ui.renderToolResult(result.success, result.output);

            this.conversationHistory.push({
              role: "tool",
              tool_call_id: tc.id,
              content: result.output,
            });
          }

          continueLoop = true;
          ui.renderAssistantHeader();
        }
      } catch (err: any) {
        ui.renderError(err.message || "Unknown Groq API error");
        break;
      }
    }
  }
}
