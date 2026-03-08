import { readFileSync } from "fs"
import mammoth from "mammoth";

export function readFile(path) {
    return readFileSync(path)
}

export async function readDocx(path) {
    const result = await mammoth.extractRawText({
        path: path
    }).catch(err => { console.log(err); });

    return result.value;
}