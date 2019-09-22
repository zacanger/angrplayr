import test from 'tape'
import * as util from './util'

test('util', (t) => {
  t.equal(util.getPercent(100, 1), 1, 'getPercent works')
  t.true(util.isDirectory('.'), 'isDirectory true')
  t.false(util.isDirectory('./package.json'), 'isDirectory false')
  t.true(util.isNotHidden('foo/bar'), 'isNotHidden true')
  t.false(util.isNotHidden('.foo/bar'), 'isNotHidden false')
  t.equal(
    util.stripFileExt('.foo.bar'),
    '.foo.bar',
    'stripFileExt with hidden file'
  )
  t.equal(util.stripFileExt('foo.bar'), 'foo', 'stripFileExt with regular file')
  t.end()
})
