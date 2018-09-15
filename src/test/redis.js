'use strict'

const Redis = require('ioredis')

const redisCli = new Redis({
  port: 6379,
  host: '127.0.0.1',
  family: 4,
  password: '',
  db: 0
})



async function build(params) {
  const id = await redisCli.incr('mm')
  console.log(id)
  let getId = await redisCli.get('mm')
  if (getId == 4) {
    let getId = 0
    await redisCli.set('mm', getId)
  }
  console.log(getId-1)
  return getId
}

async function mm() {
  redisCli.publish('12','inu')
}
mm()

// build().then(() => process.exit())
