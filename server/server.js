class Server {
    constructor(id) {
        this.id = id;
        // this.commands = null;
        this.serverList = null;
        this.reloadTime = 3;
    }

    setServer() {
        const Commands = require("./command.js");

        const serverName = ["test", "c1", "c2", "c3", "c4"];
        this.serverList = serverName.map((server) => {
            return new Commands(server);
        });
    }

    fileWrite(fileName, content) {
        const fs = require("fs");

        fs.writeFileSync(`./json/${fileName}.json`, JSON.stringify(content), (err) => {
            if (err) throw err;
        });
    }

    // fileRead(fileName) {
    //     const fs = require("fs");

    //     fs.writeFileSync(`./json/${fileName}.json`, (err, data) => {
    //         if (err) throw err;
    //         return data;
    //     });
    // }
    // getPrevIfconfig(name = "ifconfig") {
    //     const prevPackets = this.fileRead(name) || 0;
        
    //     console.log(prevPackets);
    //     return prevPackets;
    // }

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