class Server {
    constructor(id) {
        this.id = id;
        this.commands = null;
    }

    setServer() {
        if (this.commandResults !== null) {
            this.commands = require("./command.js");
        } else {
            console.error("commands객체체가 안들어왔어요.");
        }
    }

    makeJSON(data) {
        const serverNames = ["test"];
        const result = serverNames.map(serverName => ({ [serverName]: data }));
        return JSON.stringify(result);
    }

    fileWrite(fileName, content) {
        const fs = require("fs");

        fs.writeFileSync(`./server/json/${fileName}.json`, this.makeJSON(content), (err) => {
            if (err) throw err;
        });
    }

    serverWork() {
        const { ifconfig, runtime, serverStatus, ping, userList, usedPort, activePort } = this.commands.getData();
        this.fileWrite("ifconfig", ifconfig);
        this.fileWrite("runtime", runtime);
        this.fileWrite("status", serverStatus);
        this.fileWrite("ping", ping);
        this.fileWrite("userList", userList);
        this.fileWrite("usedPort", usedPort);
        this.fileWrite("activePort", activePort);
        console.log("서버 실행중 . . .");
    }

    serverRun() {
        this.serverWork();
        const serverRun = setInterval(() => {
            this.serverWork();
        }, 3000);
    }

    run() {
        this.setServer();
        this.serverRun();
    }
}

const server = new Server("server");
server.run();