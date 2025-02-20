module.exports = {
    apach_log_sql: "insert into apache_log (ip_address, access_time, request_method, request_url, http_version, status_code, response_size, referrer, user_agent,server_id) VALUES ?",
    apach_err_log_sql: "insert into apache_errors_log ( log_time,log_level,error_code,message ,server_id ) values ?",
    mysql_err_log_sql: "insert into mysql_errors_log(log_time, log_level, error_code, message, server_id) values ?",
    ufw_log_sql: "insert into ufw_logs (log_time, server_id, src_ip, src_port,dst_ip, dst_port, protocol, action) values ?",
    auth_log_sql :"insert into auth_logs (log_time, server_id, service, user, src_ip, action) values ?",
    critical_sql: "insert into critical_logs(log_time, server_id, service, log_level, message) values ?"
}
