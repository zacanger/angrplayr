#!/usr/bin/env node

const StreamPlayer = require('stream-player')
const player = new StreamPlayer()
const exit = require('zeelib/lib/exit').default
const getArgs = require('zeelib/lib/get-args').default
const getBasename = require('zeelib/lib/get-basename').default
const resolveFiles = require('zeelib/lib/resolve-files').default
const args = getArgs()

if (module.parent) {
  console.log('please use the `ap` command!')
  exit(1)
}

if (!args || (args && !args.length)) {
  console.log('usage: ap somefile.mp3')
  exit(0)
}

const theFiles = resolveFiles(args)

theFiles.forEach((file) => {
  player.add(file, getBasename(file))
})

player.play()

player.on('play start', () => {
  console.log(`>> ${player.nowPlaying().track}`)
})
