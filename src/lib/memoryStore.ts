import { hfEmbeddings } from './embeddings';
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

export const vectorStore = new MemoryVectorStore(hfEmbeddings);

