export interface ResearchResponse {
  status: string;
  report: string;
}

const BACKEND_URLS = [
  "http://localhost:8000/api/v1/research",
  "http://127.0.0.1:8000/api/v1/research"
];

/**
 * Robust fetch with timeout and fallback support
 */
export const fetchResearch = async (topic: string): Promise<ResearchResponse> => {
  let lastError: any = null;

  for (const url of BACKEND_URLS) {
    try {
      console.log(`[Research Service] Attempting request to: ${url}`);
      console.log(`[Research Service] Payload:`, { topic });

      // Create a timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout for deep research

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ topic }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Research Service] Server error (${response.status}):`, errorText);
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`[Research Service] Success! Response received.`);
      
      if (!data.report) {
        throw new Error("Invalid response format: 'report' field is missing.");
      }

      return data as ResearchResponse;

    } catch (err: any) {
      lastError = err;
      console.warn(`[Research Service] Failed attempt at ${url}:`, err.message);
      
      if (err.name === 'AbortError') {
        throw new Error("Request timed out. The research agents are taking too long. Please try a simpler topic.");
      }
      
      // If it's not the last URL, we continue the loop to try the fallback
      continue;
    }
  }

  // If we reach here, all attempts failed
  console.error(`[Research Service] All connection attempts failed.`, lastError);
  throw new Error(
    lastError?.message || "Could not connect to the research backend. Please ensure the FastAPI server is running on port 8000."
  );
};
