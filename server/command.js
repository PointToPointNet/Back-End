class Commands {
    constructor(id, serverIndex) {
        this._id = id;
        this.serverIndex = serverIndex;

        this.exec = null;
    }

    get id() {
        return this._id;
    }

    init() {
        const { exec } = require('child_process');
        const { promisify } = require("util");

        this.exec = promisify(exec);
    }
    randomReturner(min = 0, max = 1) {
        return Math.random() * (max - min) + min;
    }
    // ### ifconfig
    async ifconfig() {
        try {
            const { stdout, stderr } = await this.exec("ifconfig");
            return stdout.trim();
        } catch (err) {
            const getRandomPacket = () => { return Math.floor(this.randomReturner(5e7, 1e5)); }
            const getRandomByte = (packet) => { return packet * (Math.floor(Math.random() * (100 - 64) + 64)); }
            const enp_packets = getRandomPacket();
            const enp_bytes = getRandomByte(enp_packets);
            const _enp_packets = getRandomPacket();
            const _enp_bytes = getRandomByte(_enp_packets);
            const lo_packets = getRandomPacket();
            const lo_bytes = getRandomByte(lo_packets);
            return (`
                enp0s25: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
                inet 110.5.238.107  netmask 255.255.255.128  broadcast 110.5.238.127
                inet6 fe80::f900:ed1d:473c:e9d0  prefixlen 64  scopeid 0x20<link>
                ether f0:de:f1:45:d1:33  txqueuelen 1000  (Ethernet)
                RX packets ${enp_packets}  bytes ${enp_bytes} (14.8 GB)
                RX errors 0  dropped 173  overruns 0  frame 0
                TX packets ${_enp_packets} bytes ${_enp_bytes} (42.8 GB)
                TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
                device interrupt 20  memory 0xf2600000-f2620000  

                lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
                inet 127.0.0.1  netmask 255.0.0.0
                inet6 ::1  prefixlen 128  scopeid 0x10<host>
                loop  txqueuelen 1000  (Local Loopback)
                RX packets ${lo_packets}  bytes ${lo_bytes} (29.1 GB)
                RX errors 0  dropped 0  overruns 0  frame 0
                TX packets ${lo_packets}  bytes ${lo_bytes} (29.1 GB)
                TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
            `).trim();
        }
    }

    async ifconfigToJSON() {
        const resultObj = {};
        const ifconfig = await this.ifconfig();

        const slicedNetwork = ifconfig.trim().split("\n\n").map((network) => network.split("\n").map((line) => line.trim()));

        slicedNetwork.forEach((oneNetwork) => {
            const networkName = oneNetwork[0].split(":")[0].trim();
            resultObj[networkName] = {};
            const sievedNetworkInfo = oneNetwork.filter((oneNetworkData) => {
                return (oneNetworkData.includes("RX") || oneNetworkData.includes("TX")) && (oneNetworkData.includes("packets") && oneNetworkData.includes("bytes"));
            });
            sievedNetworkInfo.forEach((sievedInfo) => {
                const transportType = sievedInfo.match(/RX/) || sievedInfo.match(/TX/);
                resultObj[networkName][transportType[0]] = {
                    "packets": sievedInfo.match(/packets[\s]+\d+/)[0].match(/\d+/)[0],
                    "bytes": sievedInfo.match(/bytes[\s]+\d+/)[0].match(/\d+/)[0],
                }
            });
        });
        // console.log(resultObj);
        return resultObj;
    }

    // ### memory, cpu, disk
    async top_cpu() {
        // top -bn1 | grep "Cpu(s)"
        try {
            const { stdout, stderr } = await this.exec(`top -bn1 | grep "Cpu(s)"`);
            const [_, cpuUtilization] = stdout.match(/(\d{1,3}\.\d)\s+id/)
            // console.log(`${100.0 - Number(cpuUtilization)}%`);
            return `${100.0 - Number(cpuUtilization)}%`;
        } catch (err) {
            return `${this.randomReturner(5, 15).toFixed(1)}%`;
        }
    }

    async serverStatus() {
        const os = require("os");
        const memory = {
            "usingMemory": (os.totalmem() - os.freemem()),
            "totalMemory": os.totalmem(),
        };

        const cpu = {
            "cpuUtilization": await this.top_cpu(),
        };

        const disk = {
            "diskUtilization": "80%"
        };

        return { "memory": memory, "cpu": cpu, "disk": disk };
    }

    // ### runtime
    uptime() {
        const os = require("os");
        return { "runtime": Math.floor(os.uptime() / (60)) + (123 * this.serverIndex) };
    }

    // ### last
    async last() {
        try {
            const { stdout, stderr } = await this.exec("last");
            if (!(/\d{1,3}:\d{1,3}:\d{1,3}:\d{1,3}/.test(stdout)) || stderr) throw new Error();
            return stdout;
        } catch (err) {
            return `
                c21st17  pts/4        1.215.36.250     Thu Feb 13 16:50 - 17:55  (01:05)
                c21st12  pts/1        1.215.36.250     Thu Feb 13 16:49 - 21:09  (04:19)
                c21st21  pts/3        1.215.36.250     Thu Feb 13 14:43 - 21:09  (06:26)
                c21st08  pts/3        1.215.36.250     Thu Feb 13 12:36 - 14:32  (01:55)
                c21st21  pts/2        1.215.36.250     Thu Feb 13 11:26 - 18:32  (07:06)
                c21st13  pts/1        1.215.36.250     Thu Feb 13 11:26 - 14:49  (03:22)
                c21st15  pts/1        1.215.36.250     Thu Feb 13 09:25 - 09:25  (00:00)
                c19st28  pts/1        27.35.18.185     Thu Feb 13 03:44 - 06:48  (03:04)
                c21st13  pts/1        1.215.36.250     Wed Feb 12 19:43 - 19:44  (00:01)
                c20st14  pts/8        1.215.36.250     Wed Feb 12 19:39 - 19:42  (00:03)
                c20st14  pts/6        1.215.36.250     Wed Feb 12 19:37 - 19:42  (00:04)
                c21st13  pts/1        1.215.36.250     Wed Feb 12 19:34 - 19:42  (00:07)
                c21st17  pts/6        1.215.36.250     Wed Feb 12 18:05 - 18:26  (00:20)
                c21st15  pts/25       1.215.36.250     Wed Feb 12 17:59 - 20:11  (02:11)
                c21st14  pts/24       1.215.36.250     Wed Feb 12 17:42 - 19:47  (02:05)
                c20st21  pts/20       1.215.36.250     Wed Feb 12 17:24 - 19:20  (01:56)
                c20st21  pts/14       1.215.36.250     Wed Feb 12 17:23 - 19:20  (01:57)
                c21st04  pts/13       1.215.36.250     Wed Feb 12 17:22 - 17:36  (00:14)
                c21st05  pts/13       1.215.36.250     Wed Feb 12 16:15 - 16:24  (00:08)
                c20st08  pts/13       1.215.36.250     Wed Feb 12 16:15 - 16:15  (00:00)
                c20st08  pts/13       1.215.36.250     Wed Feb 12 16:15 - 16:15  (00:00)
                c21st08  pts/9        1.215.36.250     Wed Feb 12 14:39 - 19:47  (05:07)
                c21st07  pts/18       1.215.36.250     Wed Feb 12 12:18 - 14:27  (02:08)
                c21st21  pts/13       1.215.36.250     Wed Feb 12 10:29 - 13:08  (02:39)
                c21st21  pts/7        1.215.36.250     Wed Feb 12 10:08 - 13:08  (03:00)
                c21st20  pts/6        1.215.36.250     Wed Feb 12 09:58 - 18:03  (08:04)
                c20st14  pts/17       1.215.36.250     Wed Feb 12 09:56 - 19:31  (09:35)
                c20st14  pts/16       1.215.36.250     Wed Feb 12 09:55 - 19:31  (09:36)
                c20st14  pts/15       1.215.36.250     Wed Feb 12 09:54 - 19:31  (09:37)
                c21st21  pts/14       1.215.36.250     Wed Feb 12 09:53 - 13:08  (03:14)
                c21st21  pts/10       1.215.36.250     Wed Feb 12 09:34 - 13:08  (03:34)
                c21st21  pts/9        1.215.36.250     Wed Feb 12 09:30 - 14:04  (04:33)
                c21st13  pts/8        1.215.36.250     Wed Feb 12 09:30 - 19:31  (10:00)
                c21st20  pts/7        1.215.36.250     Wed Feb 12 09:28 - 09:41  (00:12)
                c21st20  pts/6        1.215.36.250     Wed Feb 12 09:27 - 09:41  (00:14)
                c21st03  pts/1        1.215.36.250     Wed Feb 12 09:22 - 18:59  (09:36)
                c21st16  pts/3        121.67.72.80     Wed Feb 12 01:55 - 01:55  (00:00)
                c21st03  pts/2        175.115.58.147   Wed Feb 12 01:50 - 01:56  (00:05)
                c20st03  pts/3        175.115.58.147   Wed Feb 12 01:35 - 01:42  (00:06)
                c20st03  pts/2        175.115.58.147   Wed Feb 12 01:28 - 01:42  (00:13)
                c21st03  pts/1        175.115.58.147   Wed Feb 12 00:16 - 02:29  (02:12)
                c21st03  pts/5        175.115.58.147   Tue Feb 11 22:53 - 00:13  (01:19)
                c20st14  pts/19       1.215.36.250     Tue Feb 11 19:29 - 19:36  (00:07)
                c20st14  pts/18       1.215.36.250     Tue Feb 11 19:27 - 19:36  (00:08)
                c21st20  pts/17       211.234.197.57   Tue Feb 11 18:29 - 20:51  (02:21)
                c21st20  pts/16       211.234.197.57   Tue Feb 11 18:23 - 20:51  (02:27)
                c21st20  pts/16       211.234.197.57   Tue Feb 11 18:21 - 18:21  (00:00)
                c21st16  pts/16       1.215.36.250     Tue Feb 11 17:55 - 17:55  (00:00)
                c21st21  pts/15       1.215.36.250     Tue Feb 11 17:43 - 19:36  (01:52)
                c21st20  pts/14       1.215.36.250     Tue Feb 11 17:20 - 20:00  (02:39)
                c21st20  pts/9        1.215.36.250     Tue Feb 11 17:19 - 18:34  (01:15)
                c21st03  pts/13       1.215.36.250     Tue Feb 11 15:16 - 19:33  (04:16)
                c21st17  pts/12       1.215.36.250     Tue Feb 11 15:10 - 21:27  (06:17)
                c21st21  pts/11       1.215.36.250     Tue Feb 11 14:39 - 19:36  (04:57)
                c21st21  pts/10       1.215.36.250     Tue Feb 11 14:33 - 19:36  (05:02)
                c21st21  pts/7        1.215.36.250     Tue Feb 11 14:23 - 19:36  (05:12)
                c21st16  pts/7        1.215.36.250     Tue Feb 11 14:02 - 14:03  (00:01)
                c21st16  pts/10       61.109.77.168    Tue Feb 11 13:21 - 13:42  (00:21)
                c21st20  pts/9        1.215.36.250     Tue Feb 11 11:35 - 16:29  (04:54)
                c21st08  pts/8        1.215.36.250     Tue Feb 11 11:18 - 21:27  (10:09)
                c21st13  pts/5        1.215.36.250     Tue Feb 11 10:18 - 19:36  (09:18)
                c21st21  pts/7        1.215.36.250     Tue Feb 11 09:34 - 13:55  (04:21)
                c21st21  pts/6        1.215.36.250     Tue Feb 11 09:32 - 19:36  (10:03)
                c21st16  pts/5        1.215.36.250     Tue Feb 11 09:32 - 09:48  (00:16)
                c19st28  pts/1        27.35.18.185     Tue Feb 11 01:59 - 04:14  (02:15)
                c21st16  pts/3        61.109.77.168    Mon Feb 10 21:03 - 22:50  (01:47)
                c21st16  pts/2        61.109.77.168    Mon Feb 10 21:03 - 22:50  (01:47)
                c21st15  pts/1        112.156.10.253   Mon Feb 10 20:47 - 23:07  (02:19)
                c20st01  pts/1        1.215.36.250     Mon Feb 10 18:23 - 20:35  (02:11)
                c21st11  pts/26       1.215.36.250     Mon Feb 10 18:12 - 18:17  (00:04)
                c21st07  pts/24       1.215.36.250     Mon Feb 10 16:44 - 18:24  (01:40)
                c21st17  pts/30       1.215.36.250     Mon Feb 10 15:25 - 20:33  (05:08)
                c21st20  pts/29       1.215.36.250     Mon Feb 10 15:22 - 20:00  (04:38)
                c21st06  pts/28       1.215.36.250     Mon Feb 10 15:00 - 17:55  (02:54)
                c21st14  pts/27       1.215.36.250     Mon Feb 10 14:29 - 18:38  (04:08)
                c21st10  pts/25       1.215.36.250     Mon Feb 10 14:17 - 19:38  (05:20)
                c21st11  pts/24       1.215.36.250     Mon Feb 10 13:59 - 16:41  (02:42)
                c21st20  pts/26       1.215.36.250     Mon Feb 10 12:31 - 16:35  (04:04)
                c21st20  pts/25       1.215.36.250     Mon Feb 10 12:28 - 12:40  (00:11)
                c21st20  pts/25       1.215.36.250     Mon Feb 10 12:23 - 12:25  (00:01)
                c21st11  pts/24       1.215.36.250     Mon Feb 10 11:56 - 13:08  (01:11)
                c21st21  pts/23       1.215.36.250     Mon Feb 10 11:41 - 18:46  (07:04)
                c21st04  pts/22       1.215.36.250     Mon Feb 10 11:39 - 19:23  (07:44)
                c21st15  pts/21       1.215.36.250     Mon Feb 10 11:24 - 21:06  (09:42)
                c21st16  pts/20       1.215.36.250     Mon Feb 10 11:20 - 19:24  (08:03)
                c21st08  pts/19       1.215.36.250     Mon Feb 10 11:18 - 19:38  (08:19)
                c20st13  pts/17       1.215.36.250     Mon Feb 10 10:57 - 19:23  (08:25)
                c20st13  pts/16       1.215.36.250     Mon Feb 10 10:57 - 19:23  (08:26)
                c20st13  pts/15       1.215.36.250     Mon Feb 10 10:56 - 19:23  (08:26)
                c20st13  pts/14       1.215.36.250     Mon Feb 10 10:55 - 19:23  (08:27)
                c21st18  pts/12       1.215.36.250     Mon Feb 10 10:07 - 19:16  (09:08)
                c21st17  pts/11       1.215.36.250     Mon Feb 10 09:42 - 20:33  (10:51)
                c21st16  pts/10       1.215.36.250     Mon Feb 10 09:30 - 19:24  (09:53)
                c21st21  pts/9        1.215.36.250     Mon Feb 10 09:25 - 18:46  (09:21)
                c21st21  pts/8        1.215.36.250     Mon Feb 10 09:18 - 18:46  (09:27)
                c21st21  pts/7        1.215.36.250     Mon Feb 10 09:17 - 18:46  (09:28)
                c21st21  pts/6        1.215.36.250     Mon Feb 10 09:16 - 18:46  (09:29)
                c21st21  pts/5        1.215.36.250     Mon Feb 10 09:15 - 18:46  (09:30)
                c21st20  pts/1        117.111.17.72    Mon Feb 10 00:54 - 00:56  (00:02)
                c21st20  pts/1        117.111.17.72    Mon Feb 10 00:27 - 00:44  (00:17)
                c21st02  pts/2        14.35.121.77     Sun Feb  9 23:41 - 00:02  (00:21)
                c21st02  pts/2        14.35.121.77     Sun Feb  9 22:49 - 23:40  (00:51)
                c21st04  pts/6        219.251.102.235  Sun Feb  9 22:44 - 00:44  (02:00)
                c19st28  pts/5        27.35.18.185     Sun Feb  9 22:15 - 03:55  (05:39)
                c19st28  pts/4        27.35.18.185     Sun Feb  9 22:15 - 03:55  (05:40)
                c21st16  pts/3        61.109.77.168    Sun Feb  9 21:24 - 00:18  (02:53)
                c21st16  pts/4        61.109.77.168    Sun Feb  9 20:47 - 20:59  (00:12)
                c21st16  pts/3        61.109.77.168    Sun Feb  9 20:46 - 20:59  (00:12)
                c21st08  pts/3        39.117.160.50    Sun Feb  9 20:00 - 20:08  (00:08)
                c21st02  pts/2        14.35.121.77     Sun Feb  9 18:04 - 22:48  (04:43)
                c21st02  pts/1        14.35.121.77     Sun Feb  9 17:58 - 00:02  (06:03)
                c21st11  pts/2        114.203.156.42   Sun Feb  9 15:27 - 16:01  (00:33)
                c20st13  pts/2        14.38.218.60     Sun Feb  9 14:07 - 14:28  (00:21)
                c20st13  pts/1        14.38.218.60     Sun Feb  9 13:20 - 16:16  (02:55)
                c19st28  pts/3        210.113.95.76    Sun Feb  9 12:03 - 12:28  (00:25)
                c19st28  pts/2        210.113.95.76    Sun Feb  9 12:02 - 12:28  (00:25)
                c20st13  pts/1        14.38.218.60     Sun Feb  9 11:34 - 13:18  (01:44)
                c21st08  pts/1        39.117.160.50    Sun Feb  9 01:00 - 06:50  (05:50)

                wtmp begins Sun Feb  9 00:33:23 2025
            `.trim();
        }

    }

    async lastToJSON() {
        const result = [];
        const last = await this.last();
        const user = last.trim().split("\n");
        user.forEach((line) => {
            const regEx = /(\w+)\s+(pts\/\d+|tty\d+|\S+)\s+([\d.]+|\S+)\s+(\w{3}\s+\w{3}\s+\d+\s+\d+:\d+)\s+-?\s+(\d+:\d+)?\s+(still logged in)?/
            if (regEx.test(line)) {
                // console.log(line.match(/(\w+)\s+(pts\/\d+|tty\d+|\S+)\s+([\d.]+|\S+)\s+(\w{3}\s+\w{3}\s+\d+\s+\d+:\d+)\s+-?\s+(\d+:\d+)?\s+(still logged in)?/)[1]);
                const [_, username, terminal, ip, loginTime, logoutTime, connecting] = line.match(regEx);
                const userInfo = {
                    "username": username,
                    "terminal": terminal,
                    "ip": ip,
                    "loginTime": loginTime,
                    "logoutTime": logoutTime ? logoutTime : "",
                    "connecting": connecting ? true : false
                }
                result.push(userInfo);
            }
        });
        // console.log(result);
        return result;
    }

    // ### ping -c 1 8.8.8.8
    async ping() {
        try {
            const { stdout, stderr } = await this.exec("ping -c 1 8.8.8.8");
            return stdout.trim();
        } catch (err) {
            const randomPing = (this.randomReturner(30, 45).toFixed(1));
            // console.log(randomPing);
            return (`
                PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
                64 바이트 (8.8.8.8에서): icmp_seq=1 ttl=56 시간=${randomPing} ms

                --- 8.8.8.8 핑 통계 ---
                1 패킷이 전송되었습니다, 1 수신되었습니다, 0% 패킷 손실, 시간 0ms
                rtt 최소/평균/최대/표준편차 = 35.221/35.221/35.221/0.000 ms
            `).trim();
        }
    }

    async pingToJson() {
        const resultObj = { "pingResponse": 0 };
        const ping = await this.ping();
        const pingData = ping.split("\n").filter((line) => {
            return line.includes("시간=") || line.includes("time=");
        });
        pingData.forEach((line) => {
            const response = line.match(/시간=[\s]?[\d.]+/) || line.match(/time=[\s]?[\d.]+/);

            const responseTime = response[0].match(/[\d.]+/)[0];
            resultObj["pingResponse"] = responseTime;
        });
        // console.log(resultObj);
        return resultObj;
    }

    // ### ss -tan state established | awk '{print $4}' | awk -F ':' '{print $NF}' | sort | uniq -c | sort -nr
    async ss() {
        try {
            const { stdout, stderr } = await this.exec("ss -tan state established | awk '{print $4}' | awk -F ':' '{print $NF}' | sort | uniq -c | sort -nr");
            if (stderr) throw new Error(); // docker에 ss가 없어서 한 처리
            return stdout.trim();
        } catch (err) {
            return `
                7 1004
                4 22
                3 80
                2 8501
                2 631
                2 25
                1 Local
                1 60170
                1 60160
            `.trim();
        }
    }

    async ssToJSON() {
        const result = [];
        const ss = await this.ss();

        return ss.split("\n").map((line) => {
            const [count, port] = line.trim().split(" ");
            return { "port": port, "count": count };
        });
    }

    // ### netstat -tulnp
    async netstat() {
        try {
            const { stdout, stderr } = await this.exec("netstat -tulnp");
            // console.log(stdout);
            return stdout.trim();
        } catch (err) {
            return `
            (Not all processes could be identified, non-owned process info
            will not be shown, you would have to be root to see it all.)
            Active Internet connections (only servers)
            Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
            tcp        0      0 0.0.0.0:10035           0.0.0.0:*               LISTEN      -
            tcp        0      0 0.0.0.0:33171           0.0.0.0:*               LISTEN      -
            tcp        0      0 110.5.238.107:45141     0.0.0.0:*               LISTEN      -
            tcp        0      0 0.0.0.0:8501            0.0.0.0:*               LISTEN      -
            tcp        0      0 127.0.0.53:53           0.0.0.0:*               LISTEN      -
            tcp        0      0 0.0.0.0:10230           0.0.0.0:*               LISTEN      -
            tcp6       0      0 :::33040                :::*                    LISTEN      -
            tcp6       0      0 :::80                   :::*                    LISTEN      -
            udp        0      0 127.0.0.53:53           0.0.0.0:*                           -
            udp        0      0 0.0.0.0:51188           0.0.0.0:*                           -
        `.trim();
        }
    }

    async netstatToJSON() {
        const result = [];
        const netstat = await this.netstat();
        const port = netstat.trim().split("\n").filter(line => /:\d+/.test(line)).map(line => line.trim().split(/\s+/));
        port.forEach(portData => {
            const [protocol, , , address] = portData;
            result.push({ "protocol": protocol, "address": address });
        });

        // console.log(result);
        return result;
    }

    async getData() {
        this.init();
        // this.lastToJSON();
        // console.log("done");
        return {
            "ifconfig": await this.ifconfigToJSON(),
            "runtime": this.uptime(),
            "serverStatus": await this.serverStatus(),
            "ping": await this.pingToJson(),
            "userList": await this.lastToJSON(),
            "usedPort": await this.ssToJSON(),
            "activePort": await this.netstatToJSON(),
        };
    }
}

module.exports = Commands;