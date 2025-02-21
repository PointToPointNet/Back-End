const { port } = require("./config/daemon.js");
const connectionInfo = require("./database/info.js");
const sqlQuery = require("./database/queries.js");

const express = require("express");
const mysql = require("mysql2");
const fs = require("fs");
const cors = require("cors");

// const connection = mysql.createConnection(connectionInfo);

const app = express();

app.use(cors({
    origin: '*',
}));

app.get("/", (req, res) => {
    res.send("Hello world");
});

app.post("/memory", (req, res) => {
    fs.readFile(`./json/memory.json`, (err, data) => { // 되던게 안되는 매직
        console.log(data);
        res.json(data);
    });
});

app.get("/memory", (req, res) => {
    fs.readFile(`./server/json/memory.json`, "utf-8",(err, data) => {
        console.log(data);
        res.json(JSON.parse(data));
    });
});

app.get("/network", (req, res) => {
    fs.readFile(`./server/json/ifconfig.json`, "utf-8",(err, data) => {
        console.log(data);
        res.json(JSON.parse(data));
    });
});

app.get("/runtime", (req, res) => {
    fs.readFile(`./server/json/runtime.json`, "utf-8",(err, data) => {
        console.log(data);
        res.json(JSON.parse(data));
    });
});

app.get("/ping", (req, res) => {
    fs.readFile(`./server/json/ping.json`, "utf-8",(err, data) => {
        console.log(data);
        res.json(JSON.parse(data));
    });
});

app.get("/userlist", (req, res) => {
    fs.readFile(`./server/json/userList.json`, "utf-8",(err, data) => {
        console.log(data);
        res.json(JSON.parse(data));
    });
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});