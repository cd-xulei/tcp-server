'use strict'

const net = require('net')
const logger = require('./helpers/logger.js').getLogger('index')

const PORT = process.env.PORT || 3389
const server = net.createServer()

const heart = require('./protocol/heart.js')

server.on('connection', function (socket) {
  // 从连接中读取数据
  socket.on('data', function (buffer) {
    logger.debug('接收的数据 hex:', buffer.toString('hex'))
    if (!Buffer.isBuffer(buffer)) return
    if (buffer.length < 32) return
    if (buffer.toString('hex', 0, 2) !== 'aa55') return
    const res = heart(buffer)
    socket.write(res)
  })
  // 删除被关闭的连接
  socket.on('close', function () {
  })
})

server.on('error', function (err) {
  logger.error(err.message)
})

server.on('close', function () {
  logger.debug('server close')
})

server.listen(PORT, () => {
  logger.debug(`tcp server listening on ${PORT}`)
  setInterval(() => {
    server.getConnections((err, count) => {
      if (err) {
        return logger.error(err.message)
      }
    })
  }, 2000)
})
