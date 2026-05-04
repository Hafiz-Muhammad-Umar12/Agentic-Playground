import * as fs from "fs-extra";
import * as path from "path";
import axios from "axios";

export interface ToolResult {
  success: boolean;
  output: string;
}

// ─── FILE TOOLS ───────────────────────────────────────────────────────────────

export async function readFile(filePath: string): Promise<ToolResult> {
  try {
    const resolved = path.resolve(filePath);
    const content = await fs.readFile(resolved, "utf-8");
    return { success: true, output: content };
  } catch (err: any) {
    return { success: false, output: `Error reading file: ${err.message}` };
  }
}

export async function writeFile(
  filePath: string,
  content: string
): Promise<ToolResult> {
  try {
    const resolved = path.resolve(filePath);
    await fs.ensureDir(path.dirname(resolved));
    await fs.writeFile(resolved, content, "utf-8");
    return {
      success: true,
      output: `File written successfully: ${resolved}`,
    };
  } catch (err: any) {
    return { success: false, output: `Error writing file: ${err.message}` };
  }
}

export async function listDirectory(dirPath: string): Promise<ToolResult> {
  try {
    const resolved = path.resolve(dirPath);
    const items = await fs.readdir(resolved, { withFileTypes: true });
    const formatted = items
      .map((item) => `${item.isDirectory() ? "📁" : "📄"} ${item.name}`)
      .join("\n");
    return { success: true, output: formatted || "(empty directory)" };
  } catch (err: any) {
    return { success: false, output: `Error listing directory: ${err.message}` };
  }
}

// ─── WEB SEARCH TOOL ─────────────────────────────────────────────────────────

export async function webSearch(query: string): Promise<ToolResult> {
  try {
    // Using DuckDuckGo instant answer API (no key needed)
    const response = await axios.get(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
      { timeout: 8000 }
    );

    const data = response.data;
    const results: string[] = [];

    if (data.AbstractText) {
      results.push(`📖 ${data.AbstractText}`);
      if (data.AbstractURL) results.push(`🔗 ${data.AbstractURL}`);
    }

    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      const topics = data.RelatedTopics.slice(0, 4)
        .filter((t: any) => t.Text)
        .map((t: any) => `• ${t.Text}`);
      if (topics.length > 0) {
        results.push("\n📌 Related:\n" + topics.join("\n"));
      }
    }

    if (results.length === 0) {
      return {
        success: false,
        output: `No results found for: "${query}". Try a different search term.`,
      };
    }

    return { success: true, output: results.join("\n") };
  } catch (err: any) {
    return { success: false, output: `Search failed: ${err.message}` };
  }
}

// ─── TOOL DEFINITIONS FOR CLAUDE API ─────────────────────────────────────────

export const toolDefinitions = [
  {
    name: "read_file",
    description: "Read the contents of a file from the filesystem",
    input_schema: {
      type: "object" as const,
      properties: {
        path: { type: "string", description: "The file path to read" },
      },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description: "Write or create a file on the filesystem",
    input_schema: {
      type: "object" as const,
      properties: {
        path: { type: "string", description: "The file path to write to" },
        content: { type: "string", description: "The content to write" },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "list_directory",
    description: "List files and folders in a directory",
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description: "The directory path (default: current dir)",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "web_search",
    description: "Search the web for current information",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "The search query" },
      },
      required: ["query"],
    },
  },
];

// ─── TOOL EXECUTOR ────────────────────────────────────────────────────────────

export async function executeTool(
  name: string,
  input: Record<string, string>
): Promise<ToolResult> {
  switch (name) {
    case "read_file":
      return readFile(input.path);
    case "write_file":
      return writeFile(input.path, input.content);
    case "list_directory":
      return listDirectory(input.path || ".");
    case "web_search":
      return webSearch(input.query);
    default:
      return { success: false, output: `Unknown tool: ${name}` };
  }
}
