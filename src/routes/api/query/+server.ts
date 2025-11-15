import { json } from '@sveltejs/kit';
import { vectorStore } from '$lib/memoryStore';
import { HF_API_KEY } from '$env/static/private';
import { InferenceClient } from "@huggingface/inference";

// Initialize Hugging Face client
const client = new InferenceClient(HF_API_KEY);

// Keep last N chat turns in memory
const chatHistory: { role: 'user' | 'assistant'; content: string }[] = [];
const MAX_HISTORY = 5;

export const POST = async ({ request }) => {
  const { question, mode } = await request.json();

  // Add user question to chat history
  chatHistory.push({ role: 'user', content: question });
  if (chatHistory.length > MAX_HISTORY * 2) chatHistory.shift(); // remove oldest turn

  // Build prompt
  let prompt = '';

  // Include recent chat history
  const recentHistory = chatHistory.slice(-MAX_HISTORY * 2);
  if (recentHistory.length) {
    prompt += 'Conversation so far:\n';
    recentHistory.forEach(turn => {
      const role = turn.role === 'user' ? 'User' : 'Assistant';
      prompt += `${role}: ${turn.content}\n`;
    });
    prompt += '\n';
  }

  // Add document context or general knowledge
  if (mode === 'document') {
    const results = await vectorStore.similaritySearch(question, 3);
    const context = results.map(r => r.pageContent).join("\n");
    prompt += `Answer the question using ONLY the context below. If the answer is not present in the context, say "The document does not contain that information."\n\n`;
    prompt += `Context:\n${context}\n\nQuestion: ${question}\nAnswer:`;
  } else {
    prompt += `Answer the following question using your own knowledge:\n\nQuestion: ${question}\nAnswer:`;
  }

  // Call Hugging Face chatCompletion
  const chatCompletion = await client.chatCompletion({
    provider: "groq",
    model: "openai/gpt-oss-safeguard-20b",
    messages: [
      {
        role: "user",
        content: prompt,
      }
    ] 
  });

  
  const answer = chatCompletion.choices[0].message.content ?? '';
  chatHistory.push({ role: 'assistant', content: answer });

  return json({ answer, mode });
};
