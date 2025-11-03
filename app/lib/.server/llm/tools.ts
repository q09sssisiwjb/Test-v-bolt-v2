import { tool } from 'ai';
import { z } from 'zod';
import { tavily } from '@tavily/core';

export interface WebSearchToolOptions {
  enabled?: boolean;
  tavilyApiKey?: string;
}

export function createWebSearchTool(options: WebSearchToolOptions = {}) {
  const { enabled = true, tavilyApiKey } = options;

  if (!enabled) {
    return null;
  }

  const apiKey = tavilyApiKey || process.env.TAVILY_API_KEY;

  if (!apiKey) {
    console.warn('Tavily API key not found. Web search tool will not be available.');
    return null;
  }

  const tavilyClient = tavily({ apiKey });

  return tool({
    description: 'Search the web for real-time information, current events, news, trends, SEO insights, marketing strategies, and up-to-date content. Use this when you need current information that may not be in your training data.',
    parameters: z.object({
      query: z.string().min(1).max(400).describe('The search query. Be specific and concise.'),
      searchDepth: z.enum(['basic', 'advanced']).optional().describe('Search depth: "basic" for quick results, "advanced" for more comprehensive research. Default is "basic".'),
      maxResults: z.number().min(1).max(10).optional().describe('Maximum number of search results to return. Default is 5.'),
    }),
    execute: async ({ query, searchDepth = 'basic', maxResults = 5 }) => {
      try {
        console.log(`[Web Search] Searching for: "${query}" (depth: ${searchDepth}, max: ${maxResults})`);
        
        const response = await tavilyClient.search(query, {
          search_depth: searchDepth,
          max_results: maxResults,
          include_answer: true,
          include_raw_content: false,
        });

        const results = {
          query: response.query,
          answer: response.answer || null,
          sources: response.results.map((result: any) => ({
            title: result.title,
            url: result.url,
            content: result.content,
            score: result.score,
          })),
        };

        console.log(`[Web Search] Found ${results.sources.length} results for: "${query}"`);
        
        return results;
      } catch (error) {
        console.error('[Web Search] Error:', error);
        return {
          error: 'Failed to perform web search. Please try again.',
          query,
        };
      }
    },
  });
}

export function getTools(options: WebSearchToolOptions = {}) {
  const tools: Record<string, any> = {};

  const webSearchTool = createWebSearchTool(options);
  
  if (webSearchTool) {
    tools.webSearch = webSearchTool;
  }

  return Object.keys(tools).length > 0 ? tools : undefined;
}
