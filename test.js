import { OllamaClient } from "./client.js";
import { readFile } from "./read-file.js";
import { getCodeAssistantBuilder } from "./agents/code-assistant.js";
import { getModuleExtractorBuilder } from "./agents/module-extractor.js";

const ollama = new OllamaClient("http://localhost:11434", 0.7, 800)
const ollamaShortLow = new OllamaClient("http://localhost:11434", 0.2, 20)

function constructPrompt(system, user) {
    return `${system}

<|user|>
${user}
<|assistant|>
`
}


function withClient(client) {
    return {
        withModel: (model) => {
            return {
                chatWithTimeout: async (message, ms) => {
                    return await client.chatWithTimeout(model, message, ms);
                },
                withSystemPrompt: (system) => {
                    return {
                        chatWithTimeout: async (prompt, ms) => {
                            const completePrompt = constructPrompt(system, prompt);
                            console.log(completePrompt);
                            return await client.chatWithTimeout(
                                model,
                                completePrompt,
                                ms
                            );
                        }
                    }
                }
            }
        }
    }
}

async function promptUntilNotEmpty(promiseCallback) {
    let response = "";
    let tries = 0;
    while (response === "") {
        tries++;
        try {
            response = await promiseCallback();
        } catch (timeout) {
            //ignore
        }
    }
    return {
        response: response,
        tries: tries,
    };
}

async function run() {
    const codeAssistant = getCodeAssistantBuilder(ollama, "my-fixed-model").build();
    const moduleExtractor = getModuleExtractorBuilder(ollamaShortLow, "bielik-fixed2").build();
    const file = "./read-file.js";
    const fc = readFile(file);
    const codeprompt = fc + "\n" +
        "Jakiej biblioteki można użyć aby przeczytać plik .pdf?"
    console.log(codeprompt);
    const res = await promptUntilNotEmpty(() => codeAssistant.chatWithTimeout(codeprompt, 10000));
    const response = res.response;
    console.log("with tries: " + res.tries);
    console.log("1. " + response);

    const res2 = await promptUntilNotEmpty(() => moduleExtractor.chatWithTimeout(
        response,
        5000
    ));
    let response2 = res2.response;
    console.log("with tries: " + res2.tries);
    console.log("2." + response2);
}

run();