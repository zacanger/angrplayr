import fs from 'fs'
import MPlayer from 'mplayer'
import mime from 'mime'
import React, { Component } from 'react'
import blessed from 'blessed'
import { render } from 'react-blessed'
import { Grid, Tree, Gauge } from 'react-blessed-contrib'
import exit from 'zeelib/lib/exit'
import promisify from 'zeelib/lib/promisify'
import getCols from 'zeelib/lib/get-terminal-columns'
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
      cols: 0,
      paused: false,
      volume: 50,
      filename: ''
    }

    this.player = new MPlayer()
    // this.player.on('stop', this.advance)
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

    // screen.key([ 's' ], this.stop)
    // screen.key([ 'b' ], this.prev)
    // screen.key([ 'n' ], this.next)
    // screen.key([ 'h', 'j', 'k', 'l' ], () => { }) // map to arrows?

    this.tree.focus()
    loadChildren(explorer, this.reRender)
    this.setState({ cols: getCols() / 2 })
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
    const newVol = this.state.volume - 2
    this.player.volume(newVol)
    this.setState({ volume: newVol })
  }

  volumeUp = () => {
    const newVol = this.state.volume + 2
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
      this.player.openFile(path)
      this.player.volume(this.state.volume)
      this.setState({ filename: getDisplayName(path) })
    }
  }

  setRef = (name) => (ref) => {
    this[name] = ref
  }

  render () {
    return (
      <Grid rows={6} cols={1}>
        <Tree
          key="tree"
          ref={this.setRef('tree')}
          row={0}
          col={0}
          rowSpan={5}
          colSpan={1}
          options={{
            style: {
              text: 'red'
            },
            template: {
              lines: true
            },
            label: 'AngrPlayr',
            onSelect: this.onSelect
          }}
        />
        <Gauge
          ref={this.setRef('progress')}
          key="progress"
          data={100}
          label={this.state.filename}
          row={5}
          stroke="black"
          fill="black"
          rowSpan={1}
          colSpan={1}
          col={0}
        />
      </Grid>
    )
  }
}

const screen = blessed.screen({ fullUnicode: true, smartCSR: true })

render(<App screen={screen} />, screen)
