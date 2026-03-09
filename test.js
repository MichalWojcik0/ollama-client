import { readDocx, readFile } from "./read-file.js";
import { getCodeAssistantBuilder } from "./agents/code-assistant.js";
import { getModuleExtractorBuilder } from "./agents/module-extractor.js";
import { BIELIK_1_5B, BIELIK_7B, BIELIK_7B_Q4 } from "./model-identifiers.js";
import { getTagExtractorBuilder } from "./agents/tag-extractor.js";
import { getInformationExtractorBuilder, infoExtractorSystem } from "./agents/information-extractor.js";

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
    if (tries === 20) {
        console.log("gave up after 10 tries");
    }
    return {
        response: response,
        tries: tries,
    };
}

let id = 1;
function printResponse(res) {
    console.log("with tries: " + res.tries);
    console.log(id + ": " + res.response);
    id++;
}

async function createRawPrompt(...args) {
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

async function getCodeContinuationThenExtractModule(codeAssistant, moduleExtractor, file, question) {
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

async function extractTagsFromFile(
    tagExtractor,
    infoExtractor,
    pathToTemplate,
    pathToNote
) {
    const fileArg = { type: "docx", value: pathToTemplate };
    const rawPrompt = await createRawPrompt(fileArg);
    console.log("rprompt: " + rawPrompt);
    const res = await promptUntilNotEmpty(() => tagExtractor.chatWithTimeout(rawPrompt, 10000));
    printResponse(res);
    let tags = res.response;
    tags = tags.replaceAll("{{", "\"").replaceAll("}}", "\"");
    tags = tags.split("\n").join(" : \"\",\n") + ": \"\"";
    tags = "{\n  \"informacje\": {\n" + tags + "\n}\n}";
    let isJSON = true;
    try {
        const js = JSON.parse(tags);
    } catch (SyntaxError) {
        isJSON = false;
    }
    const tmsg = isJSON ? "valid JSON" : "invalid JSON";
    console.log(tmsg + " : " + tags);
    const tagArg = { type: "text", value: tags };
    const fileArg2 = { type: "docx", value: pathToNote };
    const sytemRepeat = { type: "system", value: infoExtractorSystem };
    const rawPrompt2 = await createRawPrompt(tagArg, fileArg2, sytemRepeat);
    const res2 = await promptUntilNotEmpty(() => infoExtractor.chatWithTimeout(rawPrompt2, 20000));
    printResponse(res2);
}

async function run() {
    const args = process.argv;
    console.log("args");
    console.log(args);
    console.log(args[2]);
    const codeAssistant = getCodeAssistantBuilder(0.7, 400, BIELIK_7B).build();
    const moduleExtractor = getModuleExtractorBuilder(0.2, 40, BIELIK_7B_Q4).build();
    const tagExtractor = getTagExtractorBuilder(0.2, 100, BIELIK_7B_Q4).build();
    const infoExtractor = getInformationExtractorBuilder(0.2, 1000, BIELIK_7B).build();
    if (args.length > 4 && args[2] === "tags") {
        const pathToTemplate = args[3];
        const pathToNotes = args[4];
        extractTagsFromFile(tagExtractor, infoExtractor, pathToTemplate, pathToNotes);
    } else {
        const file = "./read-file.js";
        const question = "Jakiej biblioteki można użyć aby przeczytać plik .pdf?";
        await getCodeContinuationThenExtractModule(
            codeAssistant,
            moduleExtractor,
            file,
            question
        );
    }
}

run();