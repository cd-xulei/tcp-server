'use strict'

const net = require('net')

// const HOST = '47.106.193.158'
const HOST = '127.0.0.1'
const PORT = 3389
// const HOST = '116.62.89.79'
// const PORT = 10030

function netf () {
  const client = net.createConnection({ port: PORT, host: HOST })

  client.write(
    '3a1d070600000000001a0000000000160017300539904e450100000007001755be3e1f08c0f5f087ef925da4a76f3f3807'
  )
  client.end()

  client.on('data', data => {
    client.end()
  })

  client.on('end', () => {
    console.log('end')
  })
}

netf()
