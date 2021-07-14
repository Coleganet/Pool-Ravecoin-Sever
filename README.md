Cyber Pool Ravencoin Server - v1.0.1 Special Edition
================

[![License](https://img.shields.io/badge/license-GPL--3.0-blue)](https://opensource.org/licenses/GPL-3.0)

Highly Efficient Stratum Server for Ravencoin!

-------
### Cyber Pool Ravencoin consists of 2 main modules:
| Project | Link |
| ------------- | ------------- |
| [Cyberpool Ravencoin Server](https://github.com/cyberpoolorg/cyberpool-ravencoin-server) | https://github.com/cyberpoolorg/cyberpool-ravencoin-server |
| [Cyberpool Ravencoin Stratum](https://github.com/cyberpoolorg/cyberpool-ravencoin-stratum) | https://github.com/cyberpoolorg/cyberpool-ravencoin-stratum |

-------
### Requirements
***NOTE:*** _These requirements will be installed in the install section!_<br />
* Ubuntu Server 20.04.* LTS
* Coin daemon
* Node Version Manager
* Node 12.22.2
* Process Manager 2 / pm2
* Redis Server
* ntp

-------

### Install RavenCoin Daemon

    adduser pool
    usermod -aG sudo pool
    su - pool
    sudo apt install wget
    wget https://github.com/RavenProject/Ravencoin/releases/download/v4.3.2.1/raven-4.3.2.1-x86_64-linux-gnu.zip
    unzip raven-4.3.2.1-x86_64-linux-gnu.zip
    rm raven*zip
    cd linux
    tar -xvf raven-4.3.2.1-x86_64-linux-gnu.tar.gz
    rm raven*gz
    cd raven-4.3.2.1/bin
    mkdir -p ~/.raven/
    touch ~/.raven/raven.conf
    echo "rpcuser=user1" > ~/.raven/raven.conf
    echo "rpcpassword=pass1" >> ~/.raven/raven.conf
    echo "prune=550" >> ~/.raven/raven.conf
    echo "daemon=1" >> ~/.raven/raven.conf
    ./ravend
    ./raven-cli getnewaddress

Example output: RNs3ne88DoNEnXFTqUrj6zrYejeQpcj4jk - it is the address of your pool, you need to remember it and specify it in the configuration file pool_configs/ravencoin.json.
    
    ./raven-cli getaddressesbyaccount ""
    
Information about pool wallet address.
    
    ./raven-cli getwalletinfo
    
Get more information.

    ./raven-cli getblockcount
    
Information about synchronization of blocks in the main chain.

    ./raven-cli help
Other helpfull commands.

-------

### Install Server

    sudo apt install git -y
    cd ~
    git config --global http.https://gopkg.in.followRedirects true
    git clone https://github.com/cyberpoolorg/cyberpool-ravencoin-server.git
    cd cyberpool-ravencoin-server/
    ./install_master_ub20.sh
    
    or
    
    curl -L https://raw.githubusercontent.com/cyberpoolorg/cyberpool-ravencoin-server/master/install_master_ub20.sh | bash

-------
### Configure Server

Change "stratumHost": "raven.cyberpool.org", to your IP or DNS in file config.json:

    cd ~/cyberpool-ravencoin-server
    nano config.json

```javascript
{
    "devmode": false,
    "devmodePayMinimim": 0.25,
    "devmodePayInterval": 120,
    "logips": true,       
    "anonymizeips": true,
    "ipv4bits": 16,
    "ipv6bits": 16,
    "defaultCoin": "ravencoin",
    "logger" : {
        "level" : "debug",
        "file" : "/home/pool/cyberpool-ravencoin-server/logs/ravencoin_debug.log"
    },
    "cliHost": "127.0.0.1",
    "cliPort": 17117,
    "clustering": {
        "enabled": true,
        "forks": "auto"
    },
    "defaultPoolConfigs": {
        "blockRefreshInterval": 333,
        "jobRebroadcastTimeout": 25,
        "connectionTimeout": 600,
        "emitInvalidBlockHashes": false,
        "validateWorkerUsername": true,
        "tcpProxyProtocol": false,
        "banning": {
            "enabled": true,
            "time": 600,
            "invalidPercent": 50,
            "checkThreshold": 500,
            "purgeInterval": 300
        },
        "redis": {
            "host": "127.0.0.1",
            "port": 6379
        }
    },
    "website": {
        "enabled": true,
        "sslenabled": false,
        "sslforced": false,
        "host": "0.0.0.0",
        "port": 3001,
        "sslport": 443,
        "sslkey": "/home/pool/cyberpool-ravencoin-server/certs/privkey.pem",
        "sslcert": "/home/pool/cyberpool-ravencoin-server/certs/fullchain.pem",
        "stratumHost": "raven.cyberpool.org",
        "stats": {
            "updateInterval": 60,
            "historicalRetention": 86400,
            "hashrateWindow": 600
        }
    },
    "redis": {
        "host": "127.0.0.1",
        "port": 6379
    }
}

```

Change "address": "RNs3ne88DoNEnXFTqUrj6zrYejeQpcj4jk", to your pool created wallet address in file ravencoin.json:

    cd ~/cyberpool-ravencoin-server/pools
    nano ravencoin.json

```javascript
{
    "enabled": true,
    "coin": "ravencoin.json",
    "address": "RNs3ne88DoNEnXFTqUrj6zrYejeQpcj4jk",
    "donateaddress": "RNs3ne88DoNEnXFTqUrj6zrYejeQpcj4jk",
    "rewardRecipients": {
        "RNs3ne88DoNEnXFTqUrj6zrYejeQpcj4jk": 0.5
    },
    "paymentProcessing": {
        "enabled": true,
        "schema": "PROP",
        "paymentInterval": 300,
        "minimumPayment": 1,
        "maxBlocksPerPayment": 1,
        "minConf": 30,
        "coinPrecision": 8,
        "daemon": {
            "host": "127.0.0.1",
            "port": 8766,
            "user": "user1",
            "password": "pass1"
        }
    },
    "ports": {
	"10008": {
            "diff": 0.05,
    	    "varDiff": {
    	        "minDiff": 0.025,
    	        "maxDiff": 1024,
    	        "targetTime": 10,
    	        "retargetTime": 60,
    	        "variancePercent": 30,
    		"maxJump": 25
    	    }
        },
        "10016": {
	    "diff": 0.10,
            "varDiff": {
                "minDiff": 0.05,
                "maxDiff": 1024,
    	        "targetTime": 10,
    	        "retargetTime": 60,
    	        "variancePercent": 30,
		"maxJump": 25
            }
        },
        "10032": {
	    "diff": 0.20,
            "varDiff": {
    		"minDiff": 0.10,
    		"maxDiff": 1024,
    	        "targetTime": 10,
    	        "retargetTime": 60,
    	        "variancePercent": 30,
    		"maxJump": 50
    	    }
        },
	"10256": {
	    "diff": 1024000000,
            "varDiff": {
                "minDiff": 1024000000,
                "maxDiff": 20480000000,
    	        "targetTime": 10,
    	        "retargetTime": 60,
    	        "variancePercent": 30,
		"maxJump": 25
            }
        }
    },
    "daemons": [
        {
            "host": "127.0.0.1",
            "port": 8766,
            "user": "user1",
            "password": "pass1"
        }
    ],
    "p2p": {
        "enabled": false,
        "host": "127.0.0.1",
        "port": 8767,
        "disableTransactions": true
    }
}

```

### Run Server
    
    cd ~/cyberpool-ravencoin-server
    bash server-start.sh

### Donates for developers of Cyberpool Ravencoin Server

* BTC - `1H8Ze41raYGXYAiLAEiN12vmGH34A7cuua`
* LTC - `LSE19SHK3DMxFVyk35rhTFaw7vr1f8zLkT`
* ZEC - `t1NTX2qJAhQrEdTRNaqVckznNMaqUSwPLvp`
* ETH - `0xb3a152943969C41D338d972af0677c40E42Ac850`
* ETC - `0x6F2B787312Df5B08a6b7073Bdb8fF04442B6A11f`
    
-------

## License
```
Licensed under the GPL-3.0
Copyright (c) 2021 Cyber Pool (cyberpool.org)
```
