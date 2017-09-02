#!/bin/sh

set -e

if hash mplayer 2>/dev/null ; then
  echo
else
  echo Please install mplayer
  exit 1
fi
