import fs from 'fs'
import React, { Component } from 'react'
import blessed from 'blessed'
import { render } from 'react-blessed'
import { Grid, Tree, Table } from 'react-blessed-contrib'
import exit from 'zeelib/lib/exit'
import promisify from 'zeelib/lib/promisify'
import dir from 'zeelib/lib/dir'

const explorer = {
  name: '/',
  extended: true,
  // Custom function used to recursively determine the node path
  getPath: (self) => {
    // If we don't have any parent, we are at tree root, so return the base case
    if (!self.parent) {
      return ''
    }

    // Get the parent node path and add this node name
    return self.parent.getPath(self.parent) + '/' + self.name
  }
}

const loadChildren = async (self, cb) => {
  let result = {}
  try {
    let selfPath = self.getPath(self)
    // List files in this directory
    let children = await promisify(fs.readdir)(selfPath + '/')

    // childrenContent is a property filled with self.children() result
    // on tree generation (tree.setData() call)
    for (let child in children) {
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
  state = { tableData: [] }

  componentDidMount () {
    this.props.screen.key([ 'tab' ], (ch, key) => {
      const tree = this.refs.tree
      const table = this.refs.table
      if (screen.focused === tree.rows) {
        table.focus()
      } else {
        tree.focus()
      }
    })
    this.refs.tree.focus()
    loadChildren(explorer, this._reRender)
  }

  _reRender = () => {
    this.refs.tree.setData(explorer)
    this.props.screen.render()
  }

  _onSelect = async (node) => {
    loadChildren(node, this._reRender)
    const path = node.getPath(node) || '/'
    let data = []

    // Add data to right array
    data.push([ path ])
    data.push([ '' ])
    try {
      // Add results
      data = data
        .concat(JSON.stringify(await promisify(fs.lstat)(path), null, 2)
          .split('\n')
          .map((e) =>
            [ e ]))
      this.setState({ tableData: data })
    } catch (e) {
      this.setState({ tableData: [
        [ e.toString() ]
      ] })
    }
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
              24, 10, 10
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

screen.key(
  [ 'escape', 'q', 'C-c' ],
  (ch, key) => {
    dir({ ch, key })
    return exit()
  }
)

render(<App screen={screen} />, screen)
