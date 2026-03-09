import { PromptSenderBuilder } from "../data_model/prompt-sender.js";
import { OllamaClient } from "../client.js";

    const infoExtractorSystem = `Zwróć tylko JSON.
Jesteś klasyfikatorem,
który analizuje dokumenty i pozyskuje z nich kluczowe informacje. 
Dysponujesz listą informacji potrzebnych do pozyskania z dokumentu.
Zwróć JSON przypisujący informację do danego tagu.`

/**
 * @param {number} temp
 * @param {number} tok
 * @param {OllamaClient} client 
 * @param {string} model 
 * @returns 
 */
export function getInformationExtractorBuilder(temp, tok, model) {
    const client = new OllamaClient();
    client.withTemperature(temp);
    client.withTokenCount(tok);
    const builder = new PromptSenderBuilder();
    builder.withSystemPrompt(infoExtractorSystem);
    builder.withClient(client);
    if (model) {
        builder.withModel(model);
    }
    return builder;
}