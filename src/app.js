const { port } = require("./config/daemon.js");
const connectionInfo = require("./database/info.js");
const sqlQuery = require("./database/queries.js");
const express = require("express");
const mysql = require("mysql");
const fs = require("fs");
const cors = require("cors");

const connection = mysql.createConnection(connectionInfo);

const app = express();

app.use(cors({
    origin: '*',
}));

app.get("/", (req, res) => {
    res.send("Hello world");
});

app.get("/database", (req, res) => {
    connection.query(sqlQuery.select, (err, data) => {
        if (err) throw err;
        res.json(data);
    });
});

app.post("/memory", (req, res) => {
    fs.readFile(`./json/memory.json`, (err, data) => {
        console.log(data);
        res.json(data);
    });
});

app.get("/memory", (req, res) => {
    fs.readFile(`./src/json/memory.json`, "utf-8",(err, data) => {
        console.log(data);
        res.json(data);
    });
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});