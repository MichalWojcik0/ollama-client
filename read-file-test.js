import { readDocx, readPdf, replaceInDocx2 } from "./read-file.js"
import * as fs from 'fs'

const assertionError = msg => {
    return {
        msg: "AssertionError: " + msg,
    };
}

const assertStringsEqual = (a, b) => {
    if (a !== b) {
        throw assertionError("Expected: " + a + "\nGot: " + b);
    }
}

/**
 * @param {Function<Promise>} testfn 
 */
async function runTest(testfn) {
    console.log("Running test: " + testfn.name);
    const promise = testfn();
    await promise.catch(err => console.log(err));
}

async function whenReadDocx_returnsContent() {
    const path = "./test_data/New Microsoft Word Document.docx";
    const content = await readDocx(path).catch(err => "");
    assertStringsEqual("Wal go!\n\n", content);
};

async function whenReadPdf_returnsContent() {
    const path = "./test_data/file.pdf";
    const content = await readPdf(path);
    assertStringsEqual("Wal go!\n\n-- 1 of 1 --\n\n", content);
};

async function whenReplaceInDocx_replacedValueCanBeReadBack() {
    const path = "./test_data/new_template.docx";
    const outpath = "./output.docx"
    await replaceInDocx2(path, outpath, "kwota", "15");
    const content = await readDocx(outpath).catch(err => "");
    let failed = false;
    if (!content.includes("15")) {
        failed = true;
    }
    fs.rmSync(outpath);
    if (failed) {
        throw "";
    }
};

await runTest(whenReadDocx_returnsContent)
await runTest(whenReadPdf_returnsContent)
await runTest(whenReplaceInDocx_replacedValueCanBeReadBack)