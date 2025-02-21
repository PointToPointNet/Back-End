const [fs, path, mysql, info, sqlTemplate] = [require('fs'),
    require('path'),
    require('mysql2'),
    require("../../src/database/info"),
    require("../database/sqlTemplate")];

module.exports = ()=>{
    fs.readFile(path.join(__dirname, "../logs/critical_log.txt"),'utf8',(err,logs)=>{
        if(err){
            console.log(err);
            console.log("Critical_log 파일 읽기 실패!!");
        }
        const db = mysql.createConnection(info);

        const parsingLines = logs.trim().split(/\n/).map( line=>line.replace(/\r$/, "") );
        const insertValues = parsingLines.map( line=>{
            const matchLog = line.match(/\[(.*?)\] \[Server ID: (\d+)\] \[SERVICE: (.*?)\] \[LEVEL: (.*?)\] \[MESSAGE: (.*?)\]/);
            const log_time = matchLog[1];
            const server_id = matchLog[2];
            const service = matchLog[3];
            const log_level = matchLog[4];
            const message = matchLog[4];
            return [log_time, server_id, service, log_level, message];
        } );
        //END map
        db.query( sqlTemplate.critical_sql, [insertValues], (err,result)=>{
            if(err){
                console.log(err);
                console.log("Critical_log 인설트 실패!!");
            }
            console.log( `Critical_log ${result.affectedRows}개의 로그가 삽입되었습니다.` )
        } )
        //END db
        db.end();
    });
}