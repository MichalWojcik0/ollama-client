import { readFileSync, writeFileSync } from "fs"
import mammoth from "mammoth";
import { PDFParse } from 'pdf-parse';
import fs from "fs/promises";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export function readFile(path) {
  return readFileSync(path)
}

/**
 * @param {string} path 
 * @returns {Promise<string>}
 */
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

export async function replaceInDocx(path, outpath, replace, value) {
  const content = readFileSync(path, "binary");

  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    nullGetter(part) {
      if (!part.module) return '';
      return '';
    },
    paragraphLoop: true,
    linebreaks: true,
  });
  doc.compile();
  try {
    doc.render({
      [replace]: value
    });
  } catch (error) {
    console.error(JSON.stringify(error, null, 2));
    throw error;
  }

  const buffer = doc.getZip().generate({
    type: "nodebuffer"
  });

  fs.writeFileSync(outpath, buffer);
}

export function replaceInDocx2(path, outpath, key, value) {
  const binary = readFileSync(path, "binary");
  const zip = new PizZip(binary);

  let xml = zip.file("word/document.xml").asText();

  const placeholder = `{{${key}}}`;
  xml = xml.replaceAll(placeholder, value);

  zip.file("word/document.xml", xml);

  const buffer = zip.generate({ type: "nodebuffer" });
  writeFileSync(outpath, buffer);
}