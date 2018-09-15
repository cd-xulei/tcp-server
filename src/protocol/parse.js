'use strict'


const only = require('only')
const logger = require('../helpers/logger.js').getLogger('parse')
const redisCli = require('../helpers/redis')


const channel = 'MACHINE_RELPY_INFO'



const handler = {
    // 终端回复 复位数据包
    '0x00': params => {
        redisCli.publish('channel', JSON.stringify(only(params,'machineId cmdHexCode recevieStatus')))
    },
    // 终端回复 服务端的读配置命令
    '0x01': async (params, rawBuffer) => {
        const data = {
            payloadLen: rawBuffer.readUInt16LE(36),
            waitToReadAt: rawBuffer.readUInt16LE(38),
            waitToReadLen: rawBuffer.readUInt16LE(40),
            readHex: rawBuffer.toString('hex',42)
        }
        redisCli.hmset(`${params.machineId}_CONFIG`, {
            [data.waitToReadAt]: data.readHex
        })
        return { ...params, ...data }
    },
    '0x02': params => {
        redisCli.publish('channel', JSON.stringify(only(params,'machineId cmdHexCode recevieStatus')))
    },
    // 读复位命令
    '0x0A': (params, rawBuffer) => {
        let data={}
        if (params.recevieStatus === 0) {
             data = {
                payloadLen: rawBuffer.readUInt16LE(36),
                resetTag: rawBuffer.readUInt16LE(38)
            }
        }
        redisCli.publish(key, JSON.stringify({
            ...only(params, 'machineId cmdHexCode recevieStatus'),
            data
        }))
    },
    // 清除复位命令
    '0x0B': params => {
        redisCli.publish('channel', JSON.stringify(only(params,'machineId cmdHexCode recevieStatus')))
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
        frameNum: rawBuffer.readUInt16LE(32),
        // cmd
        cmdCode: rawBuffer.readUInt8(34),
        cmdHexCode: '0x' + rawBuffer.toString('hex',34,35).toUpperCase(),
        // status 接收状态
        recevieStatus: rawBuffer.readUInt8(35)
        })
    }
    return handler[params.cmdCode] ? handler[params.cmdCode](params, rawBuffer) : params
}
