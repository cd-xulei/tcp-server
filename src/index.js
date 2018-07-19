'use strict'

const net = require('net')
const logger = require('./helpers/logger.js').getLogger('index')

const PORT = process.env.PORT || 3389
const server = net.createServer()
const _ = require('lodash')

// route
const heart = require('./protocol/heart.js')

const sockets = {}

server.on('connection', function (socket) {
  server.getConnections((err, count) => {
    if (err) {
      return logger.error('读取连接数量出错:', err.message)
    }
    if (count) {
      logger.debug('连接数量:', count)
    }
  })
  // 从连接中读取数据
  socket.on('data', async (buffer) => {
    logger.debug('接收的hex串:', buffer.toString('hex'))
    if (!Buffer.isBuffer(buffer)) return
    if (buffer.length < 32) return
    if (buffer.toString('hex', 0, 2) !== 'aa55') return
    const res = await heart(buffer)
    // 经历过心跳后 每个 socket都应该被存储
    // sockets[res.machineId] = Object.assign(_.omit(res, ['resBuffer']), { socket })
    socket.write(res.resBuffer)
  })
  // 删除被关闭的连接
  socket.on('close', function (bool) {
    const log = bool ? '传输错误引起 socket 关闭' : 'socket 关闭连接'
    logger.debug(log)
  })
  socket.on('error', function (err) {
    logger.error('socket 报错:', err.message)
    logger.error('socket 报错:', err.stack)
    socket.destroy()
  })
})

server.on('error', function (err) {
  logger.error('tcp服务报错:', err.message)
  logger.error('tcp服务报错:', err.stack)
})

server.on('close', function () {
  logger.debug('tcp服务关闭')
})

server.listen(PORT, () => {
  const address = server.address()
  logger.debug(`tcp server listening on ${address.port}`)
})
