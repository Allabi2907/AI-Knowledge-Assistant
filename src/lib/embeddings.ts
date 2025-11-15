import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { HF_API_KEY } from '$env/static/private';


export const hfEmbeddings = new HuggingFaceInferenceEmbeddings({
  model: "sentence-transformers/all-MiniLM-L6-v2", // or another available model
  apiKey: HF_API_KEY,
});

console.log('HF API Key:', HF_API_KEY); // server-side only

// export const hfClient = new HuggingFaceInference({
//   apiKey: process.env.HF_API_KEY,
// });

