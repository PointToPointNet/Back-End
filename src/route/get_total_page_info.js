module.exports = () => {
    const express = require("express");

    const router = express.Router();

    router.get("/", (req, res) => {
        res.send("Hello DB");
    }).post("/", (req, res) => {
        // 
    });

    return router;
}