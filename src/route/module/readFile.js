module.exports = (fileName, req, res) => {
    const fs = require("fs");

    fs.readFile(`./server/json/${fileName}.json`, "utf-8", (err, data) => {
        res.json(JSON.parse(data));
    });
}