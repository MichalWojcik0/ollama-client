
class OllamaClient {
    constructor(baseUrl = "http://localhost:11434", temperature = 0.1, num_predict = 100) {
        this.baseUrl = baseUrl;
        this.temperature = temperature;
        this.num_predict = num_predict;
    }

    async chat(model, message) {
        const res = await fetch(`${this.baseUrl}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model,
                stream: false,
                messages: [
                    { role: "user", content: message }
                ],
                options: {
                    num_predict: this.num_predict,
                    temperature: this.temperature,
                }
            })
        })

        const data = await res.json()
        return data.message?.content || ""
    }

    async chatWithTimeout(model, message, timeoutMs = 10000) {
        const controller = new AbortController()

        const timeout = setTimeout(() => {
            controller.abort()
        }, timeoutMs)

        try {
            const res = await fetch("http://localhost:11434/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                signal: controller.signal,
                body: JSON.stringify({
                    model,
                    stream: false,
                    messages: [
                        { role: "user", content: message }
                    ],
                    options: {
                        num_predict: this.num_predict,
                        temperature: this.temperature,
                    }
                })
            })

            const data = await res.json()
            return data.message?.content || ""
        } catch (err) {
            if (err.name === "AbortError") {
                throw new Error("Ollama request timed out")
            }
            throw err
        } finally {
            clearTimeout(timeout)
        }
    }

    async chatStream(model, message, onToken) {
        const res = await fetch(`${this.baseUrl}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model,
                stream: true,
                messages: [
                    { role: "user", content: message }
                ],
                options: {
                    num_predict: this.num_predict,
                    temperature: this.temperature,
                }
            })
        })

        const reader = res.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split("\n").filter(Boolean)

            for (const line of lines) {
                const json = JSON.parse(line)
                const token = json.message?.content
                if (token) onToken(token)
            }
        }
    }
}
const ollama = new OllamaClient("http://localhost:11434", 0.7, 200)

async function run() {
    let response = "";
    while (response === "") {
        try {
            response = await ollama.chatWithTimeout(
                "bielik-fixed",
                "<|user|>Gdzie w Warszawie można kupić lornetkę?<|system|>",
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