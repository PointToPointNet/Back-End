module.exports = {
    apach_log_sql: "insert into apache_log (ip_address, access_time, request_method, request_url, http_version, status_code, response_size, referrer, user_agent,server_id) VALUES ?",
    apach_err_log_sql: "insert into apache_errors_log ( log_time,log_level,error_code,message ,server_id ) values ?",
    mysql_err_log_sql: "insert into mysql_errors_log(log_time, log_level, error_code, message, server_id) values ?",
    ufw_log_sql: "insert into ufw_log (log_time, server_id, src_ip, src_port,dst_ip, dst_port, protocol, action) values ?",
    auth_log_sql: "insert into auth_log (log_time, server_id, service, user, src_ip, action) values ?",
    critical_sql: "insert into critical_log(log_time, server_id, service, log_level, message) values ?",
    select_total_table_sql: "select * from total_table where recorded_date between ? and ? and server_id = ?",
    select_login_info_sql: `select login_info.*, last_login_info.last_login_time from
(select server_id, user,count(*) login_count from auth_log
where substr(log_time, 1, 10) between ? and ? and server_id = ?
group by server_id, user
order by user) login_info 
left join 
(select user, max(log_time) last_login_time from auth_log where substr(log_time, 1, 10) between ? and ? and server_id = ?  group by user) last_login_info
on login_info.user = last_login_info.user;`,
    select_critical_log_sql: `select server_id, log_time,service,log_level,message  from critical_log where substr(log_time,1,10) between ? and ? and server_id = ? order by log_time;`
}
