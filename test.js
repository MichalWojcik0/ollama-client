import { readFile } from "./read-file.js";
import { getCodeAssistantBuilder } from "./agents/code-assistant.js";
import { getModuleExtractorBuilder } from "./agents/module-extractor.js";
import { BIELIK_1_5B, BIELIK_7B } from "./model-identifiers.js";

async function promptUntilNotEmpty(promiseCallback) {
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
    if (tries === 10) {
        console.log("gave up after 10 tries");
    }
    return {
        response: response,
        tries: tries,
    };
}

function printResponse(res, num) {
    console.log("with tries: " + res.tries);
    console.log(num + ": " + res.response);
}

function createRawPrompt(...args) {
    let res = "";
    for(const arg of args) {
        const type = arg.type;
        switch (type) {
            case "text":
                res += "\n" + arg.value + "\n";
                break;
            case "file":
                const cnt = readFile(arg.value);
                res += "\n" + cnt + "\n";
                break;
        }
    }
    return res;
}

async function run() {
    const codeAssistant = getCodeAssistantBuilder(1.0, 400, BIELIK_7B).build();
    const moduleExtractor = getModuleExtractorBuilder(0.2, 40, BIELIK_7B).build();
    const fileArg = { type: "file", value: "./read-file.js"};
    const query = { type: "text", value: "Jakiej biblioteki można użyć aby przeczytać plik .pdf?" };
    const rawPrompt = createRawPrompt(fileArg, query);
    console.log(codeprompt);
    const res = await promptUntilNotEmpty(() => codeAssistant.chatWithTimeout(rawPrompt, 10000));
    const response = res.response;
    printResponse(res);

    const res2 = await promptUntilNotEmpty(() => moduleExtractor.chatWithTimeout(
        response,
        10000
    ));
    let response2 = res2.response;
    printResponse(res2);
}

run();