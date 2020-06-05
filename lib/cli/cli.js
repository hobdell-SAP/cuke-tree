#!/usr/bin/env node
var color = require("ansi-color").set;

var cukeTree = require("../cukeTree.js");		

var cli = cukeTree.internal.cli.arguments.getCli();
var cmdArgs = process.argv;

//This file is tightly coupled to optimist.
//Changed to be tightly coupled to commander
cli.parse(cmdArgs);
{
	cukeTree.internal.cli.arguments.getConfiguration(cli, function(err, config) {
		if (err) {
			console.error(color(err, "red"));
			cli.outputHelp();
			process.exit(9);
		} else {
			cukeTree.createContext(config, function(err, ctContext) {
				var command = ctContext.cliCommands[config.command];
				if (!command) {
					console.error(color("Command not recognised : "+ config.command, "red"));
					console.error("Available commands :- ");
					console.error(Object.keys(ctContext.cliCommands));
					process.exit(3);
				} else {
					command(config);
				}
			});
		}
	});		
}
