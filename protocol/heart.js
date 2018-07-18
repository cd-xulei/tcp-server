'use strict'

/**
 * 解析心跳包
 */

const logger = require('../helpers/logger.js').getLogger('heart')
const hashFunc = require('../helpers/hashFunc.js')

const redisCli = require('../helpers/redis.js')

// 设备的三种状态
let MachineType = {}
MachineType[MachineType['MachineTypeNormal'] = 1] = 'MachineTypeNormal'
MachineType[MachineType['MachineTypeDirect'] = 2] = 'MachineTypeDirect'
MachineType[MachineType['MachineTypeTurnover'] = 3] = 'MachineTypeTurnover'

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

  const stateStr = await redisCli.get(`${machineId}_state`)
  if (stateStr) {
    let mState
    try {
      mState = JSON.parse(stateStr)
    } catch (e) {
      mState = {}
    }
    if (flag === 0) {
      mState.wifi = wifi
    }
    if (flag === 1) {
      mState.mobile = mobileData
    }
    mState.speed = speed
    mState.version = buildVersionStr(version)
    await redisCli.set(`${machineId}_state`, JSON.stringify(mState))
  }

  if (frameType === 1) return null

  const nowTime = ~~(Date.now() / 1000)
  const mType = MachineType.MachineTypeNormal

  let resBuffer = Buffer.alloc(32)
  resBuffer.writeUInt16LE(0x55AA, 0) // 头
  resBuffer.write(machineId, 2, 16, 'ascii')// 机器id
  resBuffer.writeUInt32LE(random, 18)// 随机码
  resBuffer.writeUInt32LE(nowTime, 22)// 当前时间

  let activitedTimeStr = await redisCli.get(`${machineId}_activited`)
  let activitedTime = !activitedTimeStr ? 0 : Number(activitedTimeStr)

  let LastTimeStr = await redisCli.get(`${machineId}_lastTick`)
  let LastTime = !LastTimeStr ? 0 : Number(LastTimeStr)
  await redisCli.set(`${machineId}_lastTick`, nowTime.toString())

  logger.debug('activitedTimeStr:' + activitedTimeStr)
  logger.debug('activitedTime:' + activitedTime.toString())
  logger.debug('LastTimeStr:' + LastTimeStr)
  logger.debug('LastTime:' + LastTime.toString())
  logger.debug('Save nowTime:' + nowTime.toString())

  // 判断当时设备是否在使用
  if (speed > 1) {
    // 判定上次是否在使用中
    if (await redisCli.exists(`${machineId}_lastUse`)) {
      let useTime = nowTime - LastTime
      if (useTime <= 300) {
        await redisCli.incrby(`${machineId}_useTime`, useTime)
      }
    }
    await redisCli.set(`${machineId}_lastUse`, 1)
    await redisCli.expire(`${machineId}_lastUse`, 300)
  } else {
    await redisCli.del(`${machineId}_lastUse`)
  }

  if (mType === MachineType.MachineTypeNormal) {
    resBuffer.writeUInt32LE(nowTime + 300, 26)
  } else {
    resBuffer.writeUInt32LE(activitedTime, 26)
  }// 关闭时间
  resBuffer.writeInt8(0x00, 30)// 保留位
  resBuffer.writeInt8(0x00, 31)// 帧类型

  // 加上校验
  resBuffer = hashFunc(resBuffer)
  logger.debug('回复 心跳报文 hex串', resBuffer.toString('hex'))
  return {
    resBuffer,
    machineId,
    frameType
  }
}

function buildVersionStr (version) {
  let versionStr = 'V'
  for (let i = 0; i < 4; i++) {
    versionStr += parseInt(version.substr(i * 2, 2))
    if (i !== 3) {
      versionStr += '.'
    }
  }
  return versionStr
}
