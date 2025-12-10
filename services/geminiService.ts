import { GoogleGenAI } from "@google/genai";
import { AI_MODEL_NAME } from '../constants';
import { MeiliSearchHit } from '../types';

// Initialize the Gemini Client
// CRITICAL: We strictly use process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a streaming summary based on the user query and search results.
 */
export const generateSearchSummaryStream = async (
  query: string, 
  hits: MeiliSearchHit[]
): Promise<AsyncIterable<string>> => {
  
  // Construct a context-rich prompt
  const context = hits.map((hit, index) => {
    const title = hit.title || hit.name || `Result ${index + 1}`;
    const content = hit.content || hit.description || hit.overview || JSON.stringify(hit);
    return `[${index + 1}] Title: ${title}\nContent: ${content}`;
  }).join('\n\n');

  const prompt = `
    You are a helpful, intelligent search assistant. 
    User Query: "${query}"

    Please provide a concise, informative answer to the query based MAINLY on the following search results. 
    If the search results are relevant, cite them using [1], [2], etc.
    If the search results do not contain the answer, acknowledge that but try to answer from your general knowledge if appropriate, or state you don't know.
    Format the response in simple Markdown (bolding key terms, using bullet points for lists).
    Keep the tone neutral, professional, and direct.

    Search Results Context:
    ${context}
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: AI_MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: "You are a concise search summarizer engine.",
      }
    });

    // Create an async generator to yield chunks of text
    async function* streamGenerator() {
      for await (const chunk of responseStream) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
    }

    return streamGenerator();

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate AI summary.");
  }
};
