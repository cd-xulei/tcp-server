'use strict'

const net = require('net')

const HOST = '47.106.193.158'
// const HOST = '127.0.0.1'
const PORT = 8181
// const HOST = '116.62.89.79'
// const PORT = 10030

const buff1 = 'aa55363636303030303030303030303030315608bad801020302000000000000'
const buff2 = 'AA5536363630303030303030303030303037005B1CD701020305005000060100'

function netf () {
    const client = net.createConnection({ port: PORT, host: HOST })

    client.write(Buffer.from(buff1, 'hex'))

    client.on('data', data => {
        console.log(data)
    // client.end()
    })

    client.on('end', () => {
        console.log('end')
    })
}

netf()
