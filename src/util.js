import mime from 'mime'
import promisify from 'zeelib/lib/promisify'
import fs from 'fs'
import isFile from 'zeelib/lib/is-file'

export const lstat = promisify(fs.lstat)
export const readdir = promisify(fs.readdir)
export const getPercent = (total, bit) => bit / total * 100
export const isAudio = (s) => /audio/i.test(mime.getType(s))
export const isAudioFile = (file) => isFile(file) && isAudio(file)

const stripFileExt = (s = '') =>
  s.includes('.')
    ? s.substr(0, s.lastIndexOf('.'))
    : s

export const getDisplayName = (s, common = {}) => {
  const a = s.split('/')
  if (a.length > 1) {
    const track = common.title || stripFileExt(a[a.length - 1])
    const album = common.album || a[a.length - 2]
    const artist = common.artist || ''
    return `${artist} - ${album} - ${track}`
  }
  return ''
}
