import fs from 'fs'
import MPlayer from 'mplayer'
import mime from 'mime'
import React, { Component } from 'react'
import blessed from 'blessed'
import { render } from 'react-blessed'
import { Grid, Tree, Table } from 'react-blessed-contrib'
import exit from 'zeelib/lib/exit'
import promisify from 'zeelib/lib/promisify'
import getCols from 'zeelib/lib/get-terminal-columns'
import isFile from 'zeelib/lib/is-file'
import { any } from 'prop-types'

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
      tableData: [],
      cols: 0,
      paused: false,
      volume: 30
    }

    this.player = new MPlayer()
  }

  static propTypes = {
    screen: any
  }

  componentDidMount () {
    const { screen } = this.props
    screen.key([ 'tab' ], () => {
      const { tree, table } = this
      if (screen.focused === tree.rows) {
        table.focus()
      } else {
        tree.focus()
      }
    })

    screen.key([ 'p' ], () => {
      if (this.state.paused) {
        this.player.play()
      } else {
        this.player.pause()
      }
      this.setState({ paused: !this.state.paused })
    })

    screen.key([ ',' ], () => {
      const newVol = this.state.volume - 1
      this.player.volume(newVol)
      this.setState({ volume: newVol })
    })

    screen.key([ '.' ], () => {
      const newVol = this.state.volume + 1
      this.player.volume(newVol)
      this.setState({ volume: newVol })
    })

    this.tree.focus()
    loadChildren(explorer, this.reRender)
    this.setState({ cols: getCols() / 2 })
  }

  reRender = () => {
    this.tree.setData(explorer)
    this.props.screen.render()
  }

  onSelect = async (node) => {
    loadChildren(node, this.reRender)
    const path = node.getPath(node) || '/'
    const data = [ [ path ], [ '' ], [ path ] ]
    if (isFile(path) && isAudio(path)) {
      this.player.openFile(path)
    }
    this.setState({ tableData: data })
  }

  setRef = (name) => (ref) => {
    this[name] = ref
  }

  render () {
    return (
      <Grid rows={1} cols={2}>
        <Tree
          key="tree"
          ref={this.setRef('tree')}
          row={0}
          col={0}
          rowSpan={1}
          colSpan={1}
          options={{
            style: {
              text: 'red'
            },
            template: {
              lines: true
            },
            label: 'Tree',
            onSelect: this.onSelect
          }}
        />
        <Table
          key="table"
          ref={this.setRef('table')}
          row={0}
          col={1}
          rowSpan={1}
          colSpan={1}
          options={{
            keys: true,
            fg: 'green',
            label: 'Playing',
            columnWidth: [
              20, 10, 10
            ],
            data: {
              headers: [ 'List' ],
              data: this.state.tableData
            }
          }}
        />
      </Grid>
    )
  }
}

const screen = blessed.screen({ fullUnicode: true, smartCSR: true })

// add song or directory to playlist on right pane
// screen.key([ 'a' ], () => { })

// remove song from playlist on right pane
// screen.key([ 'd' ], () => { })

// save to a playlist file
// screen.key([ 's' ], () => { })

// load from a playlist file (overwriting current playlist)
// screen.key([ 'o' ], () => { })

// prev in playlist
// screen.key([ 'b' ], () => { })

// next in playlist
// screen.key([ 'n' ], () => { })

// map to arrows?
// screen.key([ 'h', 'j', 'k', 'l' ], () => { })

// quit
screen.key([ 'q', 'C-c' ], () => { exit() })

render(<App screen={screen} />, screen)
