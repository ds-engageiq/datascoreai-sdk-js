const https = require('https');
var aws4 = require('aws4');
var self = (module.exports = function(options) {
	this.options = options;
	if (typeof process.env.DATASCOREAI_ACCESS_KEY !== 'undefined') this.options.access_key = process.env.DATASCOREAI_ACCESS_KEY;
	if (typeof process.env.DATASCOREAI_SECRET_KEY !== 'undefined') this.options.secret_key = process.env.DATASCOREAI_SECRET_KEY;
	if (typeof this.options.region === 'undefined') this.options.region = 'us-west-2';
	this.options.host = 'api.datascore.ai';
	// this.options.host = 'api.' + this.options.region + '.datascore.ai';
	this.sign = function(endpoint, payload) {
		return aws4.sign(
			{
				host: this.options.host,
				path: endpoint,
				service: 'datascore.ai',
				region: this.options.region,
				headers: { 'Content-Type': 'application/x-amz-json-1.0' },
				body: JSON.stringify(payload),
			},
			{ accessKeyId: this.options.access_key, secretAccessKey: this.options.secret_key },
		);
	};
	this.request = function(endpoint, payload, cb) {
		let opts = this.sign(endpoint, payload);
		https.request(opts, cb).end(opts.body || '');
	};
	this.requestPromise = function(endpoint, payload) {
		return new Promise((resolve, reject) => {
			try {
				let opts = this.sign(endpoint, payload);
				https
					.request(opts, (res) => {
						var data = [];
						res.on('data', (chunk) => {
							data.push(chunk);
						}).on('end', () => {
							const response = JSON.parse(Buffer.concat(data));
							resolve({ status: res.statusCode, response: response });
						});
					})
					.end(opts.body || '');
			} catch (e) {
				reject(e);
			}
		});
	};
	return this;
});
