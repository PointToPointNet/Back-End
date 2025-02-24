module.exports = () => {
    const express = require("express");
    const [router, path, mysql] = [ express.Router(), require('path'), require("mysql2/promise")];
    const dbinfo = require(path.join(__dirname, "../../src/database/info"));
    const sqlTemplate = require(path.join(__dirname, "../database/queries"))

    router.use(express.json());
    router.use(express.urlencoded({ extended: true }));

    router.get("/", async (req, res) => {
        // try {
        //     const db = await mysql.createConnection(dbinfo);
        //     //1번서버의 통계자료의 조회일자가 2월1일부터 5일까지 라고 가정하자. 
        //     const start_date = '2025-02-01';
        //     const end_date = '2025-02-05'
        //     const server_id = "1";

        //     const [totalResult] = await db.query(sqlTemplate.select_total_table_sql, [start_date, end_date, server_id]);
        //     const [loginResult] = await db.query(sqlTemplate.select_login_info_sql, [start_date, end_date, server_id, start_date, end_date, server_id]);
        //     const [criticalResult] = await db.query(sqlTemplate.select_critical_log_sql, [start_date, end_date, server_id]);
        //     const [apacheErrResult] = await db.query(sqlTemplate.select_apache_err, [start_date,end_date, server_id])
        //     const [select_mysql_err] = await db.query(sqlTemplate.select_mysql_err, [start_date,end_date, server_id])
        //     const [select_ufw_err] = await db.query(sqlTemplate.select_ufw_err, [start_date,end_date, server_id])
        //     const [select_auth_err] = await db.query(sqlTemplate.select_auth_err, [start_date,end_date, server_id])

        //     const total_response = {
        //         total_info: totalResult,
        //         login_info: loginResult,
        //         critical_log: criticalResult,
        //         apacheErrResult: apacheErrResult,
        //         select_mysql_err: select_mysql_err,
        //         select_ufw_err: select_ufw_err,
        //         select_auth_err: select_auth_err
        //     };

        //     res.json(total_response);
        //     await db.end();
        // } catch (err) {
        //     console.error(err);
        //     res.status(500).json({ error: err.message });
        // }
    }).post("/", async (req, res) => {
        try {
            const db = await mysql.createConnection(dbinfo);
            const data = req.body;
            const {start_date, end_date, server_id} = data;

            const [totalResult] = await db.query(sqlTemplate.select_total_table_sql, [start_date, end_date, server_id]);
            const [loginResult] = await db.query(sqlTemplate.select_login_info_sql, [start_date, end_date, server_id, start_date, end_date, server_id]);
            const [criticalResult] = await db.query(sqlTemplate.select_critical_log_sql, [start_date, end_date, server_id]);
            const [select_apache_err] = await db.query(sqlTemplate.select_apache_err, [start_date,end_date, server_id])
            const [select_mysql_err] = await db.query(sqlTemplate.select_mysql_err, [start_date,end_date, server_id])
            const [select_ufw_err] = await db.query(sqlTemplate.select_ufw_err, [start_date,end_date, server_id])
            const [select_auth_err] = await db.query(sqlTemplate.select_auth_err, [start_date,end_date, server_id])

            const total_response = {
                total_info: totalResult,
                login_info: loginResult,
                critical_log: criticalResult,
                select_apache_err: select_apache_err,
                select_mysql_err: select_mysql_err,
                select_ufw_err: select_ufw_err,
                select_auth_err: select_auth_err
            };

            res.json(total_response);
            await db.end();
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}