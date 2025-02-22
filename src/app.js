class Service {
    constructor(id) {
        this.id = id;
        this.express = null;
        this.app = null;
    }

    init() {
        this.express = require("express");
        this.app = this.express();

        const cors = require("cors");
        this.app.use(cors({
            origin: '*',
        }));
    }

    route() {
        const router = require("./route/route_JSON.js");

        this.app.use("/network", router("ifconfig"));
        this.app.use("/runtime", router("runtime"));
        this.app.use("/status", router("status"));
        this.app.use("/ping", router("ping"));
        this.app.use("/userlist", router("userList"));
    }

    listen() {
        const { port } = require("./config/daemon.js");

        this.app.listen(port, () => {
            console.log(`http://localhost:${port}`);
        });
    }

    service() {
        this.init();
        this.route();
        this.listen();
    }
}

const service = new Service("service");
service.service();