use network;

select * from servers;

-- servers 
insert into servers values(null, "kkms", "192.168.10.2","root","root");


-- packet_usage
INSERT INTO packet_usage (server_id, recorded_date, rx_data, tx_data, total)
VALUES
(1, '2025-02-17', 3758096384, 1288490188, 5046586572),
(1, '2025-02-18', 4294967296, 1610612736, 5905580032),
(1, '2025-02-19', 3006477107, 1181116006, 4187593113);




-- apache_errors_log
INSERT INTO apache_errors_log (log_time, log_level, error_code, message) VALUES
('2025-02-19 18:50:32', 'error', 'AH00072', 'make_sock: could not bind to address 0.0.0.0:80'),
('2025-02-19 18:50:32', 'error', 'AH00451', 'no listening sockets available, shutting down'),
('2025-02-19 18:50:32', 'emerg', 'AH00019', 'Unable to open logs'),
('2025-02-19 18:52:10', 'error', 'AH00558', 'apache2: Could not reliably determine the server’s fully qualified domain name, using 127.0.1.1'),
('2025-02-19 18:55:22', 'error', 'AH00035', 'access to /index.html denied (filesystem path /var/www/html/) because search permissions are missing'),
('2025-02-19 18:58:45', 'error', 'AH00534', 'apache2: Configuration error: No MPM loaded.'),
('2025-02-19 19:00:12', 'alert', 'core:alert', '/var/www/html/.htaccess: Invalid command RewriteEngine, perhaps misspelled or defined by a module not included in the server configuration');


-- mysql_errors_log
INSERT INTO mysql_errors_log (log_time, log_level, error_code, message) VALUES
('2025-02-19 19:05:32', 'ERROR', 'MY-010250', 'Port 3306 is in use by another process. Unable to bind.'),
('2025-02-19 19:07:45', 'ERROR', 'MY-010040', 'Table users is marked as crashed and should be repaired.'),
('2025-02-19 19:10:11', 'ERROR', 'MY-010041', 'Access denied for user admin@192.168.1.100 (using password: YES).'),
('2025-02-19 19:15:28', 'ERROR', 'MY-012345', 'Cannot allocate memory for the buffer pool.'),
('2025-02-19 19:20:45', 'ERROR', 'MY-010485', 'Unable to open the datafile ./ibdata1.');

-- ufw_log
INSERT INTO ufw_logs (log_time, src_ip, dst_ip, protocol, src_port, dst_port, action) VALUES
('2025-02-19 20:00:15', '192.168.1.100', '192.168.1.200', 'TCP', 443, 54321, 'BLOCK'),
('2025-02-19 20:05:32', '10.0.0.5', '10.0.0.10', 'UDP', 1234, 80, 'BLOCK'),
('2025-02-19 20:10:45', '172.16.0.2', '172.16.0.3', 'TCP', 8080, 22, 'BLOCK');

-- auth_log
INSERT INTO auth_logs (log_time, service, user, src_ip, action) VALUES
('2025-02-19 21:00:45', 'sshd', 'admin', '192.168.1.100', 'Failed password for invalid user'),
('2025-02-19 21:01:10', 'sshd', 'peter', '192.168.1.200', 'Accepted password'),
('2025-02-19 21:02:30', 'sudo', 'peter', NULL, 'Executed command: systemctl restart apache2');


-- critical_logs 
INSERT INTO critical_logs (log_time, service, log_level, message) VALUES
('2025-02-19 21:05:30', 'apache2', 'ERROR', 'apache2.service: Main process exited, code=exited, status=1/FAILURE'),
('2025-02-19 21:06:45', 'kernel', 'CRITICAL', 'EXT4-fs error (device sda1): ext4_find_entry:1463: inode #2: comm systemd: reading directory block 0'),
('2025-02-19 21:07:50', 'mysql', 'ERROR', 'mysql.service: Failed with result exit-code'),
('2025-02-19 21:08:15', 'sshd', 'WARNING', 'Stopped OpenSSH authentication agent'),
('2025-02-19 21:09:30', 'systemd', 'ALERT', 'Reached target Shutdown');

