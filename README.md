# angrplayr

A music player for the console, in Node.

--------

### Installation:

`npm i -g angrplayr`

`angrplayr` uses [mplayer](http://www.mplayerhq.hu/design7/dload.html) under the
hood, so you'll need that installed as well.

### Usage:

`angrplayr` (or `ap` for short).

This will open a file explorer in your terminal. Use arrows to find an audio
file, and hit `enter` to play.

#### Keys:

* `enter`: immediately play selected file
* `p`: toggle paused/playing

**Important** This probably can't work on Windows. Sorry.

### Roadmap:

* Keypresses -- stop, next, prev, add, remove, save volume up and down, vim-like
* ID3
* Unicode support
* Improve UI, especially the right pane
* Saving (m3u files)
* Themes? (At least also support light terminals)
* Seek

### License:

[WTFPL](LICENSE.md)
