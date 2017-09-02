# angrplayr

A music player for the console, in Node.

--------

### Installation:

`npm i -g angrplayr`

`angrplayr` uses [mplayer](http://www.mplayerhq.hu/design7/dload.html) under the
hood, so you'll need that installed as well. This module will fail to install if
you don't have `mplayer` in your path somewhere.

### Usage:

`angrplayr` (or `ap` for short).

This will open a file explorer in your terminal. Use arrows to find an audio
file, and hit `enter` to play.

#### Keys:

* `enter` or `space`: immediately play selected file
* `p`: toggle paused/playing
* `u`: volume up
* `y`: volume down

**Important** This probably can't work on Windows. Sorry.

### Roadmap:

* Keypresses -- stop, next, prev, add, remove, save, vim-like
* ID3
* Unicode support
* Improve UI, especially the right pane
* Saving (m3u files)
* Themes? (At least also support light terminals)
* Seek

### License:

[WTFPL](LICENSE.md)
