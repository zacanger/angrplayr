#!/usr/bin/env node

if (module.parent) {
  console.log('please use the `ap` command!')
  process.exit(1)
}

require('./lib/index.js')
