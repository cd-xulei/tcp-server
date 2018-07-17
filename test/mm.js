const bodyBuffer = Buffer.alloc(8)
// unix 时间戳
let timestamp = Math.round(new Date().getTime() / 1000)
// bodyBuffer.writeUIntBE(timestamp, 0, 8)
bodyBuffer.writeUInt32LE(timestamp, 0)
console.log(bodyBuffer)
