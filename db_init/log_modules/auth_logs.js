const [fs, path, mysql, info, sqlTemplate] = [require('fs'),
    require('path'),
    require('mysql'),
    require("../../src/database/info"),
    require("../database/sqlTemplate")];

module.exports = ()=>{
    const db = mysql.createConnection(info);
    fs.readFile(path.join(__dirname,"../logs/auth.log.txt"),'utf8',(err,logs)=>{
        if(err){
            console.log(err);
            console.log("Auth_log 파일 읽기 실패!!");
            return;
        }
        const parsingLines = logs
            .trim()
            .split(/\n/)
            .map(line => line.replace(/\r$/, ""));
        const insertValues = parsingLines.map( line=>{
            const matchLog = line.match(/\[(.*?)\] \[Server ID: (\d+)\] \[SERVICE: (.*?)\] \[USER: (.*?)\] \[SRC: (.*?)\] \[ACTION: (.*?)\]/);
            const log_time = matchLog[1];
            const server_id = matchLog[2];
            const service = matchLog[3];
            const user = matchLog[4];
            const src_ip = matchLog[5];
            const action = matchLog[6];
            return [log_time, server_id, service, user, src_ip, action]
        } );
        //END map
        db.query( sqlTemplate.auth_log_sql,[insertValues],(err,result)=>{
            if(err){
                console.log(err);
                console.log("auth_log 인설트 실패!!");
            }
            console.log( `Auth_log ${result.affectedRows}개의 로그가 삽입되었습니다.` )
        } );
        //END db
        db.end();
    });
    //END readFile
}