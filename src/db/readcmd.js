'use strict'

const redisCli = require('../helpers/redis')

module.exports = function (machineId) {
    const key = `CMD_${machineId}`
    return redisCli.get(key)
}
