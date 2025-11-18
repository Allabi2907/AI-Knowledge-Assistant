
# 📘 AI Assistant + Document Q&A App  
### *(SvelteKit + TypeScript + LangChain + HuggingFace)*

An advanced AI-powered assistant built entirely with **SvelteKit + TypeScript**, featuring two powerful modes for both document-based Q&A and general conversational AI.

---

## 🧾 1. Document Assistant

Upload **PDF, TXT, DOCX** files and ask questions based strictly on their content.

### 🔧 Uses:
- **Hugging Face Transformers** for embeddings  
- **LangChain** for document loading, chunking & retrieval  
- **Local in-memory vector store** (no database needed)

---

## 🤖 2. General AI Assistant

A smart conversational agent for **open-ended questions**, powered by any LLM of your choice:

- OpenAI  
- Groq  
- HuggingFace Inference API  

---

## 🚀 Features

### 🔍 Document Q&A (RAG)
- Upload documents (PDF, TXT, DOCX)  
- Automatic text extraction  
- Chunking + embedding generation  
- Semantic search using LangChain  
- Context-aware, accurate answers  

### 💬 AI Chat Assistant
- Handles general conversational queries  
- Works with OpenAI, Groq, or Hugging Face models  

### 💾 Local Memory (No Database Needed)
- Powered by **LangChain MemoryVectorStore**  
- Fast, lightweight, and ephemeral  
- Ideal for deployment on **Vercel, Netlify, or Hugging Face Spaces**

### 🖥️ Full SvelteKit App
- Backend API routes in `+server.ts`  
- Frontend UI in Svelte pages  
- No separate backend folder required  

---

## 🏗️ Tech Stack

| Layer        | Technology                               |
|--------------|-------------------------------------------|
| Frontend     | SvelteKit + TypeScript                    |
| Backend      | SvelteKit Server Routes                   |
| LLMs         | OpenAI / Groq / HuggingFace Inference     |
| Embeddings   | HuggingFace Sentence Transformers         |
| Vector Store | LangChain In-Memory Vector Store          |
| File Parsing | pdf-parse, mammoth, txt loaders              |

---

## 📁 Project Structure
```
project/
├── src/
│   ├── lib/
│   │   ├── embeddings.ts
│   │   ├── vectorStore.ts
│   │   ├── pdf.ts
│   ├── routes/
│   │   ├── api/
│   │   │   ├── upload/+server.ts
│   │   │   ├── query/+server.ts
│   │   ├── +page.svelte
├── static/
├── .env
├── package.json
└── README.md
```


## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.


