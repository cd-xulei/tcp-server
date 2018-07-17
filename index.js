'use strict'

const net = require('net')
const logger = require('./helpers/logger.js').getLogger('index')

const PORT = 3389
const server = net.createServer()

const heart = require('./protocol/heart.js')

server.on('connection', function (socket) {
  // 从连接中读取数据
  socket.on('data', function (data) {
    logger.debug('原始数据', data)
    logger.debug('接收的数据 hex:', data.toString('hex'))
    heart(data)
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
      if (count > 0) {
        logger.debug('连接数量', count)
      }
    })
  }, 2000)
})
