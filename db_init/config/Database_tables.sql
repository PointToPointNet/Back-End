DROP VIEW IF EXISTS total_table;
DROP TABLE IF EXISTS servers, memory_usage,cpu_usage,packet_usage, apache_log,apache_errors_log ,mysql_errors_log,ufw_log,auth_log,critical_log,memory_swap_usage;
Create table servers (
	server_id int primary key auto_increment,
    label varchar(50) not null,
    ip varchar(15) not null,
    id varchar(50) not null,
    pw varchar(50) not null
);

Create table memory_usage(
	id int primary key auto_increment,
    server_id int not null, 
    mem_avg int,
    recorded_date Date default(CURRENT_DATE),
    recorded_time Time default(CURRENT_TIME)
    -- foreign key (server_id) references servers(server_id) 
);

Create table cpu_usage(
	id int primary key auto_increment,
    server_id int not null, 
    cpu_avg int,
    recorded_date Date default(CURRENT_DATE),
    recorded_time Time default(CURRENT_TIME)
    -- foreign key (server_id) references servers(server_id) 
);

create table packet_usage(
	id int primary key auto_increment,
    server_id int not null,
    rx_data bigint not null,
    tx_data bigint not null,
    total bigint not null,
    recorded_date date default(CURRENT_DATE),
    recorded_time Time default(CURRENT_TIME)
    -- foreign key (server_id) references servers(server_id)
);

create table apache_log(
	id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45),
    server_id int not null,
    access_time DATETIME,
    request_method VARCHAR(10),
    request_url TEXT,
    http_version VARCHAR(10),
    status_code INT,
    response_size INT,
    referrer TEXT,
    user_agent TEXT
	-- foreign key (server_id) references servers(server_id)
);


CREATE TABLE apache_errors_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    server_id int not null,
    log_time DATETIME NOT NULL,
    log_level VARCHAR(10) NOT NULL,
    error_code VARCHAR(10),
    message TEXT NOT NULL
	-- foreign key (server_id) references servers(server_id)
);

CREATE TABLE mysql_errors_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    server_id int not null,
    log_time DATETIME NOT NULL,
    log_level VARCHAR(50) NOT NULL,
    error_code VARCHAR(50),
    message TEXT NOT NULL
   	-- foreign key (server_id) references servers(server_id)
);

CREATE TABLE ufw_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    server_id int not null,
    log_time DATETIME NOT NULL,
    src_ip VARCHAR(45) NOT NULL,  -- 출발지 IP
    dst_ip VARCHAR(45) NOT NULL,  -- 목적지 IP
    protocol VARCHAR(10) NOT NULL, -- 프로토콜 (TCP, UDP 등)
    src_port INT, -- 출발지 포트
    dst_port INT, -- 목적지 포트
    action VARCHAR(10) NOT NULL  -- 허용/차단 여부 (BLOCK, ALLOW)
   	-- foreign key (server_id) references servers(server_id)
);

CREATE TABLE auth_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    server_id int not null,
    log_time DATETIME NOT NULL,
    service VARCHAR(20) NOT NULL, -- 예: sshd, sudo
    user VARCHAR(50), -- 로그인한 사용자
    src_ip VARCHAR(45), -- 로그인 시도한 IP
    action VARCHAR(50) NOT NULL -- 예: Failed password, Accepted password, sudo command
  	-- foreign key (server_id) references servers(server_id)
);

CREATE TABLE critical_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    server_id int not null,
    log_time DATETIME NOT NULL,
    service VARCHAR(50) NOT NULL, -- 예: apache2, mysql, sshd
    log_level VARCHAR(20) NOT NULL, -- ERROR, CRITICAL, ALERT
    message TEXT NOT NULL
   	-- foreign key (server_id) references servers(server_id)
);

Create table memory_swap_usage(
	id int primary key auto_increment,
    server_id int not null, 
    mem_swap_avg int,
    recorded_date Date default(CURRENT_DATE),
    recorded_time Time default(CURRENT_TIME)
    -- foreign key (server_id) references servers(server_id) 
);



create view total_table as 
select m.recorded_date, m.server_id, m.mem_avg, ms.mem_swap_avg, c.cpu_avg,p.rx_data,p.tx_data,p.total,a.web_access_count,ae.web_error_count,ufw_count, auth_error_count,mysql_err_count
from (select server_id, recorded_date, truncate(avg( mem_avg ),0) mem_avg from memory_usage group by server_id, recorded_date) m
left join (select server_id, recorded_date, truncate(avg( cpu_avg ),0) cpu_avg from cpu_usage group by server_id, recorded_date) c
on m.recorded_date = c.recorded_date and 
m.server_id = c.server_id
left join (select server_id, recorded_date, truncate(avg( mem_swap_avg ),0) mem_swap_avg from memory_swap_usage group by server_id, recorded_date) ms
on ms.server_id = m.server_id
and m.recorded_date = ms.recorded_date
left join (select server_id, recorded_date,sum(rx_data) rx_data, sum(tx_data) tx_data, sum(total) total from packet_usage group by server_id, recorded_date) p
on p.recorded_date = m.recorded_date
and p.server_id = m.server_id
left join(select substr(log_time,1,10) recorded_date ,server_id,count(*) mysql_err_count from mysql_errors_log where log_level in ("ERROR", "CRITICAL") group by substr(log_time,1,10),server_id) mysql
on m.recorded_date  = mysql.recorded_date and m.server_id = mysql.server_id
left join (select substr( access_time,1,10 ) recorded_date ,server_id, count(*) web_access_count from apache_log a  where status_code in (200,201,204) group by substr( access_time,1,10 ),server_id) a
on a.recorded_date = m.recorded_date 
and a.server_id = m.server_id
left join (select substr(log_time,1,10) recorded_date , server_id,count(*) web_error_count from apache_errors_log where log_level in ('emerg','error') group by substr(log_time,1,10), server_id) ae
on ae.recorded_date = m.recorded_date and ae.server_id = m.server_id
left join (select substr(log_time, 1, 10) recorded_date, server_id, count(*) ufw_count from ufw_log where action = "BLOCK" group by substr(log_time, 1, 10), server_id) ufw
on ufw.recorded_date = m.recorded_date and ufw.server_id = m.server_id
left join (select substr(log_time,1,10) recorded_date, server_id, count(*) auth_error_count from auth_log 
where action like '%failure%' or action like '%not%' or action like '%Failed%' 
group by substr(log_time,1,10) , server_id) auth
on auth.recorded_date = m.recorded_date and auth.server_id = m.server_id;