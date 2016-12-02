#!/usr/bin/env node

const
  fs = require('fs')
, Lame = require('lame')
, path = require('path')
, Speaker = require('speaker')
, args = process.argv.slice(2)
, getFiles = (list) => list.map(item => path.resolve(item))
, theFiles = getFiles(args)

theFiles.forEach(file => {
  fs.createReadStream(file)
  .pipe(new Lame.Decoder())
  .pipe(new Speaker())
})
