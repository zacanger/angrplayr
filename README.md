# angrplayr

A music player for the console, in Node.

--------

### Installation:

`npm i -g angrplayr`

`angrplayr` uses [mplayer](http://www.mplayerhq.hu/design7/dload.html) under the
hood, so you'll need that installed as well. This module will fail to install if
you don't have `mplayer` in your path somewhere.

**Important**: This will probably never work on Windows. Sorry.

### Usage:

`angrplayr` (or `ap` for short).

This will open a file explorer in your terminal. Use arrows to find an audio
file, and hit `enter` to play.

#### Keys:

* `enter` or `space`: immediately play selected file
* `p`: toggle paused/playing
* `u`: volume up
* `y`: volume down

### Roadmap:

* Seek
* Metadata (ID3)
* Unicode support
* Improve UI, especially the right pane
* Saving to/loading from m3u files
* Themes? (At least also support light terminals)
* Keys -- stop, next, prev, add, remove, save, vim-like, change order in playlist

### License:

[WTFPL](LICENSE.md)
