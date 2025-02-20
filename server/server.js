const fs = require("fs");
const os = require("os");

setInterval(() => {
    const memory = {
        "usingMemory": (os.totalmem() - os.freemem()),
        "totalMemory": os.totalmem(),
    };
    console.log(memory);
    fs.writeFileSync("./src/json/memory.json", JSON.stringify(memory) ,(err) => {
        if (err) throw err;
    });
}, 3000);
