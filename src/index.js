import MPlayer from 'mplayer'
import { parseFile } from 'music-metadata'
import React, { Component } from 'react'
import blessed from 'blessed'
import { render } from 'react-blessed'
import { Grid, Tree, Gauge } from 'react-blessed-contrib'
import exit from 'zeelib/lib/exit'
import {
  getDisplayName,
  getPercent,
  isAudioFile,
  lstat,
  readdir
} from './util'

// temporary, for logging; console.log writes to the blessed screen, which is a mess
// `log(something)` and tail -f log in another terminal
import fs from 'fs'
const log = (s) => { fs.appendFileSync('log', s + '\n') }

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

const loadChildren = async (self, cb) => {
  let result = {}
  try {
    let selfPath = self.getPath(self)
    // List files in this directory
    let children = await readdir(selfPath + '/')

    // childrenContent is a property filled with self.children() result
    // on tree generation (tree.setData() call)
    for (let child in children) { // eslint-disable-line guard-for-in
      child = children[child]
      const completePath = selfPath + '/' + child
      if ((await lstat(completePath)).isDirectory()) {
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
      paused: false,
      volume: 50,
      filename: '',
      progress: 0,
      position: 0,
      duration: 0,
      intervalId: null,
      audioFiles: []
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
    const intervalId = setInterval(this.updatePosition, 1000)
    this.setState({ intervalId })
  }

  filterAudioFiles = (t) => {
    // const path = node.getPath(node) || '/'
    // if (isAudioFile(path)) {
      // this.playTrack(path)
    // }

    const cs = t && t.childrenContent
    const files = Object.keys(cs).map((c) => t.getPath(cs[c]))
    this.setState({ files, cs, t })
    // const files = Object.keys(cs || {})
    /// const audioFiles = files.filter((p) => p && isAudioFile(p))
    /// this.setState({ audioFiles})
  }

  seekBack = () => {
    this.player.seekPercent(parseFloat(this.state.progress - 5))
  }

  seekForward = () => {
    this.player.seekPercent(parseFloat(this.state.progress + 5))
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
    this.setState({ foo: this.tree.widget })
    this.clear()
  }

  updatePosition = () => {
    const p = this.player.status && this.player.status.position
    if (p) {
      this.setState({
        position: p,
        progress: getPercent(this.state.duration, parseFloat(p))
      })
    }
  }

  quit = () => {
    exit()
  }

  togglePause = () => {
    if (this.state.paused) {
      this.player.play()
    } else {
      this.player.pause()
    }
    this.setState({ paused: !this.state.paused })
  }

  volumeDown = () => {
    const newVol = this.state.volume - 5
    this.player.volume(newVol)
    this.setState({ volume: newVol })
  }

  volumeUp = () => {
    const newVol = this.state.volume + 5
    this.player.volume(newVol)
    this.setState({ volume: newVol })
  }

  reRender = () => {
    this.tree.widget.setData(explorer)
    this.props.screen.render()
  }

  playTrack = async (p) => {
    const { format, common } = await parseFile(p, { duration: true })
    this.player.openFile(p)
    this.player.volume(this.state.volume)
    this.setState({
      filename: getDisplayName(p, common),
      duration: format.duration
    })
  }

  onSelect = async (node) => {
    loadChildren(node, this.reRender)
    const path = node.getPath(node) || '/'
    if (isAudioFile(path)) {
      this.playTrack(path)
    }
    this.filterAudioFiles(node)
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
