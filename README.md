# angrplayr

A music player for the console, in Node.

![screenshot](http://zacanger.com/angrplayr.png)

--------

### Installation

`npm i -g angrplayr`

`angrplayr` uses [MPlayer](http://www.mplayerhq.hu/design7/dload.html) under the
hood, so you'll need that installed as well. This module will fail to install if
you don't have `mplayer` in your path somewhere.

#### Important

* This will probably never work on Windows. Sorry.
* `angrplayr` requires at least Node version 8, because it uses some async
  functions.

### Unfeatures

* No playlists
* No shuffle
* No streaming
* No video
* No GUI
* No remote control

### Usage

`angrplayr` (or `ap` for short).

This will open a file explorer in your terminal. Use arrows to find an audio
file, and hit `enter` to play.

#### Keys:

* `enter` or `space`: immediately play selected file
* `p`: toggle paused/playing
* `.`: volume up
* `,`: volume down
* `;`: seek back
* `'`: seek forward

### Why?

I really love [MOC](https://github.com/jonsafari/mocp), but I use a Mac
sometimes and audio on Macs is a little weird.

I also love MPlayer, but it's a bit unfriendly sometimes.

`angrplayr` is meant to fit somewhere in between more full-featured audio
programs like CMus and MOC and command-line clients like MPlayer and MPV. Most
of the time I don't need playlists, streaming, remote control, or other
features; I just want to play audio.

### Roadmap

* Automatically play the next file in the directory
* File browsing above cwd
* Improve UI:
  * Themes? (At least also support light terminals)
  * Add metadata (id3 or whatever) to bottom pane
  * Clear that interval so we don't get an `Infinity` for the progress bar

### License

[WTFPL](LICENSE.md)
