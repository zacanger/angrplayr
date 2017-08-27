#!/usr/bin/env node

import StreamPlayer from 'stream-player'
import exit from 'zeelib/lib/exit'
import getArgs from 'zeelib/lib/get-args'
import getBasename from 'zeelib/lib/get-basename'
import resolveFiles from 'zeelib/lib/resolve-files'

const player = new StreamPlayer()
const args = getArgs()

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

player.on('play end', () => {
  console.log('next!')
})

player.on('song added', (a) => {
  console.log(`added ${a}`)
})
