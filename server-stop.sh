#!/bin/bash

echo ""
echo "Ravencoin Server Stoping..."
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

~/.nvm/versions/node/v12.22.6/bin/pm2 stop pool

echo ""
echo "Ravencoin Server Stopped!"
echo ""

exit 0
