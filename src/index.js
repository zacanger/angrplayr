import MPlayer from 'mplayer'
import { parseFile } from 'music-metadata'
import React, { Component } from 'react'
import blessed from 'blessed'
import { render } from 'react-blessed'
import { Grid, Tree, Gauge } from 'react-blessed-contrib'
import exit from 'zeelib/lib/exit'
import id from 'zeelib/lib/id'
import {
  configPath,
  getDisplayName,
  getPercent,
  isAudioFile,
  isDirectory,
  isNotHidden,
  readdir
} from './util'

let userConfig = {}
try {
  userConfig = require(configPath)
} catch (_) { }

const volPercent = 5

const explorer = {
  name: '/',
  extended: true,
  getPath: (self) =>
    // Recursively determine the node path
    // If we don't have any parent, assume process.cwd()
    // Otherwise get the parent node path and add this node name
    !self.parent
      ? process.cwd()
      : self.parent.getPath(self.parent) + '/' + self.name
}

const loadChildren = (self, cb) => {
  let result = {}
  try {
    let selfPath = self.getPath(self)
    // List files in this directory
    let children = readdir(selfPath + '/')
      .filter(userConfig.showHiddenFiles ? id : isNotHidden)

    // childrenContent is a property filled with self.children() result
    // on tree generation (tree.setData() call)
    for (let child in children) { // eslint-disable-line guard-for-in
      child = children[child]
      const completePath = selfPath + '/' + child
      if (isDirectory(completePath)) {
        // If it's a directory we generate the child with the children generation function
        result[child] = {
          name: child,
          getPath: self.getPath,
          extended: false,
          children: { __placeholder__: { name: 'Loading...' } }
        }
      } else {
        // Otherwise children is not set (you can also set it to "{}" or "null" if you want)
        result[child] = {
          name: child,
          getPath: self.getPath,
          extended: false
        }
      }
    }
  } catch (e) {}

  self.childrenContent = self.children = result
  cb()
}

class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      audioFiles: [],
      duration: 0,
      filename: '',
      fullPath: '',
      intervalId: null,
      paused: false,
      position: 0,
      progress: 0,
      volume: 50
    }

    this.player = new MPlayer()
    this.player.on('stop', this.playNext)
  }

  componentDidMount () {
    const { screen } = this.props

    // set up key handlers
    screen.key([ 'q', 'C-c' ], this.quit)
    screen.key([ 'p' ], this.togglePause)
    screen.key([ ',' ], this.volumeDown)
    screen.key([ '.' ], this.volumeUp)
    screen.key([ ';' ], this.seekBack)
    screen.key([ '\'' ], this.seekForward)

    // screen.key([ 'b' ], this.prev)
    // screen.key([ 'n' ], this.next)

    // screen.key([ 'h', 'j', 'k', 'l' ], () => { }) // map to arrows?

    this.tree.widget.focus()
    loadChildren(explorer, this.reRender)
  }

  filterAudioFiles = (t) => {
    const cs = t && t.children
    if (cs) {
      const files = Object.keys(cs || {}).map((c) => t.getPath(cs[c]))
      const audioFiles = files.filter(isAudioFile)
      this.setState({ audioFiles })
    }
  }

  seek = (s) => {
    this.player.seekPercent(parseFloat(s))
  }

  seekBack = () => {
    this.seek(this.state.progress - 10)
  }

  seekForward = () => {
    this.seek(this.state.progress + 10)
  }

  clear = () => {
    clearInterval(this.state.intervalId)
    this.setState({
      filename: '',
      progress: 0,
      position: 0,
      duration: 0,
      intervalId: null
    })
  }

  playNext = () => {
    this.clear()
    const { audioFiles, fullPath } = this.state
    const idx = audioFiles.indexOf(fullPath)
    const nextFile = audioFiles[idx + 1]
    if (nextFile) {
      this.playTrack(nextFile)
    }
  }

  updatePosition = () => {
    const p = this.player.status && this.player.status.position
    if (p) {
      this.setState(({ duration }) => {
        const progress = getPercent(duration, parseFloat(p))
        return {
          position: p,
          progress
        }
      })
    }
  }

  quit = () => {
    exit()
  }

  togglePause = () => {
    this.setState(({ paused: oldPaused }) => {
      if (oldPaused) {
        this.player.play()
      } else {
        this.player.pause()
      }
      return { paused: !oldPaused }
    })
  }

  adjustVolume = (f) => {
    this.setState(({ volume: oldVol }) => {
      const newVol = f(oldVol)
      this.player.volume(newVol)
      return { volume: newVol }
    })
  }

  volumeDown = () => {
    this.adjustVolume((v) => v - volPercent)
  }

  volumeUp = () => {
    this.adjustVolume((v) => v + volPercent)
  }

  reRender = () => {
    this.tree.widget.setData(explorer)
    this.props.screen.render()
  }

  playTrack = (p) => {
    parseFile(p, { duration: true })
      .then(({ format, common }) => {
        this.player.openFile(p)
        this.player.volume(this.state.volume)
        const intervalId = setInterval(this.updatePosition, 1000)
        this.setState({
          filename: getDisplayName(p, common),
          duration: format.duration,
          fullPath: p,
          intervalId
        })
      })
  }

  onSelect = (node) => {
    loadChildren(node, this.reRender)
    const path = node.getPath(node) || '/'
    if (isAudioFile(path)) {
      this.playTrack(path)
    } else if (isDirectory(path)) {
      this.filterAudioFiles(node)
    }
  }

  setRef = (name) => (ref) => {
    this[name] = ref
  }

  render () {
    const { progress, filename } = this.state

    const gaugeProps = {
      key: 'progress',
      data: progress,
      label: filename,
      row: 5,
      stroke: 'green',
      fill: 'black',
      rowSpan: 1,
      colSpan: 1,
      col: 0
    }

    const treeProps = {
      key: 'tree',
      ref: this.setRef('tree'),
      row: 0,
      col: 0,
      rowSpan: 5,
      colSpan: 1,
      options: {
        style: {
          text: 'green'
        },
        template: {
          lines: true
        },
        label: 'AngrPlayr',
        onSelect: this.onSelect
      }
    }

    const gridProps = {
      rows: 6,
      cols: 1
    }

    return (
      <Grid {...gridProps}>
        <Tree {...treeProps} />
        <Gauge {...gaugeProps} />
      </Grid>
    )
  }
}

const screen = blessed.screen({ fullUnicode: true, smartCSR: true })

render(<App screen={screen} />, screen)
