#!/usr/bin/env node

const exit = require('zeelib/lib/exit').default
require('babel-polyfill')

if (module.parent) {
  console.log('please use the `ap` command!')
  exit(1)
}

require('./lib/index.js')
