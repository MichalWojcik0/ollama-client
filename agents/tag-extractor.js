import { PromptSenderBuilder } from "../data_model/prompt-sender.js";
import { OllamaClient } from "../client.js";

    const tagExtractorSystem = `Zwróć tylko JSON.
Jesteś klasyfikatorem,
który analizuje dokumenty i pozyskuje z nich tagi. Tag to jakiś tekst okolony symbolami.
Odpowiadasz zwracając dokładną treść tagów oddzieloną przecinkami w raz z ich symbolami.
Konsekwencje pominięcia jakiegoś tagu są straszliwe dla nas.
Odpowiadaj tagami oddzielonymi przecinkami.`

/**
 * @param {OllamaClient} client 
 * @param {string} model 
 * @returns 
 */
export function getTagExtractorBuilder(temp, tok, model) {
    const client = new OllamaClient();
    client.withTemperature(temp);
    client.withTokenCount(tok);
    const builder = new PromptSenderBuilder();
    builder.withSystemPrompt(tagExtractorSystem);
    builder.withClient(client);
    if (model) {
        builder.withModel(model);
    }
    return builder;
}