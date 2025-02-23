const fs = require('fs');
const path = require('path');
const si = require('systeminformation');
const mysql = require('mysql2/promise');
const info = require("../src/database/info");
// const sqlTemplate = require("../database/sqlTemplate");


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

const getMetrics = async () => {
    const mem = await si.mem();
    mem_usage += ((mem.total - mem.free) / mem.total) * 100;
    mem_avg = mem_usage / flag;

    console.log("mem_avg : " + mem_avg);
    // console.log(((mem.total - mem.free) / mem.total).toFixed(2) * 100);

    //const { cpus } = await si.currentLoad();
    //const cpu_avg = cpus.reduce((add, cpu) => add + Number(cpu.load), 0) / cpus.length;
    const cpus = await si.currentLoad();
    cpu_usage += cpus.currentLoad;
    cpu_avg = cpu_usage / flag++;

    console.log("cpu_avg : " + cpu_avg);
    // console.log(cpuUsage);

    const interfaces = await si.networkInterfaces();
    // console.log(interfaces)
    const getOpenInterfaces = interfaces.filter(itf => itf.operstate === "up");
    // console.log(getOpenInterfaces);
    const getIface = getOpenInterfaces.map(itf => itf.iface);
    const iface = await si.networkStats(getIface[0]);
    const netData = iface[0];

    const diffRX = preRX === 0 ? 0 : netData.rx_bytes - preRX;
    const diffTX = preTX === 0 ? 0 : netData.tx_bytes - preTX;

    // 누적값에 현재 차이를 더함
    acumulativeRX_total += diffRX;
    acumulativeTX_total += diffTX;

    preRX = netData.rx_bytes;
    preTX = netData.tx_bytes;
    console.log("RX 누적:", acumulativeRX_total, "TX 누적:", acumulativeTX_total);
    console.log(flag);
}

const insertDB = async (mem_avg, cpu_avg, acumulativeRX_total, acumulativeTX_total) => {
    try {
        const date = new Date();
        const splitedDate = date.toISOString().split("T");
        const today = splitedDate[0];
        const time = splitedDate[1].split(".")[0]
        //Memory
        const db = await mysql.createConnection(info);
        const mem_sql = `insert into memory_usage values( null, 1, ${parseInt(mem_avg)},'${today}','${time}' );`
        await db.query(mem_sql);
        //CPU
        const cpu_sql = `insert into cpu_usage values( null, 1, ${parseInt(cpu_avg)},'${today}','${time}' )`
        await db.query(cpu_sql);
        //Packet
        const packet_sql = `insert into packet_usage values(null, 1, ${acumulativeTX_total}, ${acumulativeRX_total}, ${acumulativeRX_total + acumulativeTX_total}, '${today}', '${time}')`;
        await db.query(packet_sql);


        //초기화
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
    } catch (err) {
        console.log(err);
    }
}



setInterval(() => {
    getMetrics();
}, 2000)

setInterval(() => {
    insertDB(mem_avg, cpu_avg, acumulativeRX_total, acumulativeTX_total)
}, 10000); 
