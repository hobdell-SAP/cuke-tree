var CukeTree = require("../lib/cukeTree.js");

module.exports = {
  "command": "ide",
  "input": "../tmp/report.js",
  "output": "../tmp/report/",
  "features": "./features/",
  "variant": "cucumber-js",
  "bin": "node ../node_modules/cucumber/bin/cucumber-js -f progress --max-retries=2 --parallel 8",
  "launch": true,
  "ext": [
    CukeTree.extensions.test_suite
  ]
};
