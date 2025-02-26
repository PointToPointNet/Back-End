module.exports = () => {
    const express = require("express");
    const [router, path, mysql] = [express.Router(), require('path'), require("mysql2/promise")];
    const sqlTemplate = require(path.join(__dirname, "../database/queries"))
    const dbinfo = require(path.join(__dirname, "../../src/database/info"));

    router.use(express.json());
    router.use(express.urlencoded({ extended: true }));

    router.get("/", (req, res) => {
        res.send("POST로 요청 부탁드려요 ㅎ");
    }).post("/", async (req, res) => {
        try {
            const db = await mysql.createConnection(dbinfo);
            const data = req.body;
            const { start_date, end_date } = data;
            console.log(start_date,end_date);
            const [total_all_page] = await db.query(sqlTemplate.select_total_all_sql, [start_date, end_date, start_date, end_date])

            const response = {
                total_all_page: total_all_page
            }
            res.json(response);
            await db.end();

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    })

    return router;
}