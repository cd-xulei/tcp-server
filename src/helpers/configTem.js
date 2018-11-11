'use strict'

const _ = require('lodash')

const logger = require('log4js').getLogger()
const tem = {
    machineId: {
        len: 17,
        startAt: 0
    },
    hardwareInfo: {
        len: 17,
        startAt: 17
    },
    protocol: {
        len: 4,
        startAt: 34
    },
    ip: {
        len: 16,
        startAt: 38
    },
    remotePort: {
        len: 6,
        startAt: 54
    },
    localPort: {
        len: 6,
        startAt: 60
    },
    wifi: {
        len: 33,
        startAt: 66
    },
    wifiSecretType: {
        len: 2,
        startAt: 99
    },
    wifiPass: {
        len: 64,
        startAt: 101
    },

    apn: {
        len: 65,
        startAt: 165
    }
}

const fields = ['machineId', 'hardwareInfo', 'protocol', 'ip', 'remotePort', 'localPort', 'wifi', 'wifiSecretType', 'wifiPass', 'apn']

const _default = require('../config.json')
function buildConfigBuffer (json, frameId) {
    if (process.env.SET_DEFAULT) {
        json = Object.assign({}, _default, json)
    }
    const targets = fields.reduce((res, val) => {
        if (json[val]) {
            res.push(val)
        }
        return res
    }, [])
    const current = {index: 0}
    const len = _.reduce(targets, (count, val) => {
        count += tem[val].len || 0
        return count
    }, 0)

    if (_.isEmpty(targets)) {
        logger.error('后台写配置有误!')
        return
    }

    logger.info('写配置长度', len)
    const buffer = Buffer.alloc(3 + 3)
    buffer.writeUInt8(frameId, 0)
    buffer.writeUInt8(0x02, 1)
    buffer.writeUInt8(len + 3, 2)
    buffer.writeInt16BE(tem[targets[0]].startAt, 3)
    buffer.writeUInt8(len, 5)

    const configBuffer = Buffer.alloc(len)
    targets.forEach(field => {
        const mark = tem[field]
        configBuffer.write((json[field] || '').trim(), current.index, mark.len, 'ascii')
        current.index += mark.len
    })

    return Buffer.concat([buffer, configBuffer], buffer.length + configBuffer.length)
}

module.exports = {
    buildConfigBuffer
}
