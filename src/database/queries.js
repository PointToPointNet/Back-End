module.exports = {
    select_total_table_sql: "select * from total_table where recorded_date between ? and ? and server_id = ?",
    select_login_info_sql: `select login_info.*, last_login_info.last_login_time from
(select server_id, user,count(*) login_count from auth_logs
where substr(log_time, 1, 10) between ? and ? and server_id = ?
group by server_id, user
order by user) login_info 
left join 
(select user, max(log_time) last_login_time from auth_logs where substr(log_time, 1, 10) between ? and ? and server_id = ?  group by user) last_login_info
on login_info.user = last_login_info.user;`,
    select_critical_log_sql: `select server_id, log_time,service,log_level,message  from critical_logs where substr(log_time,1,10) between ? and ? and server_id = ? order by log_time;`,

    select_apache_err: `select log_time,log_level,error_code, message from apache_errors_log where log_level in ('emerg','error') and substr(log_time,1,10) between ? and ? and server_id = ? order by 1;`,
    select_mysql_err: `select log_time,log_level,error_code, message from mysql_errors_log where log_level in ("ERROR", "CRITICAL") and substr(log_time,1,10) between ? and ? and server_id = ?  order by 1;`,
    select_ufw_err: `select log_time, src_ip, dst_ip, protocol, src_port, dst_port, action from ufw_logs where action = "BLOCK" and substr(log_time,1,10) between ? and ? and server_id = ?  order by 1;`,
    select_auth_err: `select log_time, service, user, src_ip, action from auth_logs where (action like '%failure%' or action like '%not%' or action like '%Failed%') and substr(log_time,1,10) between ? and ? and server_id = ? order by 1;`

};