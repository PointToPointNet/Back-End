const apache_log = require("../log_modules/apach_log");
const apache_error_log = require("../log_modules/apache_errors_log");
const mysql_error_log = require("../log_modules/mysql_errors_log");
const ufw_logs = require("../log_modules/ufw_logs");
const auth_logs = require("../log_modules/auth_logs");
const critical_logs = require("../log_modules/critical_logs");

const init_table = require("./init_table");
module.exports = () => {
    const logInsert = () => {
        apache_log();
        apache_error_log();
        mysql_error_log();
        ufw_logs();
        auth_logs();
        critical_logs();
    }
    init_table();

    setTimeout(()=>{logInsert()},2000);
}
