const [fs, mysql, info, path] = [require('fs'), require('mysql'), require("../../src/database/info"), require('path')];
module.exports = () => {
    let copyInfo = info;
    copyInfo.multipleStatements = true;

    const db = mysql.createConnection(copyInfo);

    fs.readFile(path.join(__dirname, "../config/dumy_data_insert.sql"), 'utf8', (err, sql) => {
        if (err) {
            console.log(err)
            console.log("Dumy 데이터 파일 읽기 실패!", err);
            return;
        }
        console.log( sql );
        db.beginTransaction((err) => {
            if (err) {
                console.log("트랜잭션 시작 실패!", err);
                return;
            }
            db.query(sql, (err, result) => {
                if (err) {
                    console.log("SQL 실행 실패!", err);
                    db.rollback(() => { console.log("롤백 실행!") });
                    return;
                }
                db.commit((err) => {
                    if (err) {
                        console.log("커밋실패 ! ", err);
                        return;
                    }
                    console.log("SQL실행완료!! 더미데이터 인설트 완료!!");
                    db.end();
                });
            });
        });
        //END beginTransaction
    });
}