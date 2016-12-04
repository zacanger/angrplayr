# angrplayr

A music player for the console, in Node.

--------

### Installation:

`npm i -g angrplayr`

### Usage:

`angrplayr file.mp3`, or `ap file.mp3`

### Current limitations:

* Only works with one file at a time.
  * If you send it more than one, it'll play them simultaenously.
* Only works with MP3s. If you give it a WAV or whatever, it'll blow up.
* Requires asound (`libasound2-dev` on Debian-based distros).
* Who knows what it does on Windows? Not me.

### Roadmap:

* Initial goal is to achieve some of the basic functionality of mplayer.
  * Keypresses -- play, pause, stop, next, prev, volume up and down
  * Send a list of file from process.argv, queue all
* Eventual goals are a Blessed-based interface somewhat similar to cmus or MOC.
* Areas to explore:
  * Being a blessed interface over mplayer
  * Audio libraries that don't require specific headers/don't combile native addons on installation
  * Why Hyper (the terminal) doesn't do so well with blessed
  * Which types of keybinds would be least surprising for users (vi vs arrows, etc.)
  * File manangement/exploration vs text playlists and a single queue

### Contributors:

* [A-Reum Jung](https://github.com/princessareum)
* [Zac Anger](https://github.com/zacanger)

### License:
[WTFPL](LICENSE.md)
