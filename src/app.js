class Service {
    constructor(id) {
        this.id = id;
        this.express = null;
        this.app = null;
    }

    init() {
        const cors = require("cors");

        this.express = require("express");
        this.app = this.express();

        this.app.use(cors({ origin: '*' }));
        this.app.use(this.express.json());
        this.app.use(this.express.urlencoded({ extended: true }));
    }

    runServer() {
        const path = require("path");
        const { spawn } = require("child_process");

        const serverProcess = spawn("node", [path.join(__dirname, "..", "server", "server.js")], {
            stdio: "inherit",
        });
    }

    route() {
        const path = require("path");
        const route_JSON = require(path.join(__dirname, "/route", "/route_JSON.js"));
        const get_total_page_info = require(path.join(__dirname, "/route", "/get_total_page_info.js"));
        const get_total_all_info = require(path.join(__dirname, "/route", "/get_total_all_page.js"));
        const ChatBot = require(path.join(__dirname, "/route", "/chat_bot.js"));

        // CLI command Area
        this.app.use("/server", route_JSON("server"));
        this.app.use("/network", route_JSON("ifconfig"));
        this.app.use("/runtime", route_JSON("runtime"));
        this.app.use("/status", route_JSON("status"));
        this.app.use("/ping", route_JSON("ping"));
        this.app.use("/user_list", route_JSON("userList"));
        this.app.use("/used_port", route_JSON("usedPort"));
        this.app.use("/active_port", route_JSON("activePort"));

        ` // Router Explanation
            /network => ifconfig 값 ifconfig.json
            /runtime => 서버 실행 시간(uptime) runtime.json
            /status => memory, cpu, disk 정보 status.json
            /ping => 네트워크 지연 시간(ping -c 1 8.8.8.8) ping.json
            /user_list => 현재 접속 중인 유저(last) userList.json
            /used_port => n번 보트에 m개 접속중(ss) usedPort.json
            /active_port => 현재 열려있는 모든 포트 확인(netstat) activePort.json
        `

        // DB Area
        this.app.use("/get_total_page_info", get_total_page_info());
        this.app.use("get_total_all_info", get_total_all_info());

        // Chat Bot Area
        const chat_bot = new ChatBot("chat_bot")
        this.app.use("/chat_bot", chat_bot.run());
    }

    listen() {
        const { port } = require("./config/daemon.js");

        this.app.listen(port, () => {
            console.log(`http://localhost:${port}`);
        });
    }

    service() {
        this.init();
        this.runServer();
        this.route();
        this.listen();
    }
}

const service = new Service("service");
service.service();