const si = require('systeminformation');
const mysql = require('mysql2/promise');
const info = require("../src/database/info");

class InsertStatistics {
    constructor() {
        // 네트워크 관련 변수
        this.preRX = 0;
        this.preTX = 0;
        this.acumulativeRX_total = 0;
        this.acumulativeTX_total = 0;

        // 측정 및 평균 관련 변수
        this.flag = 1;
        this.mem_usage = 0;
        this.mem_avg = 0;
        this.cpu_usage = 0;
        this.cpu_avg = 0;
        this.mem_swap_usage = 0;
        this.mem_swap_avg = 0;

        // 인터벌 ID 보관 (필요시 종료할 수 있도록)
        this.statisticsInterval = null;
        this.insertInterval = null;
    }

    async getStatistics() {
        try {
            // 메모리 측정 및 평균 계산
            const mem = await si.mem();
            this.mem_usage += ((mem.total - mem.free) / mem.total) * 100;
            this.mem_avg = this.mem_usage / this.flag;

            // 스왑 메모리 사용량 측정 (swaptotal이 0이면 계산 생략)
            if (mem.swaptotal > 0) {
                this.mem_swap_usage += (mem.swapused / mem.swaptotal) * 100;
                this.mem_swap_avg = this.mem_swap_usage / this.flag;
            } else {
                this.mem_swap_avg = 0;
            }

            console.log("mem_avg :", this.mem_avg);
            console.log("mem_swap_avg :", this.mem_swap_avg);

            // CPU 사용량 측정 및 평균 계산
            const cpus = await si.currentLoad();
            this.cpu_usage += cpus.currentLoad;
            this.cpu_avg = this.cpu_usage / this.flag;
            console.log("cpu_avg :", this.cpu_avg);

            // 네트워크 데이터 측정
            const interfaces = await si.networkInterfaces();
            const openIfaces = interfaces.filter(itf => itf.operstate === "up");
            const ifaceNames = openIfaces.map(itf => itf.iface);

            if (ifaceNames.length > 0) {
                const iface = await si.networkStats(ifaceNames[0]);
                const netData = iface[0];

                const diffRX = this.preRX === 0 ? 0 : netData.rx_bytes - this.preRX;
                const diffTX = this.preTX === 0 ? 0 : netData.tx_bytes - this.preTX;

                this.acumulativeRX_total += diffRX;
                this.acumulativeTX_total += diffTX;

                this.preRX = netData.rx_bytes;
                this.preTX = netData.tx_bytes;
                console.log("RX 누적:", this.acumulativeRX_total, "TX 누적:", this.acumulativeTX_total);
            } else {
                console.log("활성화된 네트워크 인터페이스가 없습니다.");
            }
            
            this.flag++;
        } catch (err) {
            console.error("getMetrics error:", err);
        }
    }

    async insertDB() {
        try {
            const now = new Date();
            const [today, timeWithMs] = now.toISOString().split("T");
            const time = timeWithMs.split(".")[0];

            const db = await mysql.createConnection(info);
            console.log("DB 연결 성공");

            // Memory Usage 삽입
            const mem_sql = `INSERT INTO memory_usage VALUES (NULL, 1, ${Math.round(this.mem_avg)}, '${today}', '${time}');`;
            let [memResult] = await db.query(mem_sql);
            console.log("Memory Usage INSERT 완료:", memResult);

            // CPU Usage 삽입
            const cpu_sql = `INSERT INTO cpu_usage VALUES (NULL, 1, ${Math.round(this.cpu_avg)}, '${today}', '${time}');`;
            let [cpuResult] = await db.query(cpu_sql);
            console.log("CPU Usage INSERT 완료:", cpuResult);

            // Swap Memory Usage 삽입
            const swap_sql = `INSERT INTO memory_swap_usage VALUES (NULL, 1, ${Math.round(this.mem_swap_avg)}, '${today}', '${time}');`;
            let [swapResult] = await db.query(swap_sql);
            console.log("Swap Memory Usage INSERT 완료:", swapResult);

            // Packet Usage 삽입
            const totalPacket = this.acumulativeRX_total + this.acumulativeTX_total;
            const packet_sql = `INSERT INTO packet_usage VALUES (NULL, 1, ${this.acumulativeTX_total}, ${this.acumulativeRX_total}, ${totalPacket}, '${today}', '${time}');`;
            let [packetResult] = await db.query(packet_sql);
            console.log("Packet Usage INSERT 완료:", packetResult);

            // DB 연결 종료
            await db.end();
            console.log("DB 연결 종료 및 값 초기화 완료");

            // 측정값 초기화 (새로운 주기를 위해)
            this.preRX = 0;
            this.preTX = 0;
            this.acumulativeRX_total = 0;
            this.acumulativeTX_total = 0;
            this.flag = 1;
            this.mem_usage = 0;
            this.mem_avg = 0;
            this.cpu_usage = 0;
            this.cpu_avg = 0;
            this.mem_swap_usage = 0;
            this.mem_swap_avg = 0;
        } catch (err) {
            console.error("insertDB error:", err);
        }
    }

    start() {
        // 2초마다 측정 실행
        this.statisticsInterval = setInterval(() => {
            this.getStatistics();
        }, 2000);

        // 30분마다 DB 삽입 실행
        this.insertInterval = setInterval(() => {
            this.insertDB();
        }, 1800000);
    }

    stop() {
        if (this.statisticsInterval) clearInterval(this.statisticsInterval);
        if (this.insertInterval) clearInterval(this.insertInterval);
    }
}

module.exports = InsertStatistics;