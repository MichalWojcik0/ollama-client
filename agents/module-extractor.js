import { PromptSenderBuilder } from "../data_model/prompt-sender.js";

const moduleExtractorSystem = `Jesteś klasyfikatorem,
który z podanych instrukcji implementacji oprogramowania wyłuskuje jakie moduły
należy pozyskać z internetu aby móc kontynuować prace. Odpowiadasz komendą "npm".
W podanym tekście znajdź informację
jaki pakiet trzeba pobrać.
Odpowiadaj zwięźle, najlepiej samą nazwą, aby mogła być ona podana do systemu, który dokona właściwego pozyskania.`


/**
 * @param {OllamaClient} client 
 * @param {string} model 
 * @returns 
 */
export function getModuleExtractorBuilder(client, model) {
    const builder = new PromptSenderBuilder();
    builder.withSystemPrompt(moduleExtractorSystem);
    if (client) {
        builder.withClient(client);
    }
    if (model) {
        builder.withModel(model);
    }
    return builder;
}