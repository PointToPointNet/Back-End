class Server {
    constructor(id) {
        this.id = id;
        // this.commands = null;
        this.serverList = null;
        this.reloadTime = 3;
    }

    setServer() {
        const Commands = require("./command.js");

        const serverName = ["kkms", "peter", "lauren", "JUH", "SHJ"];
        this.serverList = serverName.map((server) => {
            return new Commands(server);
        });

        this.fileWrite("server", this.serverList.map((server, id_index) => {
            return { id: id_index + 1, name: server.id };
        }));
    }

    fileWrite(fileName, content) {
        const path = require("path");
        const fs = require("fs");

        fs.writeFileSync(path.join(__dirname, "json", `${fileName}.json`), JSON.stringify(content), (err) => {
            if (err) throw err;
        });
    }

    async serverWork() {
        const serverDataList = [];

        for (const server of this.serverList) {
            serverDataList.push({ id: server.id, data: await server.getData() });
        }

        const dataCollections = { // fileName, serverData
            ifconfig: "ifconfig",
            runtime: "runtime",
            status: "serverStatus",
            ping: "ping",
            userList: "userList",
            usedPort: "usedPort",
            activePort: "activePort",
        };

        for (const fileName in dataCollections) {
            this.fileWrite(fileName, serverDataList.map(serverData => {
                const { id, data } = serverData;
                return { [id]: data[dataCollections[fileName]] }
            }));
        }

        console.log("서버 실행중 . . .");
    }

    serverRun() {
        this.serverWork();
        const serverRun = setInterval(() => {
            this.serverWork();
        }, this.reloadTime * 1000);
    }

    run() {
        this.setServer();
        this.serverRun();
    }
}

const server = new Server("server");
server.run();