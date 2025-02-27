const si = require('systeminformation');
const mysql = require('mysql2/promise');
const info = require("../src/database/info");

let preRX = 0;
let preTX = 0;

let acumulativeRX_total = 0;
let acumulativeTX_total = 0;

let packet = 1;
let flag = 1;

let mem_usage = 0;
let mem_avg = 0;

let cpu_usage = 0;
let cpu_avg = 0;

let mem_swap_usage = 0;
let mem_swap_avg = 0;

const getMetrics = async () => {
    try {
        const mem = await si.mem();
        // 메모리 사용량 (%) 계산
        mem_usage += ((mem.total - mem.free) / mem.total) * 100;
        mem_avg = mem_usage / flag;
        
        // 스왑 사용량 (%): swaptotal이 0이면 계산하지 않음
        if(mem.swaptotal > 0) {
            mem_swap_usage += (mem.swapused / mem.swaptotal) * 100;
            mem_swap_avg = mem_swap_usage / flag;
        } else {
            mem_swap_avg = 0;
        }

        console.log("mem_avg : " + mem_avg);
        console.log("mem_swap_avg : " + mem_swap_avg);

        // CPU 사용량 (%) 계산
        const cpus = await si.currentLoad();
        cpu_usage += cpus.currentLoad;
        cpu_avg = cpu_usage / flag++;

        console.log("cpu_avg : " + cpu_avg);

        // 네트워크 데이터
        const interfaces = await si.networkInterfaces();
        const getOpenInterfaces = interfaces.filter(itf => itf.operstate === "up");
        const getIface = getOpenInterfaces.map(itf => itf.iface);
        const iface = await si.networkStats(getIface[0]);
        const netData = iface[0];

        const diffRX = preRX === 0 ? 0 : netData.rx_bytes - preRX;
        const diffTX = preTX === 0 ? 0 : netData.tx_bytes - preTX;

        acumulativeRX_total += diffRX;
        acumulativeTX_total += diffTX;

        preRX = netData.rx_bytes;
        preTX = netData.tx_bytes;
        console.log("RX 누적:", acumulativeRX_total, "TX 누적:", acumulativeTX_total);
        console.log("측정 횟수(flag):", flag);
    } catch (err) {
        console.error("getMetrics error:", err);
    }
};

const insertDB = async (mem_avg, cpu_avg, mem_swap_avg, acumulativeRX_total, acumulativeTX_total) => {
    try {
        const date = new Date();
        const splitedDate = date.toISOString().split("T");
        const today = splitedDate[0];
        const time = splitedDate[1].split(".")[0];
        const db = await mysql.createConnection(info);
        console.log("DB 연결 성공");

        // Memory Usage
        const mem_sql = `INSERT INTO memory_usage VALUES (NULL, 1, ${Math.round(mem_avg)}, '${today}', '${time}');`;
        let [memResult] = await db.query(mem_sql);
        console.log("Memory Usage INSERT 완료:", memResult);

        // CPU Usage
        const cpu_sql = `INSERT INTO cpu_usage VALUES (NULL, 1, ${Math.round(cpu_avg)}, '${today}', '${time}');`;
        let [cpuResult] = await db.query(cpu_sql);
        console.log("CPU Usage INSERT 완료:", cpuResult);

        // Swap Memory Usage
        const swap_sql = `INSERT INTO memory_swap_usage VALUES (NULL, 1, ${Math.round(mem_swap_avg)}, '${today}', '${time}');`;
        let [swapResult] = await db.query(swap_sql);
        console.log("Swap Memory Usage INSERT 완료:", swapResult);

        // Packet Usage
        const packet_sql = `INSERT INTO packet_usage VALUES (NULL, 1, ${acumulativeTX_total}, ${acumulativeRX_total}, ${acumulativeRX_total + acumulativeTX_total}, '${today}', '${time}');`;
        let [packetResult] = await db.query(packet_sql);
        console.log("Packet Usage INSERT 완료:", packetResult);

        // DB 연결 종료
        await db.end();
        console.log("DB 연결 종료 및 값 초기화 완료");

        // 초기화
        preRX = 0;
        preTX = 0;
        acumulativeRX_total = 0;
        acumulativeTX_total = 0;
        packet = 1;
        flag = 1;
        mem_usage = 0;
        mem_avg = 0;
        cpu_usage = 0;
        cpu_avg = 0;
        mem_swap_usage = 0;
        mem_swap_avg = 0;
    } catch (err) {
        console.error("insertDB error:", err);
    }
};

setInterval(() => {
    getMetrics();
}, 2000);

setInterval(() => {
    insertDB(mem_avg, cpu_avg, mem_swap_avg, acumulativeRX_total, acumulativeTX_total);
}, 10000);
