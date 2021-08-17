/*
Copyright 2021 Cyber Pool (cyberpool.org)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var redis = require('redis');
var async = require('async');
var filterIterate = require('./filterIterate.js');
var stats = require('./stats.js');
const functions = require('./functions.js');
const loggerFactory = require('./logger.js');
const logger = loggerFactory.getLogger('Api', 'system');
module.exports = function(portalConfig, poolConfigs) {
	var _this = this;
	var portalStats = this.stats = new stats(portalConfig, poolConfigs);
	this.liveStatConnections = {};
	this.handleApiRequest = function(req, res, next) {
		switch (req.params.method) {
			case 'pool_stats':
			res.header('Content-Type', 'application/json');
			res.end(portalStats.statsString);
			return;
			case 'pool_payments':
			res.header('Content-Type', 'application/json');
			var poolPayments = [];
			for(var pool in portalStats.stats.pools) {
				poolPayments.push({
					txlink: portalStats.stats.pools[pool].explorerGetTx,
					symbol: portalStats.stats.pools[pool].symbol,
					payments: portalStats.stats.pools[pool].payments
				});
			}
			res.end(JSON.stringify(poolPayments));
			return;
			case 'pool_dashboard':
			res.header('Content-Type', 'application/json');
			var poolDashboard = [];
			for(var pool in portalStats.stats.pools) {
				poolDashboard.push({
					stats: portalStats.stats.pools[pool].poolStats,
					poolfee: portalStats.stats.pools[pool].poolFee,
					poolhash: portalStats.stats.pools[pool].hashrate,
					effort: portalStats.stats.pools[pool].shareCount,
					ttf: portalStats.stats.pools[pool].timeToFind,
					miners: portalStats.stats.pools[pool].minerCount,
					workers: portalStats.stats.pools[pool].workerCount,
					lastblock: portalStats.stats.pools[pool].lastBlockDate
				});
			}
			res.end(JSON.stringify(poolDashboard));
			return;
			case 'pool_ports':
			res.header('Content-Type', 'application/json');
			var poolPorts = [];
			for(var pool in portalStats.stats.pools) {
				poolPorts.push({
					ports: portalStats.stats.pools[pool].poolStats.ports
				});
			}
			res.end(JSON.stringify(poolPorts));
			return;
			case 'pool_miners':
			res.header('Content-Type', 'application/json');
			var poolMiners = [];
			for(var pool in portalStats.stats.pools) {
				poolMiners.push({miners: portalStats.stats.pools[pool].miners});
			}
			res.end(JSON.stringify(poolMiners));
			return;
			case 'pool_blocksall':
			res.header('Content-Type', 'application/json');
			var listBlocks = [];
			for(var pool in portalStats.stats.pools) {
				listBlocks.push({
					symbol: portalStats.stats.pools[pool].symbol,
					blocks: portalStats.stats.pools[pool].blockexp
				});
			}
			res.end(JSON.stringify(listBlocks));
			return;
			case 'pool_blocks15':
			res.header('Content-Type', 'application/json');
			var listBlocks15 = [];
			for(var pool in portalStats.stats.pools) {
				listBlocks15.push({blocks: portalStats.stats.pools[pool].blockexp15});
			}
			res.end(JSON.stringify(listBlocks15));
			return;
			case 'pool_blocks50':
			res.header('Content-Type', 'application/json');
			var listBlocks50 = [];
			for(var pool in portalStats.stats.pools) {
				listBlocks50.push({
					blocklink: portalStats.stats.pools[pool].explorerGetBlock,
					addresslink: portalStats.stats.pools[pool].explorerGetAddress,
					symbol: portalStats.stats.pools[pool].symbol,
					curblock: portalStats.stats.pools[pool].poolStats.networkBlocks,
					blocks: portalStats.stats.pools[pool].blockexp50
				});
			}
			res.end(JSON.stringify(listBlocks50));
			return;
			case 'worker_stats':
			res.header('Content-Type', 'application/json');
			if (req.url.indexOf("?") > 0) {
				var url_parms = req.url.split("?");
				if (url_parms.length > 0) {
					var historyworkers = {};
					var historyminer = {};
					var workers = {};
					var miner = {};
					var address = url_parms[1] || null;
					if (address != null && address.length > 0) {
						address = address.split(".")[0];
						portalStats.getBalanceByAddress(address, function(balances) {
							portalStats.getTotalSharesByAddress(address, function(shares) {
								var totalHash = parseFloat(0.0);
								var totalHeld = parseFloat(0.0);
								var totalShares = shares;
								for (var h in portalStats.statHistory) {
									for (var pool in portalStats.statHistory[h].pools) {
										for (var w in portalStats.statHistory[h].pools[pool].workers) {
											if (w.startsWith(address)) {
												if (historyworkers[w] == null) {
													historyworkers[w] = [];
												}
												if (portalStats.statHistory[h].pools[pool].workers[w].hashrate) {
													historyworkers[w].push({
														time: portalStats.statHistory[h].time,
														hashrate: portalStats.statHistory[h].pools[pool].workers[w].hashrate
													});
												}
											}
										}
										for (var m in portalStats.statHistory[h].pools[pool].miners) {
											if (m.startsWith(address)) {
												if (historyminer[m] == null) {
													historyminer[m] = [];
												}
												if (portalStats.statHistory[h].pools[pool].miners[m].hashrate) {
													historyminer[m].push({
														time: portalStats.statHistory[h].time,
														hashrate: portalStats.statHistory[h].pools[pool].miners[m].hashrate
													});
												}
											}
										}
									}
								}
								for (var pool in portalStats.stats.pools) {
									for (var w in portalStats.stats.pools[pool].workers) {
										if (w.startsWith(address)) {
											workers[w] = portalStats.stats.pools[pool].workers[w];
											for (var b in balances.balances) {
												if (w == balances.balances[b].worker) {
													workers[w].paid = balances.balances[b].paid;
													workers[w].balance = balances.balances[b].balance;
													workers[w].immature = balances.balances[b].immature;
												}
											}
											workers[w].balance = (workers[w].balance || 0);
											workers[w].immature = (workers[w].immature || 0);
											workers[w].paid = (workers[w].paid || 0);
											totalHash += portalStats.stats.pools[pool].workers[w].hashrate;
										}
									}
								}
								for (var pool in portalStats.stats.pools) {
									for (var m in portalStats.stats.pools[pool].miners) {
										if (m.startsWith(address)) {
											miner[m] = portalStats.stats.pools[pool].miners[m];
										}
									}
								}
								for (var pool in portalStats.stats.pools) {
									var coinTicker = portalStats.stats.pools[pool].symbol;
									var blockReward = portalStats.stats.pools[pool].poolStats.networkReward;
									var totalPoolHash = portalStats.stats.pools[pool].hashrate;
									var totalPoolShares = portalStats.stats.pools[pool].shareCount;
									var networkHash = portalStats.stats.pools[pool].poolStats.networkHash;
									var networkDiff = portalStats.stats.pools[pool].poolStats.networkDiff;
								}
								res.end(JSON.stringify({
									coinTicker: coinTicker,
									lastBlockReward: blockReward,
									mineraddress: address,
									totalHash: totalHash,
									totalShares: totalShares,
									totalPoolShares: totalPoolShares,
									totalPoolHash: totalPoolHash,
									networkHash: networkHash,
									networkDiff: networkDiff,
									immature: (balances.totalImmature * 100000000),
									balance: balances.totalHeld,
									paid: balances.totalPaid,
									miner: miner,
									workers: workers,
									historyminer: historyminer,
									historyworkers: historyworkers

								}));
							});
						});
					} else {
						res.end(JSON.stringify({
							result: "error"
						}));
					}
				} else {
					res.end(JSON.stringify({
						result: "error"
					}));
				}
			} else {
				res.end(JSON.stringify({
					result: "error"
				}));
			}
			return;
			case 'pool_fees':
			var o = { pools : [] };
			for (var pool in poolConfigs) {
				var ttotal = 0.0;
				var rewardRecipients = portalStats.stats.pools[pool].rewardRecipients || {};
				for (var r in rewardRecipients) {
					ttotal += rewardRecipients[r];
				}
				var intSec = poolConfigs[pool].paymentProcessing.paymentInterval || 0;
				var intMinPymt = poolConfigs[pool].paymentProcessing.minimumPayment || 0;                 
				var strSchema = poolConfigs[pool].paymentProcessing.schema || "PROP";  
				tmpStr = functions.secToDHMSStr(intSec);            
				o.pools.push({
					"coin": pool,
					"fee": ttotal,
					"payoutscheme": strSchema,
					"interval": intSec,
					"intervalstr": tmpStr,
					"minimum": intMinPymt
				});
			}
			res.header('Content-Type', 'application/json');
			res.end(JSON.stringify(o));
			return;
			case 'pool_statshistory':
			res.header('Content-Type', 'application/json');
			res.end(JSON.stringify(portalStats.statPoolHistory));
			return;
			case 'live_stats':
			res.writeHead(200, {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive'
			});
			res.write('\n');
			var uid = Math.random().toString();
			_this.liveStatConnections[uid] = res;
			req.on("close", function() {
				delete _this.liveStatConnections[uid];
			});
			return;
			default: next();
		}
	};
	Object.filter = (obj, predicate) =>
	Object.keys(obj)
	.filter( key => predicate(obj[key]) )
	.reduce( (res, key) => (res[key] = obj[key], res), {} );
	this.handleAdminApiRequest = function(req, res, next) {
		switch (req.params.method) {
			case 'pools': {
				res.end(JSON.stringify({
					result: poolConfigs
				}));
				return;
			}
			default: next();
		}
	};
};
