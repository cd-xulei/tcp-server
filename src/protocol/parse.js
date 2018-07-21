'use strict'

// const logger = require('../helpers/logger.js').getLogger('parse')

module.exports = async function (rawBuffer) {
  const params = {
    beginSign: rawBuffer.toString('hex', 0, 2), // 头
    machineId: rawBuffer.toString('ascii', 2, 18), // 设备id
    random: rawBuffer.readUInt32LE(18), // 随机值
    version: rawBuffer.toString('hex', 22, 26), // 固定版本

    speed: rawBuffer.readUInt16LE(26), // 风机转速
    wifi: rawBuffer.readUInt8(28), // wifi强度
    mobileData: rawBuffer.readUInt8(29), // 移动数据强度
    flag: rawBuffer.readUInt8(30), // 发送标志 0-wifi 1-移动数据
    frameType: rawBuffer.readUInt8(31) // 帧类型 0-心跳 1-命令
  }
  return params
}
