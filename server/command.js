class Commands {
    constructor(id) {
        this._id = id;
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
        return { "runtime": Math.floor(os.uptime() / (60)) };
    }

    // ### last
    async last() {
        try {
            const { stdout, stderr } = await this.exec("last");
            console.log(stdout);
            return stdout;
        } catch (err) {
            return `
                c21st11  pts/1        211.234.199.10   Thu Feb 20 19:03   still logged in
                c21st12  pts/5        1.215.36.250     Thu Feb 20 18:02 - 18:04  (00:02)
                c17st11  pts/4        211.234.200.24   Thu Feb 20 17:52   still logged in
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
            if (stderr) throw new Error();
            return stdout.trim();
        } catch (err) {
            return `
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