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
        const route_JSON = require("./route/route_JSON.js");
        const get_total_page_info = require("./route/get_total_page_info.js");

        this.app.use("/network", route_JSON("ifconfig"));
        this.app.use("/runtime", route_JSON("runtime"));
        this.app.use("/status", route_JSON("status"));
        this.app.use("/ping", route_JSON("ping"));
        this.app.use("/user_list", route_JSON("userList"));
        this.app.use("/used_port", route_JSON("usedPort"));
        this.app.use("/active_port", route_JSON("activePort"));

        // DB 영역
        this.app.use("/get_total_page_info", get_total_page_info());
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