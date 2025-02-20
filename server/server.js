const fs = require("fs");
const os = require("os");

const {ifconfig} = require("./command")

setInterval(() => {
    const memory = {
        "usingMemory": (os.totalmem() - os.freemem()),
        "totalMemory": os.totalmem(),
    };
    console.log(memory);
    fs.writeFileSync("./src/json/memory.json", JSON.stringify(memory) ,(err) => {
        if (err) throw err;
    });
    fs.writeFileSync("./src/json/ifconfig.json", JSON.stringify(ifconfig), (err) => {
        if (err) throw err;
    });
}, 3000);
