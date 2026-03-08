import { OllamaClient } from "./client.js";

const ollama = new OllamaClient("http://localhost:11434", 0.7, 200)

function withModel(model) {
    return {
        chatWithTimeout: async (message, ms) => {
            return await ollama.chatWithTimeout(model, message, ms)
        }
    }
}

async function run() {
    let response = "";
    while (response === "") {
        try {
            response = await ollama.chatWithTimeout(
                "bielik-fixed",
`Jesteś pomocnym przewodnikiem.
<|user|>
Gdzie w Warszawie można kupić lornetkę?
<|assistant|>`,
                10000,
            )
        }
        catch (timeout) {
            //ignore
        }
    }

    console.log("res: " + response)
}

run()