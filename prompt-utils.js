import { readDocx, readFile } from "./read-file.js";

/**
 * @param {() => Promise} promiseCallback 
 * @returns 
 */
export async function promptUntilNotEmpty(promiseCallback) {
    let response = "";
    let tries = 0;
    while (response === "" && tries < 10) {
        tries++;
        try {
            response = await promiseCallback();
        } catch (timeout) {
            //ignore
        }
    }
    if (tries === 20) {
        console.log("gave up after 10 tries");
    }
    return {
        response: response,
        tries: tries,
    };
}

export async function createRawPrompt(...args) {
    let res = "";
    for (const arg of args) {
        const type = arg.type;
        switch (type) {
            case "text":
                res += "\n" + arg.value + "\n";
                break;
            case "file": {
                const cnt = readFile(arg.value);
                res += "\n" + cnt + "\n";
            }
                break;
            case "docx": {
                const cnt = await readDocx(arg.value);
                res += "\n" + cnt + "\n";
            }
            case "system": {
                const cnt = arg.value;
                res += "\n<|system|>\n" + cnt + "\n";
            }
                break;
        }
    }
    return res;
}
