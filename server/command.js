class Commands {
    constructor(id) {
        this.id = id;
        this.exec = null;
    }
    init() {
        const { exec } = require('child_process');
        this.exec = exec; // `exec`을 바인딩
    }
    // ### ifconfig
    // ifconfig() {
    //     this.exec("ifconfig", (err, stdout, stderr) => {
    //         if (err || stderr) throw err || stderr;
    //         console.log(stdout);
    //         // return stdout.trim();
    //     });
    //     return (`
    //         enp0s25: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
    //         inet 110.5.238.107  netmask 255.255.255.128  broadcast 110.5.238.127
    //         inet6 fe80::f900:ed1d:473c:e9d0  prefixlen 64  scopeid 0x20<link>
    //         ether f0:de:f1:45:d1:33  txqueuelen 1000  (Ethernet)
    //         RX packets 31499952  bytes 14872699632 (14.8 GB)
    //         RX errors 0  dropped 173  overruns 0  frame 0
    //         TX packets 44796728  bytes 42813807568 (42.8 GB)
    //         TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
    //         device interrupt 20  memory 0xf2600000-f2620000  

    //         lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
    //         inet 127.0.0.1  netmask 255.0.0.0
    //         inet6 ::1  prefixlen 128  scopeid 0x10<host>
    //         loop  txqueuelen 1000  (Local Loopback)
    //         RX packets 39109789  bytes 29185449490 (29.1 GB)
    //         RX errors 0  dropped 0  overruns 0  frame 0
    //         TX packets 39109789  bytes 29185449490 (29.1 GB)
    //         TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
    //     `).trim();
    // }
    async ifconfig() {
        return new Promise((resolve, reject) => {
            this.exec("ifconfig", (err, stdout, stderr) => {
                if (err || stderr) {
                    reject(err || stderr);
                    return;
                }
                resolve(stdout.trim());
            });
        });
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
        console.log(resultObj);
        return resultObj;
    }

    // ### memory, cpu, disk
    top_cpu() {
        // top -bn1 | grep "Cpu(s)" | awk '{print 100 - $8"%"}'
        // console.log(`${(30 + (Math.random() * 10)).toFixed(1)}%`);
        return `${(Math.random() * 10 + 30).toFixed(1)}%`;
    }

    serverStatus() {
        const os = require("os");
        const memory = {
            "usingMemory": (os.totalmem() - os.freemem()),
            "totalMemory": os.totalmem(),
        };

        const cpu = {
            "cpuUtilization": this.top_cpu(),
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
    last() {
        return `
        c21st11  pts/1        211.234.199.10   Thu Feb 20 19:03   still logged in
        c21st12  pts/5        1.215.36.250     Thu Feb 20 18:02 - 18:04  (00:02)
        c17st11  pts/4        211.234.200.24   Thu Feb 20 17:52   still logged in
        c20st13  pts/1        14.38.218.60     Sun Feb  9 11:34 - 13:18  (01:44)
        c21st08  pts/1        39.117.160.50    Sun Feb  9 01:00 - 06:50  (05:50)

        wtmp begins Sun Feb  9 00:33:23 2025
    `;
    }

    lastToJSON() {
        const result = [];
        const user = this.last().trim().split("\n");
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

    // ping -c 1 8.8.8.8
    ping() {
        const randomPing = ((Math.random() * 10 + 30).toFixed(1))
        // console.log(randomPing);
        return (`
            PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
            64 바이트 (8.8.8.8에서): icmp_seq=1 ttl=56 시간=${randomPing} ms

            --- 8.8.8.8 핑 통계 ---
            1 패킷이 전송되었습니다, 1 수신되었습니다, 0% 패킷 손실, 시간 0ms
            rtt 최소/평균/최대/표준편차 = 35.221/35.221/35.221/0.000 ms
        `).trim();
    }

    pingToJson() {
        const resultObj = { "pingResponse": 0 };
        const pingData = this.ping().split("\n").filter((line) => {
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

    getData() {
        this.init();
        // this.lastToJSON();
        return {
            "ifconfig": this.ifconfigToJSON(),
            "runtime": this.uptime(),
            "serverStatus": this.serverStatus(),
            "ping": this.pingToJson(),
            "userList": this.lastToJSON(),
        };
    }
}

const commands = new Commands("commands");
commands.getData();
module.exports = commands;