import fs from 'fs'
import MPlayer from 'mplayer'
import { parseFile } from 'music-metadata'
import mime from 'mime'
import React, { Component } from 'react'
import blessed from 'blessed'
import { render } from 'react-blessed'
import { Grid, Tree, Gauge } from 'react-blessed-contrib'
import exit from 'zeelib/lib/exit'
import promisify from 'zeelib/lib/promisify'
import isFile from 'zeelib/lib/is-file'
import { any } from 'prop-types'

// this is just until i figure out metadata
const getDisplayName = (s) => {
  const a = s.split('/')
  if (a.length > 1) {
    const f = a[a.length - 1]
    const d = a[a.length - 2]
    return `${d} - ${f}`
  }
  return ''
}

const lstat = promisify(fs.lstat)
const readdir = promisify(fs.readdir)
const getPercent = (total, bit) => bit / total * 100
const isAudio = (s) => /audio/i.test(mime.lookup(s))

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
      intervalId: null
    }

    this.player = new MPlayer()
    this.player.on('stop', this.clear)
  }

  static propTypes = {
    screen: any
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

    // screen.key([ 'h', 'j', 'k', 'l' ], () => { }) // map to arrows?

    this.tree.focus()
    loadChildren(explorer, this.reRender)
    setInterval(this.updatePosition, 1000)
  }

  seekBack = () => {
    this.player.seekPercent(parseFloat(this.state.progress - 5))
  }

  seekForward = () => {
    this.player.seekPercent(parseFloat(this.state.progress + 5))
  }

  clear = () => {
    this.setState({
      filename: '',
      progress: 0,
      position: 0,
      duration: 0
    })
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

  advance = () => {

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
    this.tree.setData(explorer)
    this.props.screen.render()
  }

  onSelect = async (node) => {
    loadChildren(node, this.reRender)
    const path = node.getPath(node) || '/'
    if (isFile(path) && isAudio(path)) {
      const { format } = await parseFile(path, { duration: true })
      this.player.openFile(path)
      this.player.volume(this.state.volume)
      this.setState({
        filename: getDisplayName(path),
        duration: format.duration
      })
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
