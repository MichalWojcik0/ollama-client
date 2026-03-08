import { OllamaClient } from "./client.js";

const ollama = new OllamaClient("http://localhost:11434", 0.7, 200)

function withModel(model) {
    return {
        chatWithTimeout: async (message, ms) => {
            return await ollama.chatWithTimeout(model, message, ms)
        }
    }
}

function constructPrompt(system, user) {
    return `${system}

<|user|>
${user}
<|assistant|>
`
}

async function run() {
    const modelRef = withModel("my-fixed-model")
    let response = "";
    while (response === "") {
        try {
            const system = `Jesteś maszyną do przekąsek.
Pod A1 są jabłka, pod A2 batony Snickers, pod A3 batony Mars.
Wydawaj produkty klientom. Odpowiedz jednym słowem.`
            const prompt = "Naciskam A2";
            response = await modelRef.chatWithTimeout(
               constructPrompt(system, prompt),
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