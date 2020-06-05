const path = require("path"), fs = require("fs");
const extensionLoader = require("../extensions/extensionLoader.js");
const defaultConfigFile = "default";
const argparser = require("commander");

module.exports = {
	getCli : getCli,
	getConfiguration : getConfiguration
};

function getCli() {
	const usage = "\nGenerates a CukeTree report.\n\nUsage: $0 <command> -i <filename> -o <directory> -f <directory>\n";

	return argparser
		.helpOption("-h, --help",  "Optional. Shows usage information")
		.option("-c, --config <cuketree-config-file>", "Optional. Name of the configuration profile for running cuketree")
		.requiredOption("-i, --input <path>", "Required. Name of cucumber test data (as JSON) used to generate report")
		.requiredOption("-o,--output <path>", "Required. Output directory to generate report")
		.requiredOption("-f, --features <path>", "Required. Features directory the report was generated from")
		.option("-l, --launch", "Optional. Launch/open the report/ide with the default handler")
		.option("-b, --bin <path>", "Optional. Bin location of cucumber-js")
		.option("-r, --run <path>", "Optional. Location of test directory to execute")
		.option("-e, --ext", "Optional. Comma separated list of locations of CukeTree extensions")
	;
}

function getConfiguration(cmdArgs, callback) {	
	var configFile = cmdArgs.config;
	if (!configFile) { configFile = defaultConfigFile; }
	configFile = path.resolve(process.cwd(), configFile);
	if (path.extname(configFile) === "") { configFile += ".cukeTree.js"; }
	if (!fs.existsSync(configFile)) { callback("CukeTree config file does not exist: "+ configFile); }
	
	var config = resolveConfig(cmdArgs, configFile);
	extensionLoader.init(config.ext ? config.ext : [], function(err, extensions) {
		if (err) {callback(err);} else {
			config.extensions = extensions;
			callback(null, config);
		}
	});	
}

/* Private Methods */
function resolveConfig(cmdArgs, configFile) {
	var config = {};
	if (configFile) {
		var configPath = path.dirname(configFile);
		config = require(configFile);
		Object.keys(config).forEach(function(key) {
			if (["input", "output", "features", "run"].indexOf(key) > -1) {
				config[key] = path.resolve(configPath, config[key]);
			}
		});
	}
	
	var finalConfig = {
		command : cmdArgs.run ? cmdArgs.run : config.command,
		input : cmdArgs.input ? path.resolve(process.cwd(), cmdArgs.input) : config.input,
		output : cmdArgs.output ? path.resolve(process.cwd(), cmdArgs.output) : config.output,
		features : cmdArgs.features ? path.resolve(process.cwd(), cmdArgs.features) : config.features,
		variant : cmdArgs.variant ? cmdArgs.variant : config.variant,
		bin : cmdArgs.bin ? cmdArgs.bin : config.bin,
		launch : cmdArgs.launch ? cmdArgs.launch : config.launch,
		run : cmdArgs.run !== undefined 
			? cmdArgs.run !== true ? cmdArgs.run : null
			: config.run,
		ext : [
			{ module : require("../extensions/report_core/extension.js") }
		]
	};
	
	if (cmdArgs.ext) {
		cmdArgs.ext.split(",").forEach(function(ext) {
			var extPath = ext;
			if (extPath.replace("\\","/").indexOf("/") > -1) { extPath = path.resolve(process.cwd(), ext); }
			finalConfig.ext.push({
				path : extPath
			});
		});
	} else if (config.ext) {
		config.ext.forEach(function(ext) {
			if (typeof(ext) === "string") {
				var extPath = ext;
				if (extPath.slice(0,1) === ".") { extPath = path.resolve(configPath, extPath); }
				finalConfig.ext.push({
					path : extPath
				});
			} else if (ext instanceof Function) {
				finalConfig.ext.push({
					module : ext
				});
			} else {
				var extPath = ext.path;
				if (extPath && extPath.slice(0,1) === ".") { extPath = path.resolve(configPath, extPath); }
				finalConfig.ext.push({
					options : ext.options,
					path : extPath ? extPath : null,
					module : ext.module ? ext.module : null
				});
			}
		});
	}
	
	return finalConfig;
}
