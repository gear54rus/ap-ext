#!/bin/bash
# Builds a release of AP-EXT

NAME="AP-EXT"
FILES="dist manifest.json"

echo
echo Packaging for Chrome

rm -fv manifest.json
ln -vs manifest/chrome.json manifest.json
zip -qr ${NAME}.zip $FILES

echo Done

echo
echo Packaging for Firefox

rm -fv manifest.json
ln -vs manifest/firefox.json manifest.json
zip -qr ${NAME}.xpi $FILES

echo Done

ls -hl ${NAME}.*
