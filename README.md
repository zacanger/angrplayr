# angrplayr

A music player for the console, in Node.

--------

### Installation:

`npm i -g angrplayr`

### Usage:

`angrplayr file.mp3`, or `ap file.mp3`

`ap 1.mp3 2.mp3 3.mp3`

### Current limitations:

* Only works with MP3s. If you give it a WAV or whatever, it'll blow up.
* Requires asound (`libasound2-dev` on Debian-based distros).
* Who knows what it does on Windows? Not me.

### Roadmap:

* Remove streamplayer stuff, and work as a frontend to mplayer instead
* Keypresses -- play, pause, stop, next, prev, add, remove, save volume up and down, vim-like
* ID3
* Other filetypes (this will come along with using mplayer)
* Blessed-based interface similar to MOC
* Saving (m3u files)

### License:

[WTFPL](LICENSE.md)
