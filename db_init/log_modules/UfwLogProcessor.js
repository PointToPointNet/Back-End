const fs = require('fs').promises;
const path = require('path');
const mysql = require('mysql2');
const info = require("../../src/database/info");
const sqlTemplate = require("../sql/sqlTemplate");

class UfwLogProcessor {
    constructor() {
        this.db = mysql.createConnection(info);
    }

    async readFile() {
        const filePath = path.join(__dirname, "../logs/ufw_log.txt");
        try {
            const logs = await fs.readFile(filePath, 'utf8');
            return logs;
        } catch (err) {
            console.error("ufw.log 파일 읽기 실패!", err);
            throw err;
        }
    }

    parseLogs(logs) {
        if (!logs) {
            console.error("로그 데이터가 없습니다.");
            return [];
        }
        const parsingLines = logs.trim().split(/\n/);
        const insertValues = parsingLines.map(line => {
            const matchLog = line.match(/\[(.*?)\] \[Server ID: (\d+)\] \[SRC: (.*?):(.*?)\] -> \[DST: (.*?):(.*?)\] \[PROTO: (.*?)\] \[ACTION: (.*?)\]/);
            if (!matchLog) return null;
            const log_time = matchLog[1];
            const server_id = parseInt(matchLog[2]);
            const src_ip = matchLog[3];
            const src_port = isNaN(parseInt(matchLog[4])) ? null : parseInt(matchLog[4]);
            const dst_ip = matchLog[5];
            const dst_port = isNaN(parseInt(matchLog[6])) ? null : parseInt(matchLog[6]);
            const protocol = matchLog[7];
            const action = matchLog[8];
            return [log_time, server_id, src_ip, src_port, dst_ip, dst_port, protocol, action];
        }).filter(v => v !== null);
        return insertValues;
    }

    async insertLogs(insertValues) {
        const sql = sqlTemplate.ufw_log_sql;
        return new Promise((resolve, reject) => {
            this.db.query(sql, [insertValues], (err, result) => {
                if (err) {
                    console.error("ufw.log 인설트 실패!!", err);
                    this.db.end();
                    return reject(err);
                }
                console.log(`Ufw_log ${result.affectedRows}개의 로그가 삽입되었습니다.`);
                this.db.end();
                resolve(result);
            });
        });
    }

    async run() {
        try {
            const fileContent = await this.readFile();
            const values = this.parseLogs(fileContent);
            if (values.length === 0) {
                console.log("저장할 로그가 없습니다.");
                return;
            }
            await this.insertLogs(values);
        } catch (err) {
            console.error("오류 발생:", err);
        }
    }
}

module.exports = UfwLogProcessor;
