const apache_log = require("../log_modules/apach_log");
const apache_error_log = require("../log_modules/apache_errors_log");
const mysql_error_log = require("../log_modules/mysql_errors_log");
const ufw_log = require("../log_modules/ufw_log");
const auth_log = require("../log_modules/auth_log");
const critical_log = require("../log_modules/critical_log");

const dumy_data_insert = require("./insert_dumy_data");
const init_table = require("./init_table");
module.exports = () => {
    const logInsert = () => {
        apache_log();
        apache_error_log();
        mysql_error_log();
        ufw_log();
        auth_log();
        critical_log();
    }
    init_table();
    setTimeout(()=>{logInsert()},2000);
    setTimeout(()=>{dumy_data_insert();},4000);
}
