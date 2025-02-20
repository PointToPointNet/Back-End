const fs = require("fs");
const os = require("os");

const { ifconfig, runtime } = require("./command");

setInterval(() => {
    const memory = {
        "usingMemory": (os.totalmem() - os.freemem()),
        "totalMemory": os.totalmem(),
    };

    `{
        "memory": "~~~",
        "cpu": "~~~",
        "disk": "~~~",
    }`
    console.log(memory);

    fs.writeFileSync("./server/json/memory.json", JSON.stringify(memory), (err) => {
        if (err) throw err;
    });
    fs.writeFileSync("./server/json/ifconfig.json", JSON.stringify(ifconfig), (err) => {
        if (err) throw err;
    });
    fs.writeFileSync("./server/json/runtime.json", JSON.stringify(runtime), (err) => {
        if (err) throw err;
    });
}, 3000);


/*
짬통
fs.writeFileSync("./src/json/memory.json", JSON.stringify(memory) ,(err) => {
        if (err) throw err;
    });
    fs.writeFileSync("./src/json/ifconfig.json", JSON.stringify(ifconfig), (err) => {
        if (err) throw err;
    });

*/
