const fs = require('fs').promises;
const path = require('path');
const mysql = require('mysql2');
const info = require("../../src/database/info");
const sqlTemplate = require("../sql/sqlTemplate");

class MysqlErrorLogProcessor {
    constructor(id) {
        this.id = id;
        this.db = mysql.createConnection(info);
    }

    async readFile() {
        const filePath = path.join(__dirname, "../logs/mysql_error_log.txt");
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return data;
        } catch (err) {
            console.log("파일 읽기 실패!", err);
            throw err;
        }
    }

    parsingLogs(logs) {
        if (!logs) {
            console.log("로그 데이터가 없습니다.");
            return [];
        }
        const parsingLines = logs.trim().split(/\n/);
        const insertValues = parsingLines.map(line => {
            const matchLog = line.match(/\[(.*?)\] \[(.*?)\] \[(.*?)\](.*)/);
            if (!matchLog) return null;
            return [
                matchLog[1],
                matchLog[2],
                matchLog[3],
                matchLog[4].trim(),
                Math.floor(Math.random() * 5) + 1
            ];
        }).filter(v => v !== null);
        return insertValues;
    }

    async insertLogs(insertValues) {
        const sql = sqlTemplate.mysql_err_log_sql;
        return new Promise((resolve, reject) => {
            this.db.query(sql, [insertValues], (err, result) => {
                if (err) {
                    console.log("mysql_error 인설트 실패!", err);
                    this.db.end();
                    return reject(err);
                }
                console.log(`Mysql_error_log ${result.affectedRows}개의 로그가 삽입되었습니다.`);
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

module.exports = MysqlErrorLogProcessor;
