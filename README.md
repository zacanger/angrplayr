# angrplayr

--------

### Installation:

`npm i -g angrplayr`

### Usage:

`angrplayr file.mp3`, also the `ap` shortcut.

Currently only works on one file at a time.

Requires libasound2-dev on Debian-based distros.

Totally untested on Windows.

### What:

A console music player for Node, eventually.

### Roadmap:

* Initial goal is to achieve some of the basic functionality of mplayer.
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
