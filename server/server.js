const fs = require("fs");
const os = require("os");

const { ifconfig, runtime, serverStatus } = require("./command");



const makeJSON = (data) => {
    const serverNames = ["test"];
    const result = serverNames.map(serverName => ({ [serverName]: data }));
    return JSON.stringify(result);
}

setInterval(() => {
    // fs.writeFileSync("./server/json/memory.json", JSON.stringify(memory), (err) => {
    //     if (err) throw err;
    // });
    fs.writeFileSync("./server/json/ifconfig.json", makeJSON(ifconfig), (err) => {
        if (err) throw err;
    });
    fs.writeFileSync("./server/json/runtime.json", makeJSON(runtime), (err) => {
        if (err) throw err;
    });
    fs.writeFileSync("./server/json/status.json", makeJSON(serverStatus), (err) => {
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
