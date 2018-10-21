'use strict'

const logger = require('../helpers/logger').getLogger('handle')
// 解析心跳数据后
const redisCli = require('../helpers/redis')
const sendCmdFunc = require('./sendCmdFunc')
const hashFunc = require('../helpers/hashFunc.js')

module.exports = async function (params) {
    let { machineId, resBuffer, frameType } = params
    if (frameType === 1) {
        logger.debug('收到命令帧')
    }

    // 得到一个16进制的命令的字符串 带上0x标识
    let cmd = await redisCli.get(`CMD_${machineId}`)
    logger.debug('redis中读到的命令码:', `CMD_${machineId}`, cmd)
    // 不存在 则直接回复心跳
    if (!cmd) return params
    try {
        cmd = JSON.parse(cmd)
    } catch (err) {
        logger.error('后端向redis中写命令 格式出错', err.message)
    }
    // await redisCli.del(`CMD_${machineId}`)
    // 根据命令码写命令包
    if (sendCmdFunc[cmd.cmdHexCode]) {
        // 改为命令帧
        resBuffer.writeInt8(0x01, 31)
        resBuffer = await sendCmdFunc[cmd.cmdHexCode](resBuffer, cmd)
        // 加签名
        resBuffer = hashFunc(resBuffer)
        return { ...params, resBuffer }
    }

    return params
}
