'use strict'

/**
 * 解析心跳包
 */

const logger = require('../helpers/logger.js').getLogger('heart')
const crypto = require('crypto')

const pwdBuffer = Buffer.from([
  0x42, 0x12, 0xee, 0x75, 0xea, 0x88, 0x58, 0x66, 0x79, 0xa8,
  0x6a, 0x48, 0xae, 0xc8, 0xbb, 0xd7, 0xd4, 0x12, 0x01, 0xae,
  0xc6, 0x00, 0xce, 0x88, 0xaa, 0xae, 0x64, 0xaa, 0x00, 0x00,
  0x00, 0x00
])

const fixVal = Buffer.from([
  0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0xee, 0x00, 0x00, 0x00, 0x00,
  0x01, 0x23, 0x00, 0x00
])

let MachineType = {}
MachineType[MachineType['MachineTypeNormal'] = 1] = 'MachineTypeNormal'
MachineType[MachineType['MachineTypeDirect'] = 2] = 'MachineTypeDirect'
// MachineType[MachineType["MachineTypeTurnover"] = 3] = "MachineTypeTurnover";

module.exports = async function heartHandler (rawBuffer) {
  let beginSign = rawBuffer.toString('hex', 0, 2)// 头
  let machineId = rawBuffer.toString('ascii', 2, 18)// 设备id
  let random = rawBuffer.readUInt32LE(18)// 随机值
  let version = rawBuffer.toString('hex', 22, 26)// 固定版本

  let speed = rawBuffer.readUInt16BE(26)// 风机转速
  let wifi = rawBuffer.readUInt8(28)// wifi强度
  let mobileData = rawBuffer.readUInt8(29)// 移动数据强度
  let flag = rawBuffer.readUInt8(30)// 发送标志 0-wifi 1-移动数据
  let frameType = rawBuffer.readUInt8(31)// 帧类型 0-心跳 1-命令
  logger.debug(`收到设备${machineId}帧类型`, frameType)

  if (frameType === 1) return null

  const nowTime = ~~(Date.now() / 1000)
  const mType = MachineType.MachineTypeNormal
  const resBuffer = Buffer.alloc(64)
  resBuffer.writeUInt16LE(0x55AA, 0) // 头
  resBuffer.write(machineId, 2, 16, 'ascii')// 机器id
  resBuffer.writeUInt32LE(random, 18)// 随机码
  resBuffer.writeUInt32LE(nowTime, 22)// 当前时间

  let activitedTimeStr = null
  let activitedTime = activitedTimeStr == null ? 0 : Number(activitedTimeStr)

  if (mType === MachineType.MachineTypeNormal) {
    resBuffer.writeUInt32LE(nowTime + 300, 26)
  } else {
    resBuffer.writeUInt32LE(activitedTime, 26)
  }// 关闭时间
  resBuffer.writeInt8(0x00, 30)// 保留位
  resBuffer.writeInt8(0x00, 31)// 帧类型

  let clcData = Buffer.alloc(88)
  pwdBuffer.copy(clcData, 0)
  resBuffer.copy(clcData, 32, 0, 32)
  fixVal.copy(clcData, 64)
  let HashFunc = crypto.createHash('sha256')
  HashFunc = HashFunc.update(clcData).digest()

  HashFunc.copy(resBuffer, 32)

  logger.debug('回复 心跳报文 hex串', resBuffer.toString('hex'))
  return {
    resBuffer,
    machineId,
    frameType
  }
}
