const blessed = require('blessed')

const screen = blessed.screen({
  smartCSR: true
, useBCE: true
, cursor: { shape: 'underline' }
, dockBorders: true
, debug: true
, title: 'angrplayr'
})

const something = blessed.box({
  top: 'center'
, left: 'center'
, width: '90%'
, height: '90%'
, content: 'STUFF AND THINGS'
})

something.on('click', () => {
  something.content = 'other things?'
})

screen.append(something)
