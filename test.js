import { createRawPrompt, promptUntilNotEmpty } from "./prompt-utils.js";
import { BIELIK_1_5B, BIELIK_7B, BIELIK_7B_Q4 } from "./model-identifiers.js";
import { getTagExtractorBuilder } from "./agents/tag-extractor.js";
import { getInformationExtractorBuilder, infoExtractorSystem } from "./agents/information-extractor.js";

const tagExtractor = getTagExtractorBuilder(0.2, 100, BIELIK_7B_Q4).build();
const infoExtractor = getInformationExtractorBuilder(0.2, 1000, BIELIK_7B).build();

let id = 1;
function printResponse(res) {
    console.log("with tries: " + res.tries);
    console.log(id + ": " + res.response);
    id++;
}

/**
 * @param {string} tagList 
 */
function tagListToJson(tagList) {
    tagList = tagList.replaceAll("}}{{", "}}\n{{");
    tagList = tagList.replaceAll("{{", "\"").replaceAll("}}", "\"");
    tagList = tagList.split("\n").join(" : \"\",\n") + ": \"\"";
    tagList = "{\n  \"informacje\": {\n" + tagList + "\n}\n}";
    return tagList;
}

function formQuestion(tag) {
    return "Zadanie:\n" +
    "Znajdź " + tag + " w powyższym tekście";
}

async function extractTagsFromFile(
    pathToTemplate,
    pathToNote
) {
    const fileArg = { type: "docx", value: pathToTemplate };
    const rawPrompt = await createRawPrompt(fileArg);
    console.log("rprompt: " + rawPrompt);
    const res = await promptUntilNotEmpty(() => tagExtractor.chatWithTimeout(rawPrompt, 10000));
    printResponse(res);
    let tags = res.response;
    const jsonForm = tagListToJson(tags);
    let isJSON = true;
    try {
        const js = JSON.parse(jsonForm);
        const keys = Object.keys(js.informacje);
        console.log("keys: " + keys);
        for(const key of keys) {
            const fileArg2 = { type: "docx", value: pathToNote };
            const sytemRepeat = { type: "system", value: infoExtractorSystem };
            const question = { type: "text", value: formQuestion(key) };
            const questionPrompt = await createRawPrompt(fileArg2, sytemRepeat, question);
            const answer = await promptUntilNotEmpty(() => infoExtractor.chatWithTimeout(questionPrompt, 10000));
            printResponse(answer);
            console.log("concrete pair: " + key + " - " + answer.response);
        }
    } catch (SyntaxError) {
        isJSON = false;
    }
    const tmsg = isJSON ? "valid JSON" : "invalid JSON";
    console.log(tmsg + " : " + tags);
    // const tagArg = { type: "text", value: tags };
    // const fileArg2 = { type: "docx", value: pathToNote };
    // const sytemRepeat = { type: "system", value: infoExtractorSystem };
    // const rawPrompt2 = await createRawPrompt(tagArg, fileArg2, sytemRepeat);
    // const res2 = await promptUntilNotEmpty(() => infoExtractor.chatWithTimeout(rawPrompt2, 20000));
    // printResponse(res2);
}

async function run() {
    const args = process.argv;
    console.log("args");
    console.log(args);
    console.log(args[2]);
    if (args.length > 4 && args[2] === "tags") {
        const pathToTemplate = args[3];
        const pathToNotes = args[4];
        extractTagsFromFile(pathToTemplate, pathToNotes);
    }
}

run();