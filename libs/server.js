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

const fs = require('fs');
const http = require('http');
const https = require('https');
const loggerFactory = require('./logger.js');
const logger = loggerFactory.getLogger('Server', 'system');

var path = require('path');
var async = require('async');
var redis = require('redis');
var watch = require('node-watch');
var dot = require('dot');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var compress = require('compression');
var Stratum = require('stratum-pool');
var util = require('stratum-pool/lib/util.js');
var api = require('./api.js');

module.exports = function () {
    	var portalConfig = JSON.parse(process.env.portalConfig);
	var poolConfigs = JSON.parse(process.env.pools);
	var websiteConfig = portalConfig.website;
	var portalApi = new api(portalConfig, poolConfigs);
	var portalStats = portalApi.stats;
	var logSystem = 'Server';
    
	portalStats.getGlobalStats(function () {
	});
	var buildUpdatedWebsite = function () {
		portalStats.getGlobalStats(function () {
			var statData = 'data: ' + JSON.stringify(portalStats.stats) + '\n\n';
			for (var uid in portalApi.liveStatConnections) {
				var res = portalApi.liveStatConnections[uid];
				res.write(statData);
			}
		});
	};
	setInterval(buildUpdatedWebsite, websiteConfig.stats.updateInterval * 1000);

	var app = express();
	app.use(cors());
	app.get('/api/:method', function (req, res, next) {
		portalApi.handleApiRequest(req, res, next);
	});
	app.use(compress());
	app.use(function(err, req, res, next) {
		console.error(err.stack);
		res.send(500, 'Something broke!');
	});

	try {
		logger.info('SERVER> Attempting to start Server on %s:%s', portalConfig.website.host,portalConfig.website.port);
		http.createServer(app).listen(portalConfig.website.port, portalConfig.website.host, function () {
			logger.info('SERVER> Server started on %s:%s', portalConfig.website.host,portalConfig.website.port);
		});
	} catch (e) {
		logger.error('SERVER> e = %s', JSON.stringify(e));
		logger.error('SERVER> Could not start server on %s:%s - its either in use or you do not have permission', portalConfig.website.host,portalConfig.website.port);
	}
};
