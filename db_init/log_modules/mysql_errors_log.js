const [fs, path, mysql, info, sqlTemplate] = [require('fs'),
require('path'),
require('mysql2'),
require("../../src/database/info"),
require("../database/sqlTemplate")];

module.exports = () => {

    const db = mysql.createConnection(info);

    fs.readFile(path.join(__dirname, "../logs/mysql_error_log.txt"), 'utf8', (err, logs) => {
        if (err) {
            console.log(err);
            console.log("파일 읽기 실패!");
        }
        const parsingLines = logs.trim().split(/\n/);
        const insertValus = parsingLines.map(line => {
            const matchLog = line.match(/\[(.*?)\] \[(.*?)\] \[(.*?)\](.*)/);
            return [matchLog[1], matchLog[2], matchLog[3], matchLog[4].trim(), Math.floor(Math.random() * 5) + 1]
        });
        //End map

        db.query(sqlTemplate.mysql_err_log_sql, [insertValus], (err, result) => {
            if (err) {
                console.log(err);
                console.log("my_sql_error 인설트 실패!");
                return;
            }
            console.log(`Mysql_error_log  ${result.affectedRows}개의 로그가 삽입되었습니다.`);
        });
        //END query
        db.end();

    })
}