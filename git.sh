#!/bin/sh
git add git.sh
git add src
git add assets
git add index.html
git add README.md
git add tsconfig.json
git add dev
git add lib

# Remove unnecessary files
rm *.map
