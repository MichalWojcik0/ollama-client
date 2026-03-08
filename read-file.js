import { readFileSync } from "fs"
import mammoth from "mammoth";
import { PDFParse } from 'pdf-parse';
import fs from "fs/promises";

export function readFile(path) {
    return readFileSync(path)
}

export async function readDocx(path) {
    const result = await mammoth.extractRawText({
        path: path
    }).catch(err => { console.log(err); });

    return result.value;
}

export async function readPdf(path) {
  const buffer = await fs.readFile(path);
  const parser = new PDFParse({
    data: buffer
  });
  const result = await parser.getText();

  return result.text;
}