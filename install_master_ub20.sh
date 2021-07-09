#!/bin/sh

# This is the Pool install script.
echo "Cyberpool Ravencoin Pool install script."
echo "Please do NOT run as root, run as the pool user!"

echo "Installing... Please wait!"

sleep 5

sudo rm -rf /usr/lib/node_modules
sudo rm -rf node_modules
sudo apt remove --purge -y nodejs node
sudo rm /etc/apt/sources.list.d/*
sudo apt update
sudo apt upgrade -y

sudo apt install -y apt-transport-https software-properties-common build-essential autoconf pkg-config make gcc g++ screen wget curl ntp fail2ban 

sudo add-apt-repository -y ppa:chris-lea/redis-server

sudo apt update
sudo apt install -y libdb-dev libdb++-dev libssl-dev libboost-all-dev libminiupnpc-dev libtool autotools-dev
sudo apt install -y sudo git npm nodejs nginx python3-certbot-nginx redis-server

sleep 3

sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sleep 2
sudo systemctl enable redis-server
sudo systemctl start redis-server
sleep 2
sudo systemctl enable ntp
sudo systemctl start ntp

sudo rm -rf ~/.nvm
sudo rm -rf ~/.npm
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
source ~/.bashrc
sudo chown -R $USER:$GROUP ~/.nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
nvm install v8.17.0
nvm use v8.17.0

git clone https://github.com/cyberpoolorg/cyberpool-ravencoin-server
chmod -R +x cyberpool-ravencoin-server/
cd cyberpool-ravencoin-server

npm update -g

npm install -g pm2@4.5.6
npm install -g npm@latest-6

npm install
npm update
npm audit fix
npm install sha3
npm install logger
npm install bignum

echo "Installation completed!"

exit 0
