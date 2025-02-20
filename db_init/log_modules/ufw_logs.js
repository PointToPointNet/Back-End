const [fs, path, mysql, info, sqlTemplate] = [require('fs'),
    require('path'),
    require('mysql'),
    require("../../src/database/info"),
    require("../database/sqlTemplate")];

module.exports = () =>{
// [2025-02-10 03:04:12] [Server ID: 1] [SRC: 121.36.146.173:None] -> [DST: 202.79.105.210:None] [PROTO: ICMP] [ACTION: BLOCK]
// CREATE TABLE ufw_logs (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     server_id int not null,
//     log_time DATETIME NOT NULL,
//     src_ip VARCHAR(45) NOT NULL,  -- 출발지 IP
//     dst_ip VARCHAR(45) NOT NULL,  -- 목적지 IP
//     protocol VARCHAR(10) NOT NULL, -- 프로토콜 (TCP, UDP 등)
//     src_port INT, -- 출발지 포트
//     dst_port INT, -- 목적지 포트
//     action VARCHAR(10) NOT NULL  -- 허용/차단 여부 (BLOCK, ALLOW)
//    	-- foreign key (server_id) references servers(server_id)
// );
    const db = mysql.createConnection(info);
    fs.readFile( path.join(__dirname,"../logs/ufw.logs.txt"),'utf8',(err,logs)=>{
        if(err){
            console.log(err);
            console.log("ufw.logs 파일 읽기 실패!");
        }
        const parsingLines = logs.trim().split(/\n/);

        const insertValues = parsingLines.map( line=>{
            // const matchLog = line.match(/\[(.*?)\] \[(.*?)\] \[(.*?)\] \[(.*?)\] \[(.*?)\] \[(.*?)\]/);
            const matchLog = line.match(/\[(.*?)\] \[Server ID: (\d+)\] \[SRC: (.*?):(.*?)\] -> \[DST: (.*?):(.*?)\] \[PROTO: (.*?)\] \[ACTION: (.*?)\]/);

            const log_time = matchLog[1];
            const server_id = parseInt(matchLog[2]);
            const src_ip = matchLog[3];
            const src_port = isNaN(parseInt(matchLog[4])) ? null : parseInt(matchLog[4]);

            const dst_ip = matchLog[5];
            const dst_port = isNaN(parseInt(matchLog[6])) ? null : parseInt(matchLog[6]);
            const protocol = matchLog[7];
            const action = matchLog[8];
            return [log_time, server_id, src_ip, src_port,dst_ip, dst_port, protocol, action];
        } );
        //END map
        db.query( sqlTemplate.ufw_log_sql,[insertValues],(err, result)=>{
            if(err){
                console.log(err);
                console.log("ufw.log 인설트 실패!!");
            }
            console.log(`Ufw_log  ${result.affectedRows}개의 로그가 삽입되었습니다.`);
        } );
        // END db

        db.end();
    } );
}

