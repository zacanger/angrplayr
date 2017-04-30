#!/usr/bin/env node

const StreamPlayer = require('stream-player')
const player = new StreamPlayer()
const { exit, getArgs, getBasename, resolveFiles } = require('zeelib')
const args = getArgs()
if (!args || (args && !args.length)) exit(0)
const theFiles = resolveFiles(args)

theFiles.forEach((file) => {
  player.add(file, getBasename(file))
})

player.play()

player.on('play start', () => {
  console.log(`>> ${player.nowPlaying().track}`)
})
