#!/usr/bin/env node

const { createReadStream } = require('fs')
const { resolve } = require('path')
const Lame = require('lame')
const Speaker = require('speaker')
const args = process.argv.slice(2)
if (!args || (args && !args.length)) process.exit(0)
const getFiles = (list) => list.map((el) => resolve(el))
const theFiles = getFiles(args)

const theStuff = (file) => (
  new Promise((resolve, reject) => {
    process.stdout.write(`>> ${file}\n`)
    createReadStream(file)
    .pipe(new Lame.Decoder())
    .pipe(new Speaker())
    .on('end', resolve)
    .on('close', () => {})
  })
)

function * doTheThings (songs) {
  while (songs.length) {
    try {
      yield theStuff(songs[0])
      if (songs.length) songs.shift()
      else return
    } catch (e) {
      return console.error('EVERYTHING IS BROKEN OH GOD', e)
    }
  }
}

const makeTheThing = (gen) => (arg) => {
  const a = gen(arg)
  while (!a.next().done) a.next()
}

const main = makeTheThing(doTheThings)

main(theFiles)
