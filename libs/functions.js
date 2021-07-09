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

const anonymize = require('ip-anonymize');
const loggerFactory = require('./logger.js');
const logger = loggerFactory.getLogger('PoolWorker', 'system');
module.exports = {
	anonymizeIP: function (ipaddr) {
		var retval = ipaddr;
		var portalConfig = JSON.parse(process.env.portalConfig);
		if (portalConfig.logips && portalConfig.anonymizeips) {
			retval = anonymize(ipaddr, portalConfig.ipv4bits, portalConfig.ipv6bits);
			logger.silly("ANONIP>TRUE> before [%s] after [%s]", ipaddr, retval);
		} else if (!(portalConfig.logips)) {
			retval = "AnOnYmOuS!";
			logger.debug("ANONIP>FULL> ipaddr [%s]", retval);
		} else {
			logger.debug("ANONIP>FALSE> ipaddr [%s]", retval);            
		}
		return retval;    
	},
	secToDHMSStr: function (seconds) {
		retval = "";
		var intDays = Math.floor(seconds / 86400) || 0;
		var intHrs = Math.floor((seconds % 86400) / 3600) || 0;
		var intMin = Math.floor(((seconds % 86400) % 3600) / 60) || 0;
		var intSec = Math.floor(((seconds % 86400) % 3600) % 60) || 0;
		if (intDays > 0) { retval = retval + intDays.toString() + "d "; }
		if (intDays > 0 || intHrs > 0) { retval = retval + intHrs.toString() + "h "; }
		retval = retval + intMin.toString() + "m ";
		retval = retval + intSec.toString() + "s";
		return retval
	}
};