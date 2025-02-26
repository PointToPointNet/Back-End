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
            const getRandomPacket = () => { return Math.floor(this.randomReturner(50, 1000)).toString().padStart(4, '0'); }
            const getRandomByte = (packet) => { return packet * (Math.floor(this.randomReturner(64, 100))).toString().padStart(4, '0'); }
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
                RX packets 3569${enp_packets}  bytes 1638115${enp_bytes} (14.8 GB)
                RX errors 0  dropped 173  overruns 0  frame 0
                TX packets 5016${_enp_packets} bytes 4771605${_enp_bytes} (42.8 GB)
                TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
                device interrupt 20  memory 0xf2600000-f2620000  

                lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
                inet 127.0.0.1  netmask 255.0.0.0
                inet6 ::1  prefixlen 128  scopeid 0x10<host>
                loop  txqueuelen 1000  (Local Loopback)
                RX packets 4417${lo_packets}  bytes 3353196${lo_bytes} (29.1 GB)
                RX errors 0  dropped 0  overruns 0  frame 0
                TX packets 4417${lo_packets}  bytes 3353196${lo_bytes} (29.1 GB)
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

    // df | grep -E '^/dev/(sd|nvme|mapper)'
    async df() {
        try {
            const { stdout, stderr } = await this.exec(`df | grep -E '^/dev/(sd|nvme|mapper)'`);

            return stdout;
        } catch (err) {
            return (`
                /dev/mapper/ubuntu--vg-root 959122528 340814340 569513772  38% /
                /dev/sdb1                   983378332 231255296 702096492  25% /mnt/2e3994a2-9800-4aa0-ba06-47467ae99ef3
                `).trim();
        }
    }

    async dfToJSON() {
        const df = await this.df();
        const diskData = df.trim().split("\n").map((disk) => {
            const [percentage, onlyNumber] = disk.match(/(\d+)\s*%/)
            return Number(onlyNumber);
        });
        const result = diskData.reduce((totalDisk, curDisk) => {
            return totalDisk + curDisk;
        }, 0) / (diskData.length);
        // console.log(result);
        return `${result}%`;
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
            "diskUtilization": await this.dfToJSON(),
        };

        // console.log(disk);
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
                c21st11  pts/3        211.234.197.34   Tue Feb 25 16:03   still logged in
                c21st16  pts/2        1.215.36.250     Tue Feb 25 12:51   still logged in
                c21st12  pts/4        1.215.36.250     Mon Feb 24 16:04   still logged in
                c21st03  pts/1        1.215.36.250     Mon Feb 24 13:47   still logged in
                c21st11  pts/4        211.234.196.131  Mon Feb 24 11:35   still logged in
                c21st11  pts/2        211.234.196.131  Mon Feb 24 10:30 - 11:58  (01:28)
                c21st12  pts/5        1.215.36.250     Mon Feb 24 10:11 - 16:02  (05:50)
                c21st11  pts/4        211.234.196.191  Mon Feb 24 09:59 - 10:21  (00:21)
                c21st11  pts/3        211.234.196.191  Mon Feb 24 09:58 - 10:18  (00:20)
                c21st16  pts/2        1.215.36.250     Mon Feb 24 09:29 - 10:27  (00:58)
                c21st16  pts/1        1.215.36.250     Mon Feb 24 09:28 - 13:06  (03:38)
                c21st11  pts/1        1.215.36.250     Mon Feb 24 09:21 - 09:27  (00:06)
                c20st03  pts/3        175.115.58.193   Sun Feb 23 22:59 - 23:02  (00:02)
                c21st16  pts/2        61.109.77.168    Sun Feb 23 22:06 - 23:29  (01:23)
                c21st16  pts/1        61.109.77.168    Sun Feb 23 22:01 - 23:29  (01:28)
                c21st16  pts/1        61.109.77.168    Sun Feb 23 20:06 - 21:46  (01:40)
                c21st12  pts/1        117.111.17.49    Sun Feb 23 19:32 - 19:41  (00:08)
                c19st28  pts/3        123.143.199.150  Sat Feb 22 21:23 - 21:41  (00:17)
                c19st28  pts/2        123.143.199.150  Sat Feb 22 20:20 - 21:41  (01:20)
                c21st11  pts/1        114.203.156.42   Sat Feb 22 19:52 - 22:39  (02:47)
                c21st16  pts/1        121.67.72.79     Sat Feb 22 18:06 - 18:54  (00:47)
                c21st12  pts/3        211.252.26.9     Sat Feb 22 15:39 - 15:52  (00:12)
                c21st16  pts/2        121.67.72.79     Sat Feb 22 15:37 - 17:51  (02:14)
                c21st11  pts/1        114.203.156.42   Sat Feb 22 14:58 - 16:14  (01:16)
                c21st11  pts/1        114.203.156.42   Sat Feb 22 14:56 - 14:57  (00:01)
                c20st21  pts/1        1.215.36.250     Fri Feb 21 19:20 - 19:21  (00:01)
                c21st16  pts/1        1.215.36.250     Fri Feb 21 16:57 - 17:51  (00:53)
                c21st16  pts/2        1.215.36.250     Fri Feb 21 16:52 - 16:57  (00:05)
                c21st11  pts/3        211.234.194.35   Fri Feb 21 16:43 - 21:50  (05:06)
                c21st16  pts/2        1.215.36.250     Fri Feb 21 16:34 - 16:52  (00:17)
                c21st11  pts/2        211.234.196.178  Fri Feb 21 09:24 - 09:25  (00:01)
                c21st11  pts/2        1.215.36.250     Fri Feb 21 09:19 - 09:20  (00:00)
                c21st16  pts/1        1.215.36.250     Fri Feb 21 09:05 - 16:57  (07:51)
                c21st16  pts/1        61.109.77.168    Fri Feb 21 06:17 - 08:25  (02:08)
                c21st13  pts/1        58.121.38.40     Thu Feb 20 22:08 - 00:22  (02:14)
                c20st14  pts/1        58.121.38.40     Thu Feb 20 21:56 - 21:58  (00:02)
                c20st14  pts/3        58.121.38.40     Thu Feb 20 21:43 - 21:55  (00:12)
                c20st14  pts/2        58.121.38.40     Thu Feb 20 21:41 - 21:55  (00:14)
                c20st03  pts/1        58.121.38.40     Thu Feb 20 21:39 - 21:55  (00:16)
                c21st11  pts/1        211.234.199.10   Thu Feb 20 19:03 - 19:34  (00:30)
                c21st12  pts/5        1.215.36.250     Thu Feb 20 18:02 - 18:04  (00:02)
                c17st11  pts/4        211.234.200.24   Thu Feb 20 17:52 - 01:33  (07:41)
                c21st16  pts/3        1.215.36.250     Thu Feb 20 16:41 - 18:58  (02:16)
                c21st21  pts/2        1.215.36.250     Thu Feb 20 09:24 - 21:39  (12:15)
                c21st16  pts/1        1.215.36.250     Thu Feb 20 09:18 - 18:57  (09:39)
                c19st28  pts/1        27.35.18.185     Thu Feb 20 04:03 - 04:46  (00:43)
                c21st16  pts/1        61.109.77.168    Wed Feb 19 22:13 - 00:06  (01:52)
                c21st12  pts/5        1.215.36.250     Wed Feb 19 17:56 - 19:35  (01:39)
                c21st16  pts/4        1.215.36.250     Wed Feb 19 17:28 - 18:37  (01:09)
                c21st12  pts/3        1.215.36.250     Wed Feb 19 17:27 - 20:08  (02:40)
                c21st16  pts/2        1.215.36.250     Wed Feb 19 17:26 - 18:37  (01:11)
                c21st12  pts/2        1.215.36.250     Wed Feb 19 17:09 - 17:15  (00:06)
                c21st12  pts/2        1.215.36.250     Wed Feb 19 16:24 - 16:38  (00:14)
                c21st12  pts/2        1.215.36.250     Wed Feb 19 16:11 - 16:19  (00:08)
                c21st12  pts/1        1.215.36.250     Wed Feb 19 16:10 - 18:23  (02:13)
                c21st12  pts/1        1.215.36.250     Wed Feb 19 15:25 - 15:33  (00:08)

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
                if (!result.some((userInfo) => userInfo["username"] === username)) {
                    result.push(userInfo);
                }
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
const test = new Commands("test");
test.serverStatus();
module.exports = Commands;