import mime from 'mime'
import fs from 'fs'
import isFile from 'zeelib/lib/is-file'
import getHome from 'zeelib/lib/get-user-home'

export const lstat = fs.lstatSync
export const readdir = fs.readdirSync
export const getPercent = (total, bit) => bit / total * 100
export const isAudio = (s) => /audio/i.test(mime.getType(s))
export const isAudioFile = (file) => isFile(file) && isAudio(file)
export const isDirectory = (path) => lstat(path).isDirectory()
export const isNotHidden = (file) => !file.startsWith('.')
export const configPath = getHome() + '/.config/angrplayr.json'

export const stripFileExt = (s = '') =>
  s.includes('.') && isNotHidden(s)
    ? s.substr(0, s.lastIndexOf('.'))
    : s

export const getDisplayName = (s, common = {}) => {
  const a = s.split('/')
  if (a.length > 1) {
    const albumName = common.album || a[a.length - 2]
    const artistName = common.artist || ''
    const track = common.title || stripFileExt(a[a.length - 1])
    const artist = artistName ? `${artistName} - ` : ''
    const album = albumName ? `${albumName} - ` : ''
    return `${artist}${album}${track}`
  }
  return ''
}
