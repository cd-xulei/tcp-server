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

function buildConfigBuffer (json) {
    const len = _.reduce(tem, (count, val) => {
        count += val.len
        return count
    }, 0)
    const configBuffer = Buffer.alloc(len)
    logger.info('写配置长度', len, configBuffer)
    if (_.isEmpty(json)) return configBuffer
    _.forEach(tem, (val, key) => {
        if (json[key]) {
            configBuffer.write(json[key], val.startAt, val.len, 'ascii')
        }
    })
    return configBuffer
}

module.exports = {
    buildConfigBuffer
}
