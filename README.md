# angrplayr

A music player for the console, in Node.

--------

### Installation

`npm i -g angrplayr`

`angrplayr` uses [mplayer](http://www.mplayerhq.hu/design7/dload.html) under the
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

### Usage

`angrplayr` (or `ap` for short).

This will open a file explorer in your terminal. Use arrows to find an audio
file, and hit `enter` to play.

#### Keys:

* `enter` or `space`: immediately play selected file
* `p`: toggle paused/playing
* `.`: volume up
* `,`: volume down

### Why?

I really love [MOC](https://github.com/jonsafari/mocp). Been using it for years,
and it's great. But I use a Mac at work, and audio on Macs is just plain weird,
and it's problematic.

I also wanted something _simpler_. Most of the time I don't need playlists, I
just want to play all the files in a directory, in order.

### Roadmap

* Keys -- stop, next, prev, vim-like
* File browsing above cwd
* Automatically play the next file in the directory
* Seek
* Improve UI:
  * Themes? (At least also support light terminals)
  * Add bottom pane with metadata (id3?) and playing progress

### License

[WTFPL](LICENSE.md)
