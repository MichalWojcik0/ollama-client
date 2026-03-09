import { promptUntilNotEmpty, createRawPrompt } from "./prompt-utils.js";
import { getCodeAssistantBuilder } from "./agents/code-assistant.js";
import { getModuleExtractorBuilder } from "./agents/module-extractor.js";

// possible ollama params
/*
temperature: 0.1
top_p: 0.9
top_k: 20
repeat_penalty: 1.05
 */

let id = 1;
function printResponse(res) {
    console.log("with tries: " + res.tries);
    console.log(id + ": " + res.response);
    id++;
}

async function getCodeContinuationThenExtractModule(file, question) {
    const fileArg = { type: "file", value: file };
    const query = { type: "text", value: question };
    const rawPrompt = createRawPrompt(fileArg, query);
    console.log(rawPrompt);
    const res = await promptUntilNotEmpty(() => codeAssistant.chatWithTimeout(rawPrompt, 10000));
    const response = res.response;
    printResponse(res);

    const res2 = await promptUntilNotEmpty(() => moduleExtractor.chatWithTimeout(
        response,
        100000
    ));
    let response2 = res2.response;
    printResponse(res2);
}

const codeAssistant = getCodeAssistantBuilder(0.7, 400, BIELIK_7B).build();
const moduleExtractor = getModuleExtractorBuilder(0.2, 40, BIELIK_7B_Q4).build();
const file = "./read-file.js";
    const question = "Jakiej biblioteki można użyć aby przeczytać plik .pdf?";
    await getCodeContinuationThenExtractModule(
        codeAssistant,
        moduleExtractor,
        file,
        question
    );