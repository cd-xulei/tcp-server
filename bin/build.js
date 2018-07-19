'use strict'

const fs = require('fs')
const path = require('path')
const packageJson = require('../package.json')

const json = {
  'name': 'tcp-server',
  'version': '1.0.0',
  'description': '',
  'main': 'index.js',
  'scripts': {
  },
  'author': '',
  'dependencies': packageJson.dependencies
}

fs.writeFileSync(path.join(__dirname, '../tcp-server/package.json'), JSON.stringify(json, null, 2))
