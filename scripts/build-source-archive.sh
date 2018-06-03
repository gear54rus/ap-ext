#!/bin/bash
# Execute from the root of the git repo
# Must be kept up-to-date with .gitignore

OUT="AP-EXT.src.zip"

zip -qr $OUT . \
  -x '.git/*' '.idea/*' 'node_modules/*' 'dist/**/*.js' 'dist/**/*.css' \
  'AP-EXT.*'

stat $OUT
