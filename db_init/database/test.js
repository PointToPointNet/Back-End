const [fs, mysql, info, path] = [require('fs'), require('mysql'), require("../../src/database/info"), require('path')];

const sql = `select t.* , c.critical_cnt from total_table t
left join (select substr(log_time,1,10) recorded_date, server_id, count(*) critical_cnt from critical_logs
where substr(log_time,1,10) between '2025-02-01' and '2025-02-07'
group by substr(log_time,1,10), server_id) c
on t.recorded_date = c.recorded_date
and t.server_id = c.server_id
where t.recorded_date between '2025-02-01' and '2025-02-07'
order by 1,2`


const db = mysql.createConnection( info );

db.query( sql,(err,result)=>{
    console.log(result);
} );