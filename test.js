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
    `);
}

const setData = () => {
    const packets = func();

    // for (i in )
}

// setInterval(func(), 1000)