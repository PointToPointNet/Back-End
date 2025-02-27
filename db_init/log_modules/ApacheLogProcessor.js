const fs = require('fs').promises;
const path = require('path');
const mysql = require('mysql2');
const info = require("../../src/database/info");
const sqlTemplate = require("../sql/sqlTemplate");
const parseApacheData = require("../utils/parseApacheData");

class ApacheLogProcessor {
    constructor(id) {
        this.id = id;
    }
    async readFile() {
        const filePath = path.join(__dirname, "../logs/apach_log.txt");
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return data;
        } catch (err) {
            console.log("파일 읽기 실패!", err);
            throw err;
        }
    }
    parsingLogs(string) {
        if (!string) {
            console.log("파일에 데이터가 없습니다.");
            return [];
        }
        const parsingLines = string.trim().split('\n');
        if (parsingLines.length === 0) {
            console.log("파일에 데이터가 없습니다.");
            return [];
        }
        const insertValues = [];
        parsingLines.forEach(line => {
            const splitedLog = line.split(' ');

            const parseDate = parseApacheData(splitedLog[3].replace("[", ""));
            const ip_address = splitedLog[0];
            const access_time = parseDate;
            const request_method = splitedLog[5].replace('"', "");
            const request_url = splitedLog[6];
            const http_version = splitedLog[7].replace('"', "");
            const status_code = splitedLog[8];
            const response_size = splitedLog[9];
            const referrer = splitedLog[10] === `"-"` ? null : splitedLog[10];
            const user_agent = (splitedLog.slice(11).join(" ")).replace(/"/g, "");

            insertValues.push([
                ip_address, access_time, request_method, request_url,
                http_version, status_code, response_size, referrer, user_agent,
                Math.floor(Math.random() * 5) + 1
            ]);
        });
        return insertValues;
    }
    async insertLogs(insertValues) {
        const db = mysql.createConnection(info);
        const sql = sqlTemplate.apach_log_sql;
        return new Promise((resolve, reject) => {
            db.query(sql, [insertValues], (err, result) => {
                if (err) {
                    console.log("Data insert failed!!", err);
                    db.end();
                    return reject(err);
                }
                console.log(`Apache_log ${result.affectedRows}개의 로그가 삽입되었습니다.`);
                db.end();
                resolve(result);
            });
        });
    }
    async run() {
        try {
            const fileContent = await this.readFile();
            const values = this.parsingLogs(fileContent);
            if (values.length === 0) return;
            await this.insertLogs(values);
        } catch (err) {
            console.log("오류 발생:", err);
        }
    }
}

module.exports = ApacheLogProcessor;