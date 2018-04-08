# angrplayr

A music player for the console, in Node.

![screenshot](/screenshot.png?raw=true)

* [Roadmap](./ROADMAP.md)
* [Changes](./CHANGES.md)
* [License](./LICENSE.md)

--------

### Installation

`npm i -g angrplayr`

`angrplayr` uses [MPlayer](http://www.mplayerhq.hu/design7/dload.html) under the
hood, so you'll need that installed as well. This module will fail to install if
you don't have `mplayer` in your path somewhere.

#### Important

`angrplayr` requires at least Node verson 6 and does not work on Windows.

### Unfeatures

* No playlists
* No shuffle
* No streaming
* No video
* No GUI
* No remote control

### Usage

`angrplayr`

This will open a file explorer in your terminal. Use arrows to find an audio
file, and hit `enter` to play.

#### Keys:

* `enter` or `space`: immediately play selected file
* `p`: toggle paused/playing
* `.`: volume up
* `,`: volume down
* `;`: seek back
* `'`: seek forward

#### Config

`angrplayr` will read from a config file if it exists.
The config file must be valid JSON at `~/.config/angrplayr.json`.

Defaults:

~/.config/angrplayr.json
```json
{
  "showHiddenFiles": false
}
```

### Why?

I really love [MOC](https://github.com/jonsafari/mocp), but I use a Mac
sometimes and audio on Macs is a little weird.

I also love MPlayer, but it's a bit unfriendly sometimes.

`angrplayr` is meant to fit somewhere in between more full-featured audio
programs like CMus and MOC and command-line clients like MPlayer and MPV. Most
of the time I don't need playlists, streaming, remote control, or other
features; I just want to play audio.
