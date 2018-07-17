'use strict'

const net = require('net')

// const HOST = '47.106.193.158'
const HOST = '127.0.0.1'
const PORT = 3389
// const HOST = '116.62.89.79'
// const PORT = 10030

const buff = 'aa55363636303030303030303030303030374141203535203336203336203336203330203330203330203330203330203330203330203330203330203330203330203330203337203030203542203143204437203031203032203033203035203030203030203030203031203031203030'

function netf () {
  const client = net.createConnection({ port: PORT, host: HOST })

  client.write(Buffer.from(buff, 'hex'))
  client.end()

  client.on('data', data => {
    client.end()
  })

  client.on('end', () => {
    console.log('end')
  })
}

netf()
