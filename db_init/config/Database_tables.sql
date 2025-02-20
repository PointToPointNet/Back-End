DROP TABLE IF EXISTS servers, memory_usage,cpu_usage,packet_usage, apache_log,apache_errors_log ,mysql_errors_log,ufw_logs,auth_logs,critical_logs;

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
    recorded_time Date default(CURRENT_TIME)
    -- foreign key (server_id) references servers(server_id) 
);

Create table cpu_usage(
	id int primary key auto_increment,
    server_id int not null, 
    cpu_avg int,
    recorded_date Date default(CURRENT_DATE),
    recorded_time Date default(CURRENT_TIME)
    -- foreign key (server_id) references servers(server_id) 
);

create table packet_usage(
	id int primary key auto_increment,
    server_id int not null,
    rx_data bigint not null,
    tx_data bigint not null,
    total bigint not null,
    recorded_date date default(CURRENT_DATE)
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

CREATE TABLE ufw_logs (
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

CREATE TABLE auth_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    server_id int not null,
    log_time DATETIME NOT NULL,
    service VARCHAR(20) NOT NULL, -- 예: sshd, sudo
    user VARCHAR(50), -- 로그인한 사용자
    src_ip VARCHAR(45), -- 로그인 시도한 IP
    action VARCHAR(50) NOT NULL -- 예: Failed password, Accepted password, sudo command
  	-- foreign key (server_id) references servers(server_id)
);

CREATE TABLE critical_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    server_id int not null,
    log_time DATETIME NOT NULL,
    service VARCHAR(50) NOT NULL, -- 예: apache2, mysql, sshd
    log_level VARCHAR(20) NOT NULL, -- ERROR, CRITICAL, ALERT
    message TEXT NOT NULL
   	-- foreign key (server_id) references servers(server_id)
);