const express = require("express");
const http = require("http");

exports.start = function(options, callback) {
	const app = express();
	const server = http.createServer(app);

	require("./socketServer.js")({app : server, config : options}, function(err, socketServer) {
		if (err) {callback(err);} else {
			require("./webServer.js")({app : app, config : options, socketServer : socketServer}, function(err, webServer) {
				if (err) {callback(err);} else {
					console.log("Test server listening on port : "+ options.port);
					app.listen(options.port, callback);
				}
			});
		}
	});	
};
