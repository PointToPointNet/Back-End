module.exports = (fileName) => {
    const express = require("express");
    const readFile = require("./module/readFile.js");

    const router = express.Router();

    router.get("/", (req, res) => {
        readFile(fileName, req, res);
    }).post("/", (req, res) => {
        readFile(fileName, req, res);
    });

    return router;
}