#!/bin/bash

echo ""
echo "Ravencoin Server Restarting..."
echo ""

source ~/.bashrc
source /etc/os-release

## who am i? ##
SCRIPTNAME="$(readlink -f ${BASH_SOURCE[0]})"
BASEDIR="$(dirname $SCRIPTNAME)"

## Okay, print it ##
echo "Script name : $SCRIPTNAME"
echo "Current working dir : $PWD"
echo "Script location path (dir) : $BASEDIR"
echo ""

~/.nvm/versions/node/v12.22.2/bin/pm2 restart pool

renice -n -18 -p $(pidof node)
renice -n -18 -p $(pidof nodejs)

echo ""
echo "Ravencoin Server Restarted!"
echo ""

exit 0
