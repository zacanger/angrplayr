#!/usr/bin/env node

const fs = require('fs')
const Lame = require('lame')
const path = require('path')
const Speaker = require('speaker')
const args = process.argv[2]
// const args = process.argv.slice(2)
if (!args) process.exit(0)

const getFiles = (list) => list.map(item => path.resolve(item))
const theFiles = getFiles([args])

theFiles.forEach(file => {
  fs.createReadStream(file)
  .pipe(new Lame.Decoder())
  .pipe(new Speaker())
})
