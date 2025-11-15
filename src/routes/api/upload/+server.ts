import { json } from '@sveltejs/kit';
import { extractText } from '$lib/pdf';
import { vectorStore } from '$lib/memoryStore';

export const POST = async ({ request }) => {
  const formData = await request.formData();
  const files = formData.getAll('files') as File[];

  vectorStore.memoryVectors = []
 
  for (const file of files) {
    // console.log('filename', file.name)
    const text = await extractText(file);
    const chunks = text.match(/.{1,500}/g) || [];
    for (const chunk of chunks) {
      await vectorStore.addDocuments([{ pageContent: chunk, metadata: { text: chunk , fileName: file.name } }]);
    }
  }
  
  return json({ status: 'success', message: 'Files processed' });
};

export async function DELETE({ request }) {
  const { fileName } = await request.json();
  
  vectorStore.memoryVectors = vectorStore.memoryVectors.filter(
    v => v.metadata.fileName !== fileName
  );
   
  return json({
    status: 'success',
    message: `${fileName} deleted from vector store`
  });
}

