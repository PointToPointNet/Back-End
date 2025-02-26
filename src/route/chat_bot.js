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
            내가 질문을 하면 최대한 네트워크나 서버에 관련된 질문에만 대답해줘. 
            만약 네트워크나 서버에 관련된 질문이 아니라면 네트워크에 대한 질문을 해주세요. 같은 느낌으로 대답해줘
            나의 질문은 : 
        `.trim();
    }

    async callChatBot(question = "") {
        require("dotenv").config();
        const OpenAI = require("openai");
        // console.log(first)
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    // { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: `${this.prompt()}${question}` },
                ],
            });

            return completion.choices[0].message;
        } catch (error) {
            return error;
        }
    }

    active() {
        this.router.get("/", async (req, res) => {
            const answer = await this.callChatBot("RX TX 그래프가 나타내는 의미가 뭘까?");
            res.send(answer);
        }).post("/", async (req, res) => {
            const { question } = req.body;
            console.log(question)
            const answer = await this.callChatBot(question);
            console.log("질문", question);
            console.log("대답", answer);

            res.send(answer);
        });
    }

    run() {
        this.init();
        this.active();

        return this.router;
    }
}

module.exports = ChatBot;