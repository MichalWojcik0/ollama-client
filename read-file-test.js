import { readDocx } from "./read-file.js"

const assertionError = msg => {
    return {
        msg: "AssertionError: " + msg,
    };
}

const assertStringsEqual = (a, b) => {
    if (a !== b) {
        throw assertionError(a + " is not equal to " + b);
    }
}

async function whenReadDocx_returnsContent() {
    const path = "./New Microsoft Word Document.docx";
    const content = await readDocx(path).catch(err => "");
    assertStringsEqual(content, "Wal go!")
};
whenReadDocx_returnsContent().catch(err => {});