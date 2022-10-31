const fs = require('fs');
const json2csv = require('json2csv');

const fields = ['date', 'description', 'type', 'amount'];
const csvParser = new json2csv.Parser({ fields });

/**
 * Writes a CSV file from a JSON array
 * @param {Array} data Array of transactions
 * @param {String} filename Filename to save to
 */
module.exports = writeFile = (data, filename) => {
  const csv = csvParser.parse(data);
  fs.writeFileSync(filename, csv);
}
