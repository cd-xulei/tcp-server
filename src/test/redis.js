'use strict'

const Redis = require('ioredis')

const redisCli = new Redis({
    port: 6379,
    host: '127.0.0.1',
    family: 4,
    password: '',
    db: 0
})

redisCli.set('CMD_6660000000000001', JSON.stringify({
    'machineId': '6660000000000001',
    'hardwareInfo': 'LFS2101D_V0.1',
    'protocol': 'TCP',
    'ip': '47.106.193.158',
    'remotePort': '8181',
    'localPort': '000',
    'wifi': 'P-LINK_5CE9D0',
    'wifiSecretType': '',
    'wifiPass': '123456789',
    'wifiChannel': 'MN',
    'apn': 'T',
    'cmdHexCode': '0x02'
}))
