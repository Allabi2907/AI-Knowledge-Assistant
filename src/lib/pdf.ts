import {PDFParse} from 'pdf-parse';

export async function extractText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const data = await new PDFParse(uint8Array);

  return (await data.getText()).text;
}


