import { PromptSenderBuilder } from "../data_model/prompt-sender.js";
import { OllamaClient } from "../client.js";

    const codeAssistantSystem = `Jesteś inżynierem oprogramowania,
rozwiązujesz zadania implementacyjne z zakresu rozwoju aplikacji.
Piszesz docelowy kod bez placeholderów w odpowiedzi na treść taska i kod.
Odpowiadasz samym kodem.`

/**
 * @param {OllamaClient} client 
 * @param {string} model 
 * @returns 
 */
export function getCodeAssistantBuilder(temp, tok, model) {
    const client = new OllamaClient();
    client.withTemperature(temp);
    client.withTokenCount(tok);
    const builder = new PromptSenderBuilder();
    builder.withSystemPrompt(codeAssistantSystem);
    builder.withClient(client);
    if (model) {
        builder.withModel(model);
    }
    return builder;
}