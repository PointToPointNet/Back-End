const [fs, path, mysql, info, sqlTemplate] = [require('fs'),
    require('path'),
    require('mysql2'),
    require("../../src/database/info"),
    require("../database/sqlTemplate")];
    
const parseApacheData = require("../utils/parseApacheData");

module.exports = () => {
    let string = "";
    const filePath = path.join(__dirname, "../logs/apach_log.txt");
    const db = mysql.createConnection(info);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.log("파일 읽기 실패!");
            return;
        }
        string = data;

        const parsinglines = string.trim().split('\n');

        if (parsinglines.length === 0) {
            console.log("파일에 데이터가 없습니다.");
            return;
        }

        const insertValues = [];

        parsinglines.forEach(line => {
            const splitedLog = line.split(' ');

            const parseDate = parseApacheData(splitedLog[3].replace("[" , ""));

            const ip_address = splitedLog[0];
            const access_time = parseDate;
            const request_method = splitedLog[5].replace('"', "");
            const request_url = splitedLog[6];
            const http_version = splitedLog[7].replace('"', "");;
            const status_code = splitedLog[8];
            const response_size = splitedLog[9];
            const referrer = splitedLog[10] == `"-"` ? null : splitedLog[10];
            const user_agent = (splitedLog.slice(11).join(" ")).replace(/"/g, "");

            insertValues.push([
                ip_address, access_time, request_method, request_url, http_version, status_code, response_size, referrer, user_agent, Math.floor(Math.random() * 5)+1
            ]);

        });
        //END forEach
        const sql = sqlTemplate.apach_log_sql;
        db.query(sql, [insertValues],(err,result)=>{
            if(err){
                console.log("Data insert failed!!");
                return;
            }
            console.log(`Apache_log  ${result.affectedRows}개의 로그가 삽입되었습니다.`);
            db.end();
        })
    });
    //END readFile
}

