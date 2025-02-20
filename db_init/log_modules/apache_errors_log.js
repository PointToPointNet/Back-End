const [fs, path, mysql, info, sqlTemplate, parseApacheErrData] = [require('fs'),
require('path'),
require('mysql'),
require("../../src/database/info"),
require("../database/sqlTemplate"),
require("../utils/parseApacheErrData")];


const db = mysql.createConnection(info);



module.exports = () => {

    fs.readFile(path.join(__dirname, '../logs/apache_error_log.txt'), 'utf8', (err, data) => {
        if (err) {
            console.log("파일 읽기 실패!! " + err);
        }
        const logLines = data.trim().split('\n');
        const insertValues = logLines.map(line => {
            const logMatch = line.match(/\[(.*?)\] \[(.*?)\] (\[(.*?)\] )?(.*)/);

            const logTime = parseApacheErrData(logMatch[1]);
            return [logTime, logMatch[2], logMatch[4], logMatch[5], Math.floor(Math.random() * 5) + 1]
        });
        //End map
        const sql = sqlTemplate.apach_err_log_sql;
        db.query(sql, [insertValues], (err, result) => {
            if (err) {
                console.log(err);
                console.log("Data insert failed!!");
                return;
            }
            console.log(`Apache_err_log  ${result.affectedRows}개의 로그가 삽입되었습니다.`);
            db.end();
        })
    })

}