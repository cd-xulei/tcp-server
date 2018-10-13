'use strict'

const _ = require('lodash')

const tem = {
    machineId: {
        len: 16 - 0 + 1,
        startAt: 0
    },
    hardwareInfo: {
        len: 33 - 17 + 1,
        startAt: 17
    },
    protocol: {
        len: 37 - 34 + 1,
        startAt: 34
    },
    ip: {
        len: 53 - 38 + 1,
        startAt: 38
    },
    remotePort: {
        len: 59 - 54 + 1,
        startAt: 54
    },
    localPort: {
        len: 65 - 60 + 1,
        startAt: 60
    },
    wifi: {
        len: 98 - 66 + 1,
        startAt: 66
    },
    wifiSecretType: {
        len: 100 - 99 + 1,
        startAt: 99
    },
    wifiPass: {
        len: 164 - 101 + 1,
        startAt: 101
    },
    wifiChannel: {
        len: 167 - 165 + 1,
        startAt: 165
    },
    apn: {
        len: 65,
        startAt: 168
    }
}

function buildConfigBuffer (json) {
    const len = _.reduce(tem, (count, val) => {
        count += val.len
        return count
    }, 0)
    const configBuffer = Buffer.alloc(len)
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
