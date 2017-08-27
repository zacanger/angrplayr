import fs from 'fs'
import MPlayer from 'mplayer'
import React, { Component } from 'react'
import blessed from 'blessed'
import { render } from 'react-blessed'
import { Grid, Tree, Table } from 'react-blessed-contrib'
import exit from 'zeelib/lib/exit'
import promisify from 'zeelib/lib/promisify'
import getCols from 'zeelib/lib/get-terminal-columns'
import isFile from 'zeelib/lib/is-file'
import { any } from 'prop-types'

const player = new MPlayer()

const explorer = {
  name: '/',
  extended: true,
  getPath: (self) =>
    // Custom function used to recursively determine the node path
    // If we don't have any parent, assume process.cwd()
    // Otherwise get the parent node path and add this node name
    !self.parent ? process.cwd() : self.parent.getPath(self.parent) + '/' + self.name
}

const loadChildren = async (self, cb) => {
  let result = {}
  try {
    let selfPath = self.getPath(self)
    // List files in this directory
    let children = await promisify(fs.readdir)(selfPath + '/')

    // childrenContent is a property filled with self.children() result
    // on tree generation (tree.setData() call)
    for (let child in children) { // eslint-disable-line guard-for-in
      child = children[child]
      const completePath = selfPath + '/' + child
      if ((await promisify(fs.lstat)(completePath)).isDirectory()) {
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
  state = {
    tableData: [],
    cols: 0
  }

  static propTypes = {
    screen: any
  }

  componentDidMount () {
    this.props.screen.key([ 'tab' ], () => {
      const tree = this.refs.tree
      const table = this.refs.table
      if (this.props.screen.focused === tree.rows) {
        table.focus()
      } else {
        tree.focus()
      }
    })
    this.refs.tree.focus()
    loadChildren(explorer, this._reRender)
    this.setState({ cols: getCols() / 2 })
  }

  _reRender = () => {
    this.refs.tree.setData(explorer)
    this.props.screen.render()
  }

  _onSelect = async (node) => {
    loadChildren(node, this._reRender)
    const path = node.getPath(node) || '/'
    const data = [ [ path ], [ '' ], [ path ] ]
    if (isFile(path)) {
      player.openFile(path)
    }
    this.setState({ tableData: data })
  }

  render () {
    return (
      <Grid rows={1} cols={2}>
        <Tree
          key="tree"
          ref="tree"
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
            onSelect: this._onSelect
          }}
        />
        <Table
          key="table"
          ref="table"
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

const screen = blessed.screen()

// immediately play song
screen.key([ 'enter' ], () => { })

// add song or directory to playlist on right pane
screen.key([ 'a' ], () => { })

// remove song from playlist on right pane
screen.key([ 'd' ], () => { })

// save to a playlist file
screen.key([ 's' ], () => { })

// load from a playlist file (overwriting current playlist)
screen.key([ 'o' ], () => { })

// volume up
screen.key([ 'u' ], () => { })

// volume down
screen.key([ 'y' ], () => { })

// prev in playlist
screen.key([ 'b' ], () => { })

// next in playlist
screen.key([ 'n' ], () => { })

// map to arrows
screen.key([ 'h', 'j', 'k', 'l' ], () => { })

// pause, resume
screen.key([ 'space' ], () => { })

// quit
screen.key([ 'q', 'C-c' ], () => { exit() })

render(<App screen={screen} />, screen)
