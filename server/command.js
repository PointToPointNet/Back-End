// ifconfig
const ifconfig = () => {
    return (`
        enp0s25: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 110.5.238.107  netmask 255.255.255.128  broadcast 110.5.238.127
        inet6 fe80::f900:ed1d:473c:e9d0  prefixlen 64  scopeid 0x20<link>
        ether f0:de:f1:45:d1:33  txqueuelen 1000  (Ethernet)
        RX packets 31499952  bytes 14872699632 (14.8 GB)
        RX errors 0  dropped 173  overruns 0  frame 0
        TX packets 44796728  bytes 42813807568 (42.8 GB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
        device interrupt 20  memory 0xf2600000-f2620000  

        lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 39109789  bytes 29185449490 (29.1 GB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 39109789  bytes 29185449490 (29.1 GB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
    `).trim();
}

const ifconfigToJSON = (ifconfig) => {
    const resultObj = {};
    const slicedNetwork = ifconfig.trim().split("\n\n").map((network) => network.split("\n").map((line) => line.trim()));

    slicedNetwork.forEach((oneNetwork) => {
        const networkName = oneNetwork[0].split(":")[0].trim();
        resultObj[networkName] = {};
        sievedNetworkInfo = oneNetwork.filter((oneNetworkData) => {
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
const os = require("os");

const top_cpu = () => {
    // top -bn1 | grep "Cpu(s)" | awk '{print 100 - $8"%"}'
    // console.log(`${(30 + (Math.random() * 10)).toFixed(1)}%`);
    return `${(30 + (Math.random() * 10)).toFixed(1)}%`;
}
top_cpu();

const serverStatus = () => {
    const memory = {
        "usingMemory": (os.totalmem() - os.freemem()),
        "totalMemory": os.totalmem(),
    };

    const cpu = {
        "cpuUtilization": top_cpu(),
    };

    const disk = {

    };

    return {"memory": memory, "cpu": cpu, "disk": disk};
}
serverStatus();

// ### runtime
const uptime = () => {
    return { "runtime": Math.floor(os.uptime() / (60)) };
}

// ### last
const last = () => {
    return `
        c21st11  pts/1        211.234.199.10   Thu Feb 20 19:03   still logged in
        c21st12  pts/5        1.215.36.250     Thu Feb 20 18:02 - 18:04  (00:02)
        c17st11  pts/4        211.234.200.24   Thu Feb 20 17:52   still logged in
        c20st13  pts/1        14.38.218.60     Sun Feb  9 11:34 - 13:18  (01:44)
        c21st08  pts/1        39.117.160.50    Sun Feb  9 01:00 - 06:50  (05:50)

        wtmp begins Sun Feb  9 00:33:23 2025
    `;
}

const lastToJSON = (last) => {
    const user = last.trim()

    
}

module.exports = {
    "ifconfig": ifconfigToJSON(ifconfig()),
    "runtime": uptime(),
    "serverStatus": serverStatus(),
};