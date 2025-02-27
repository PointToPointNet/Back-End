const ApacheLogProcessor = require("../log_modules/ApacheLogProcessor");
const ApacheErrorLogProcessor = require("../log_modules/ApacheErrorLogProcessor");
const MysqlErrorLogProcessor = require("../log_modules/MysqlErrorLogProcessor");
const UfwLogProcessor = require("../log_modules/UfwLogProcessor");
const AuthLogProcessor = require("../log_modules/AuthLogProcessor");
const CriticalLogProcessor = require("../log_modules/CriticalLogProcessor");

const dumyDataInsert = require("./insertDumyData");
const initTable = require("./initTable");

class LogModuleRunner {
    constructor(id) {
        this.id = id;
    }

    init() {
        initTable();
    }

    logInsert() {
        const apacheLog = new ApacheLogProcessor();
        apacheLog.run();

        const apacheErrorLogProcessor = new ApacheErrorLogProcessor();
        apacheErrorLogProcessor.run();

        const authLogProcessor = new AuthLogProcessor();
        authLogProcessor.run();

        const mysqlErrorLogProcessor = new MysqlErrorLogProcessor();
        mysqlErrorLogProcessor.run();

        const criticalLogProcessor = new CriticalLogProcessor();
        criticalLogProcessor.run();

        const ufwLogProcessor = new UfwLogProcessor();
        ufwLogProcessor.run();
    }

    // 전체 실행: 테이블 초기화 후 일정 시간 간격으로 로그 및 더미 데이터 삽입
    run() {
        this.init();
        // 2초 후에 로그 삽입 실행
        setTimeout(() => {
            this.logInsert();
        }, 2000);
        // 4초 후에 더미 데이터 삽입 실행
        setTimeout(() => {
            dumyDataInsert();
        }, 4000);
    }
}

module.exports = LogModuleRunner;