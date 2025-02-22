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
    select_critical_log_sql: `select server_id, log_time,service,log_level,message  from critical_logs where substr(log_time,1,10) between ? and ? and server_id = ? order by log_time;`
};