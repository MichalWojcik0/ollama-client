import { OllamaClient } from "../client.js";

function constructPrompt(system, user) {
    return `${system}

<|user|>
${user}
<|assistant|>
`
}

export class PromptSender {
    /**
     * @param {string} prompt 
     * @param {number} ms timeout
     */
    async chatWithTimeout(prompt, ms) { }
}

export class PromptSenderBuilder {
    /**
     * @type {OllamaClient}
     */
    client
    /**
     * @param {OllamaClient} client
     */
    withClient(client) {
        this.client = client;
    }
    withModel(model) {
        this.model = model;
    }
    withSystemPrompt(system) {
        this.system = system;
    }
    validate() {
        if (this.client && this.model && this.system) return;
        throw "missing fields";
    }
    /**
     * @returns {PromptSender}
     */
    build() {
        return {
            chatWithTimeout: async (prompt, timeout) => {
                const completePrompt = constructPrompt(this.system, prompt);
                return await this.client.chatWithTimeout(this.model, completePrompt, timeout);
            }
        }
    }
}