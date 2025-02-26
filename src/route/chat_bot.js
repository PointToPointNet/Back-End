class ChatBot {
    constructor(id) {
        this.id = id;
        this.router = null;
    }

    init() {
        const express = require("express");
        this.router = express.Router();
    }

    prompt() {
        return `
            내가 질문을 하면 네트워크나 서버에 관련된 질문에만 대답해줘. 
            만약 네트워크나 서버에 관련된 질문이 아니면 "네트워크에 대한 질문을 해주세요."
            라고 대답해줘 나의 질문은 : 
        `.trim();
    }

    async callChatBot(req, res, question = "") {
        const OpenAI = require("openai");
        const openai = new OpenAI();
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    // { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: `${this.prompt()}${question}` },
                ],
            });

            console.log(completion.choices[0].message.content);
            // res.json({ response: completion.choices[0].message.content });
            res.send(completion.choices[0].message.content);

        } catch (error) {
            console.error("Error calling OpenAI API:", error);
            res.status(500).json({ error: "Failed to generate response." });
        }
    }

    active() {
        this.router.get("/", (req, res) => {
            this.callChatBot(req, res, "RX TX 그래프가 나타내는 의미가 뭘까?");
        }).post("/", (req, res) => {
            const { question } = req.body;
            this.callChatBot(req, res, question);
        });
    }

    run() {
        this.init();
        this.active();

        return this.router;
    }
}

module.exports = ChatBot;