const fs = require('fs').promises;
const path = require('path');
const mysql = require('mysql2');
const info = require("../../src/database/info");
const sqlTemplate = require("../sql/sqlTemplate");
const parseApacheErrData = require("../utils/parseApacheErrData");

class ApacheErrorLogProcessor {
    constructor(id) {
        this.id = id;
        this.db = mysql.createConnection(info);
    }

    async readFile() {
        const filePath = path.join(__dirname, '../logs/apache_error_log.txt');
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return data;
        } catch (err) {
            console.log("파일 읽기 실패!!", err);
            throw err;
        }
    }

    parsingLogs(string) {
        if (!string) {
            console.log("파일에 데이터가 없습니다.");
            return [];
        }
        const logLines = string.trim().split('\n');
        const insertValues = logLines.map(line => {
            const logMatch = line.match(/\[(.*?)\] \[(.*?)\] (\[(.*?)\] )?(.*)/);
            if (!logMatch) return null;
            const logTime = parseApacheErrData(logMatch[1]);
            // logMatch[4]가 없으면 null 처리
            return [logTime, logMatch[2], logMatch[4] || null, logMatch[5], Math.floor(Math.random() * 5) + 1];
        }).filter(v => v !== null);
        return insertValues;
    }

    async insertLogs(insertValues) {
        const sql = sqlTemplate.apach_err_log_sql;
        return new Promise((resolve, reject) => {
            this.db.query(sql, [insertValues], (err, result) => {
                if (err) {
                    console.log("Data insert failed!!", err);
                    this.db.end();
                    return reject(err);
                }
                console.log(`Apache_err_log ${result.affectedRows}개의 로그가 삽입되었습니다.`);
                this.db.end();
                resolve(result);
            });
        });
    }

    async run() {
        try {
            const fileContent = await this.readFile();
            const values = this.parsingLogs(fileContent);
            if (values.length === 0) {
                console.log("저장할 로그가 없습니다.");
                return;
            }
            await this.insertLogs(values);
        } catch (err) {
            console.log("오류 발생:", err);
        }
    }
}

module.exports = ApacheErrorLogProcessor;