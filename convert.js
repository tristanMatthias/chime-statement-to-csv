#!/usr/bin/env node

const path = require('path');
const parsePDF = require('./lib/parsePDF');
const writeFile = require('./lib/writeFile');
const yargs = require('yargs');

const args = yargs
  .command('$0 <input> <output>')
  .argv;


(async () => {
  const { input, output } = await args;
  const data = await parsePDF(path.resolve(input));
  writeFile(data, path.resolve(output));
})();
