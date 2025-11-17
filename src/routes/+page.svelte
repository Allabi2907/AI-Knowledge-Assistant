<script lang="ts">
  import { marked } from 'marked';
  import { onDestroy, onMount, tick } from 'svelte';
  
  let files: FileList | null = null;
  let question = '';
  let answer = '';
  let uploading = false;
  let thinking = false;
  let uploadedFiles: { name: string; size: number }[] = [];
  let darkMode = true;
  let mode: 'document' | 'general' = 'document';

  let conversation: { question: string; answer: string ; mode: 'document' | 'general' }[] = [];

  let selectedFiles: { name: string; size: number }[] = [];

  function handleFileSelect() {
    if (files && files.length > 0) {
      selectedFiles = Array.from(files).map((f) => ({
        name: f.name,
        size: f.size
      }));
    } else {
      selectedFiles = [];
    }
    console.log(selectedFiles)
  }

  // Load saved theme
  onMount(() => {
    const saved = localStorage.getItem('theme');
    if (saved) darkMode = saved === 'dark';
    updateTheme();
  });

  function toggleTheme() {
    darkMode = !darkMode;
    updateTheme();
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }

  function updateTheme() {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }

  async function handleUpload() {
    if (!files?.length) return alert('Select at least one file');
    uploading = true;

    const formData = new FormData();
    for (const file of files) formData.append('files', file);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    uploading = false;

    if (res.ok) {
      uploadedFiles = Array.from(files).map((f) => ({
        name: f.name,
        size: f.size,
      }));
      selectedFiles = [];
      // files = null;
      alert('Document uploaded successfully!');
    } else {
      alert('Failed to upload document.');
    }
  }

  async function deleteFile(index: number) {
    const file = uploadedFiles[index];

    if(uploadedFiles.length === 1) {
      conversation = conversation.filter(c => c.mode !== 'document');
    }
    // Call backend to delete from vector store
    const res = await fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name })
    });

    if (res.ok) {
      // Remove from local uploadedFiles array
      uploadedFiles = uploadedFiles.filter((_, i) => i !== index);
    } else {
      console.error('Failed to delete file from server');
    }
  }

  function formatAnswer(text: string) {
    // let formatted = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    // formatted = formatted.replace(/\n/g, '<br>');
    // formatted = formatted.replace(/- (.*?)(?=\n|$)/g, '<li>$1</li>');
    // if (formatted.includes('<li>')) {
    //   formatted = formatted.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    // }
    return marked.parse(text);
  }

  async function ask() {
    if (!question) return;
    thinking = true;
    const q = question;
    question = '';
    const res = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q, mode })
    });

    const data = await res.json();
    
    conversation = [...conversation, { question: q, answer: data.answer, mode: data.mode }];
    await tick(); 
    const chatContainer = document.querySelector('.conversation');
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
  }

</script>

