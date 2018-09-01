'use strict'

const redisCli = require('../helpers/redis')
const key = 'FRAME_ID'



async function buildFrameId() {
  const id = await redisCli.incr(key)
  let frameId = await redisCli.get(key)
  if (frameId == 65536) {
    let frameId = 0
    await redisCli.set(key, frameId)
  }
  return Number(frameId) - 1
}




// 复位命令
async function reset(resBuffer) {
  const resetBuffer = Buffer.alloc(3)
  const frameId = await buildFrameId()
  resetBuffer.writeUInt16LE(frameId)
  resetBuffer.writeUInt8(0)
  return Buffer.concat([resBuffer, resetBuffer], resetBuffer.length + resBuffer.length)
}


// 读配置命令
async function readConfig() {
  const
}
