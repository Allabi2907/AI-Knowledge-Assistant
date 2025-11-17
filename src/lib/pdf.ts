import {PDFParse} from 'pdf-parse';
import mammoth from "mammoth";


export async function extractText(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // const data = await new PDFParse(uint8Array);

  // return (await data.getText()).text;
   if (fileName.endsWith(".pdf")) {
    const data = await new PDFParse(uint8Array);
    return (await data.getText()).text;
  }

  // ----- TXT -----
  if (fileName.endsWith(".txt")) {
    return new TextDecoder("utf-8").decode(uint8Array);
  }

  // ----- DOCX -----
  if (fileName.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(uint8Array) });
    return result.value;
  }

  // ----- UNSUPPORTED -----
  throw new Error(`Unsupported file type: ${fileName}`);

}