<main class="app-layout">
  <!-- Left Sidebar -->
   {#if mode === 'document'} 
      <aside class="upload-panel">
        
        <h2 class="gradient-header">Document Upload</h2>

        <div class="upload-box">
          <input
            type="file"
            bind:files
            multiple
            accept=".pdf,.txt,.docx"
            id="fileInput"
            hidden
            on:change={handleFileSelect}
          />
          <label for="fileInput" class="upload-label">
            <!-- <div class="upload-icon">⬆️</div> -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload w-10 h-10 text-primary mb-3 group-hover:scale-110 transition-transform"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>
            <p>Click to upload</p>
            <span>PDF, TXT, DOCX</span>
          </label>

          <!-- Show selected files before uploading -->
          {#if selectedFiles.length > 0}
            <div class="selected-files">
              <h4>Selected files:</h4>
              <ul>
                {#each selectedFiles as file}
                  <li>📄 {file.name} <small>({Math.round(file.size / 1024)} KB)</small></li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>

        <button on:click={handleUpload} disabled={uploading} class="upload-btn">
          {uploading ? 'Processing...' : 'Upload'}
        </button>

        {#if uploadedFiles.length > 0}
          <div class="uploaded-list">
            {#each uploadedFiles as file, index}
              <div class="file-card">
                📄 <span>{file.name}</span>
                <small>{Math.round(file.size / 1024)} KB</small>
                <button class="delete-btn" on:click={() => deleteFile(index)}>❌</button>
              </div>
            {/each}
          </div>
        {/if}
      </aside>
    {/if}

  <!-- Right Panel -->

  <section class="assistant-panel">
   <div class = 'header-and-tabs'>
    <div class="header">
      <h1 class="gradient-header">AI Assistant</h1>

      <button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle theme">
        {#if darkMode}
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 0112.21 3 7 7 0 0012 21a9 9 0 009-8.21z"></path>
          </svg>
        {/if}
      </button>
    </div>

    <div class="assistant-tabs">
      <button class={mode === 'document' ? 'active' : 'inactive'} on:click={() => (mode = 'document')}>
        📘 Document Assistant
      </button>
      <button class={mode === 'general' ? 'active' : 'inactive'} on:click={() => (mode = 'general')}>
        💬 Chat Assistant
      </button>
    </div>

    <p class="subtext">
      {#if mode === 'document'}
        Upload a document and ask questions about its content
      {:else}
        Chat with the assistant about anything
      {/if}
    </p>
</div>
    <div class="assistant-content">
      <div class="main-content">
        {#if mode === 'document'}
          {#if uploadedFiles.length === 0}
            <div class="placeholder">
              <div class="p-6 rounded-full bg-primary/10 inline-block mb-4"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text w-16 h-16 text-primary"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg></div>
              <h3>No document uploaded</h3>
              <span class="hint">Upload a document to get started</span>
            </div>
          {:else if !answer && !thinking}
            <div class="placeholder">
               <div class="p-6 rounded-full bg-accent/10 inline-block mb-4"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search w-16 h-16 text-accent"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg></div>
              <h3>Ask a question</h3>
              <span class="hint">Type your question below to search the document</span>
            </div>
          {/if}

           <div class="conversation">
            {#each conversation as c, i}
              {#if uploadedFiles.length !== 0 && c.mode === 'document'}
                <div class="chat-message user">
                  <div class="bubble">{c.question}</div>
                </div>
                <div class="chat-message assistant">
                  <div class="bubble">{@html formatAnswer(c.answer)}</div>
                </div>
              {/if}
            {/each}
          </div>

          {:else if mode === 'general'}
            {#if conversation.length === 0}
              <div class="placeholder">
                <div class="p-6 rounded-full bg-accent/10 inline-block mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search w-16 h-16 text-accent">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                </div>
                <h3>Start chatting</h3>
                <span class="hint">Type your message to start a conversation</span>
              </div>
            {:else}
              <div class="conversation">
                {#each conversation as c, i}
                  {#if c.mode === 'general'}
                    <div class="chat-message user">
                      <div class="bubble">{c.question}</div>
                    </div>
                    <div class="chat-message assistant">
                      <div class="bubble">{@html formatAnswer(c.answer)}</div>
                    </div>
                  {/if}
                {/each}
              </div>
            {/if}
        {/if}
      </div>

      <div class="question-box fixed-bottom">
        <input
          type="text"
          bind:value={question}
          placeholder={
            mode === 'document'
              ? uploadedFiles.length === 0
                ? 'Upload a document first'
                : 'Ask a question about the document...'
              : 'Type a message...'
          }
          on:keydown={(e) => e.key === 'Enter' && ask()}
          disabled={mode === 'document' && uploadedFiles.length === 0}
        />
        <button on:click={ask} class="ask-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-search"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
        <!-- <span>{thinking ? 'Thinking...' : 'Ask'}</span> -->
        </button>
      </div>
    </div>


  </section>
</main>

<style>
  :root[data-theme='dark'] {
    --bg: #0b0b12;
    --panel-bg: #11111a;
    --box-bg: #0f0f17;
    --text: #ffffff;
    --text-muted: #aaa;
    --border: #2a2a38;
    --accent: #7b61ff;
    --card-bg: #1a1a26;
    --icon-color: #eaeaea;
  }

  :root[data-theme='light'] {
    --bg: #f8f9fb;
    --panel-bg: #ffffff;
    --box-bg: #f0f2f7;
    --text: #222;
    --text-muted: #555;
    --border: #d0d0d0;
    --accent: #5b4af0;
    --card-bg: #e9ecf5;
    --icon-color: #333;
  }

  .app-layout {
    display: flex;
    height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    transition: background 0.3s, color 0.3s;
  }

  .upload-panel {
    width: 30%;
    background: var(--panel-bg);
    padding: 2rem;
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
  }

  .upload-panel h2 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    color: var(--accent);
  }

  .upload-box {
    border: 2px dashed var(--accent);
    border-radius: 12px;
    text-align: center;
    padding: 2rem 1rem;
    margin-bottom: 1rem;
    cursor: pointer;
  }

  /*.upload-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }*/

  .upload-btn {
    background: var(--accent);
    border: none;
    color: white;
    padding: 0.6rem;
    border-radius: 8px;
    cursor: pointer;
  }

  .uploaded-list {
    margin-top: 1rem;
  }

  .file-card {
    background: var(--card-bg);
    padding: 0.8rem;
    border-radius: 8px;
    margin-top: 0.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
  }

  .assistant-panel {
    flex: 1;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    overflow: auto;
  }

  .assistant-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: var(--box-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
  }

  .assistant-panel {
    flex: 1;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    background: var(--bg);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* .header-and-tabs {
      position: sticky;
      top: 0;
      z-index: 10;
      background: var(--bg);
      padding: 1rem 0;
    } */


  .theme-toggle {
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 50%;
    cursor: pointer;
    padding: 0.5rem;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .theme-toggle:hover {
    background-color: lightblue;
    transform: scale(1.05);
  }

  .icon {
    width: 1.3rem;
    height: 1.3rem;
    color: var(--icon-color);
    stroke: var(--icon-color);
    transition: stroke 0.3s ease;
  }

  .assistant-tabs { 
    display: flex;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .assistant-tabs button {
    background: var(--card-bg);
    color: var(--text-muted);
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .assistant-tabs button.active {
    background: var(--accent);
    color: white;
  }

  .subtext {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  /* .assistant-content {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
    background: var(--box-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
  } */

  .main-content {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 4rem;
  }

  .placeholder {
    text-align: center;
    margin-top: 4rem;
  }


  .hint {
    color: var(--text-muted);
    font-size: 0.85rem;
  }


  .question-box.fixed-bottom {
    position: sticky;
    bottom: 0;
    display: flex;
    gap: 0.5rem;
    background: var(--box-bg);
    padding-top: 1rem;
    border-top: 1px solid var(--border);
  }

  .question-box.fixed-bottom input {
    flex: 1;
    padding: 0.7rem;
    border-radius: 6px;
    border: none;
    outline: none;
    background: var(--card-bg);
    color: var(--text);
  }

  .question-box.fixed-bottom button {
    background: var(--accent);
    color: white;
    border: none;
    padding: 0 1rem;
    border-radius: 6px;
    cursor: pointer;
  }

  @media (max-width: 800px) {
    .app-layout {
      flex-direction: column;
    }

    .upload-panel {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid var(--border);
    }
  }

  .conversation {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.chat-message {
  display: flex;
  width: 100%;
}

.chat-message.user {
  justify-content: flex-end;
}

.chat-message.assistant {
  justify-content: flex-start;
}

.chat-message .bubble {
  max-width: 70%;
  padding: 0.8rem 1rem;
  border-radius: 1rem;
  line-height: 1.4;
  font-size: 0.95rem;
  word-wrap: break-word;
}

/* User (right side) message bubble */
.chat-message.user .bubble {
  background: var(--accent);
  color: #fff;
  border-bottom-right-radius: 0.3rem;
}

/* Assistant (left side) message bubble */
.chat-message.assistant .bubble {
  background: var(--card-bg);
  color: var(--text);
  border-bottom-left-radius: 0.3rem;
  border: 1px solid var(--border);
}

/* Optional subtle fade-in animation */
.chat-message .bubble {
  animation: fadeIn 0.2s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.p-6 {
  padding: 1.5rem;
}

.bg-accent\/10 {
  background-color: rgb(236, 185, 229);
}
.rounded-full {
  border-radius: 9999px;
}
.inline-block {
  display: inline-block;
}
.mb-4 {
  margin-bottom: 1rem;
}
 
.text-accent {
  color: rgb(173, 54, 173);
}

.w-16 {
  width: 4rem;
}
.h-16 {
  height: 4rem;
}

/* img, svg, video, canvas, audio, iframe, embed, object {
  display: block;
  vertical-align: middle;
} */

* {
  border-color: hsl(var(--border));
}
*, :before, :after {
    box-sizing: border-box;
    border-width: 0;
    border-style: solid;
    border-color: #e5e7eb;
}

.p-6 {
  padding: 1.5rem;
}
.bg-primary\/10 {
  background-color: rgb(200, 231, 243);
  color:  rgb(47, 86, 172);
}
.rounded-full {
  border-radius: 9999px;
}
.inline-block {
  display: inline-block;
}
.mb-4 {
  margin-bottom: 1rem;
}

.gradient-header {
  font-size: 2rem;       /* like text-2xl */
  font-weight: 700;       /* bold */
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  /* Default (light mode) gradient: blue → violet */
  background-image: linear-gradient(90deg, #3b82f6, #7b61ff, #9333ea);
}

/* Dark mode: adjust gradient for visibility on dark background */
@media (prefers-color-scheme: dark) {
  .gradient-header {
    background-image: linear-gradient(90deg, #60a5fa, #c084fc, #a78bfa);
  }
}

/* Optional fallback for browsers that don’t support background-clip text */
@supports not ((-webkit-background-clip: text)) {
  .gradient-header {
    color: #7b61ff; /* fallback violet */
  }

  @media (prefers-color-scheme: dark) {
    .gradient-header {
      color: #a78bfa; /* fallback for dark mode */
    }
  }
}

.selected-files {
  margin-top: 1rem;
  background: var(--card-bg);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
}

.selected-files h4 {
  margin: 0 0 0.5rem 0;
  color: var(--accent);
  font-size: 0.95rem;
}

.selected-files ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.selected-files li {
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  color: var(--text);
}

.question-box.fixed-bottom input:disabled {
  background: var(--card-bg);
  opacity: 0.6;
  cursor: not-allowed;
}

.question-box.fixed-bottom button:disabled {
  background: var(--border);
  color: var(--text-muted);
  cursor: not-allowed;
}

.ask-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--accent);
  color: white;
  border: none;
  padding: 0 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
}

.ask-btn:hover:not(:disabled) {
  background: hsl(250, 100%, 70%);
  transform: translateY(-1px);
}

.ask-btn:disabled {
  background: var(--border);
  color: var(--text-muted);
  cursor: not-allowed;
}

.ask-btn svg {
  width: 1.1rem;
  height: 1.1rem;
  stroke: currentColor;
}

.text-primary {
  color: rgb(151, 103, 228)
}

.w-10 {
  width: 3.5rem;
}
.h-10 {
  height: 3.5rem;
}
.mb-3 {
  margin-bottom: .75rem;
}
.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #e53e3e; /* red color */
}
.delete-btn:hover {
  color: #c53030;
}

:global(.bubble h1) {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #222;
}

:global(.bubble table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1rem;
}

:global(.bubble th),
:global(.bubble td) {
  border: 1px solid #999;
  padding: 0.5rem 1rem;
  text-align: left;
}


</style>
