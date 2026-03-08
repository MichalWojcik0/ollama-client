import { PromptSenderBuilder } from "../data_model/prompt-sender.js";

    const codeAssistantSystem = `Jesteś inżynierem oprogramowania,
rozwiązujesz zadania implementacyjne z zakresu rozwoju aplikacji.
Piszesz docelowy kod bez placeholderów w odpowiedzi na treść taska i kod.`

/**
 * @param {OllamaClient} client 
 * @param {string} model 
 * @returns 
 */
export function getCodeAssistantBuilder(client, model) {
    const builder = new PromptSenderBuilder();
    builder.withSystemPrompt(codeAssistantSystem);
    if (client) {
        builder.withClient(client);
    }
    if (model) {
        builder.withModel(model);
    }
    return builder;
}