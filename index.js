#!/usr/bin/env node

const StreamPlayer = require('stream-player')
const player = new StreamPlayer()
const { parse, resolve } = require('path')
const args = process.argv.slice(2)
if (!args || (args && !args.length)) process.exit(0)
const getFiles = (list) => list.map((el) => resolve(el))
const theFiles = getFiles(args)

const getBasename = (a) => parse(a).base

theFiles.forEach((file) => {
  player.add(file, getBasename(file))
})

player.play()

player.on('play start', () => {
  console.log(`>> ${player.nowPlaying().track}`)
})
