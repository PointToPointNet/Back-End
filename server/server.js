class Server {
    constructor(id) {
        this.id = id;
        // this.commands = null;
        this.serverList = null;
    }

    setServer() {
        const Commands = require("./command.js");

        const serverName = ["test", "c1", "c2", "c3", "c4"];
        this.serverList = serverName.map((server) => {
            return new Commands(server);
        });
    }

    // makeJSON(data) {
    //     const serverNames = ["test", "c1", "c2", "c3", "c4"];
    //     const result = serverNames.map(serverName => ({ [serverName]: data }));
    //     return JSON.stringify(result);
    // }

    makeJSON(data) {
        console.log(data);
        return this.serverList.map(async (server) => {
            return {
                [server]: data
            }
        });
    }

    fileWrite(fileName, content) {
        const fs = require("fs");

        fs.writeFileSync(`./json/${fileName}.json`, JSON.stringify(content), (err) => {
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
        }, 3000);
    }

    run() {
        this.setServer();
        this.serverRun();
    }
}

const server = new Server("server");
server.run();