const [fs, mysql, info, path] = [require('fs'), require('mysql2'), require("../../src/database/info"), require('path')];
module.exports = () => {
    let copyInfo = info;
    copyInfo.multipleStatements = true;
    const db = mysql.createConnection(copyInfo);
    fs.readFile(path.join(__dirname, "../config/Database_tables.sql"), "utf8", (err, sql) => {
        if (err) {
            console.error("SQL 파일 읽기 실패!", err);
            return;
        }
        db.beginTransaction((err) => {
            if (err) {
                console.error(" 트랜잭션 시작 실패!", err);
                return;
            }
            db.query(sql, (err, result) => {
                if (err) {
                    console.error(" SQL 실행 실패!", err);
                    db.rollback(() => console.error(" 롤백 실행!"));
                    return;
                }
                db.commit((err) => {
                    if (err) {
                        console.error(" 커밋 실패!", err);
                        return;
                    }

                    console.log("SQL 실행 완료! (DROP 후 CREATE 성공)");
                    db.end();
                });
            });

        });
    });
}