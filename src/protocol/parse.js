'use strict'

const only = require('only')
const logger = require('../helpers/logger.js').getLogger('parse')
const redisCli = require('../helpers/redis')

const channel = 'MACHINE_RELPY_INFO'

const handler = {
    // 终端回复 复位数据包
    '0x00': params => {
        logger.debug('收到终端回复 0x00')
        redisCli.publish(channel, JSON.stringify(only(params, 'machineId cmdHexCode recevieStatus')))
    },
    // 终端回复 服务端的读配置命令
    '0x01': async (params, rawBuffer) => {
        const configBuffer = rawBuffer.slice(36)

        let data = {
            machineId: configBuffer.toString('ascii', 0, 16),
            hardwareInfo: configBuffer.toString('ascii', 17, 33),
            protocol: configBuffer.toString('ascii', 34, 37),
            ip: configBuffer.toString('ascii', 38, 53),
            remotePort: configBuffer.toString('ascii', 54, 59),
            localPort: configBuffer.toString('ascii', 60, 65),
            wifi: configBuffer.toString('ascii', 66, 98),
            wifiSecretType: configBuffer.toString('ascii', 99, 100),
            wifiPass: configBuffer.toString('ascii', 101, 164),
            wifiChannel: configBuffer.toString('ascii', 165, 167),
            apn: configBuffer.toString('ascii', 168),
            cmdCode: 'Ox01',
            msg: '读到社保的配置信息'
        }
        logger.info('0x01 解回复数据', JSON.stringify(data))
        redisCli.publish(channel, JSON.stringify(data))
        return { ...params, ...data }
    },
    '0x02': params => {
        redisCli.publish(channel, JSON.stringify(only(params, 'machineId cmdHexCode recevieStatus')))
    },
    // 读复位命令
    '0x0A': (params, rawBuffer) => {
        let data = {}
        if (params.recevieStatus === 0) {
            data = {
                payloadLen: rawBuffer.readUInt16LE(36),
                resetTag: rawBuffer.readUInt16LE(38)
            }
        }
        redisCli.publish(channel, JSON.stringify({
            ...only(params, 'machineId cmdHexCode recevieStatus'),
            data
        }))
    },
    // 清除复位命令
    '0x0B': params => {
        redisCli.publish(channel, JSON.stringify(only(params, 'machineId cmdHexCode recevieStatus')))
    }
}

module.exports = async function (rawBuffer) {
    const params = {
        // 头
        beginSign: rawBuffer.toString('hex', 0, 2),
        // 设备id
        machineId: rawBuffer.toString('ascii', 2, 18),
        // 随机值
        random: rawBuffer.readUInt32LE(18),
        // 固定版本
        version: rawBuffer.toString('hex', 22, 26),
        // 风机转速
        speed: rawBuffer.readUInt16LE(26),
        // wifi强度
        wifi: rawBuffer.readUInt8(28),
        // 移动数据强度
        mobileData: rawBuffer.readUInt8(29),
        // 发送标志 0-wifi 1-移动数据
        flag: rawBuffer.readUInt8(30),
        // 帧类型 0-心跳 1-命令
        frameType: rawBuffer.readUInt8(31)
    }
    // 命令帧
    if (rawBuffer.length >= 32 && params.frameType === 1) {
        Object.assign(params, {
        // 帧号
            frameNum: rawBuffer.readUInt8(32),
            // cmd
            cmdCode: rawBuffer.readUInt8(33),
            cmdHexCode: '0x' + rawBuffer.toString('hex', 33, 34).toUpperCase(),
            // status 接收状态
            operateResult: rawBuffer.readUInt8(34),
            payloadLen: rawBuffer.readUInt8(35)
        })
        logger.debug('终端回复数据', JSON.stringify(params))
    }
    return handler[params.cmdHexCode] ? handler[params.cmdHexCode](params, rawBuffer) : params
}
