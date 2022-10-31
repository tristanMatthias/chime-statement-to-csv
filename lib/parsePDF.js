const PDFParser = require('pdf2json');


const pdfParser = new PDFParser(this, 1);

const startsWithDate = /^(\d?\d\/\d{2}\/\d{4})/
const endsWithCurrency = /([\d,]+\.\d{2})$/;

const transactionTypes = [
  'Transfer',
  'Deposit',
  'Purchase',
  'Direct Debit',
  'Round Up Transfer',
  'Fee',
  'Withdrawal'
];

const excludeTransactions = [
  'Deposit',
  'Round Up Transfer'
];

const getTypeRegex = new RegExp(`(${transactionTypes.join('|')})-?\\$[\\d,]+\.\\d{2}`);


/**
 * Parses a line of the PDf into a transaction array
 * @param {String} line Line to parse
 * @returns An array with date, description, type and amount
 */
const parseLine = (line) => {
  const date = startsWithDate.exec(line)[1];
  let type;

  try { type = getTypeRegex.exec(line)[1]; }
  catch {
    throw new Error(`No transaction type match for ${line}`);
  }

  const description = new RegExp(date + '(.*)' + '-?' + type).exec(line)[1];
  const amount = endsWithCurrency.exec(line)[1];
  return { date, description, type, amount };
}


const parsePDF = () => {
  const lines = pdfParser.getRawTextContent().split('\n')
  let l;
  let started = false;
  let results = [];
  let cur = null;
  let continueLine = false;


  for (l of lines) {
    l = l.trim()
    if (typeof l !== 'string') continue;

    // Start
    if (l.startsWith('DATEDESCRIPTIONTYPEAMOUNTNET')) {
      started = true;

      // Continue line
    } else if (continueLine) {
      if (l.match(endsWithCurrency)) {
        cur = parseLine(continueLine + ' ' + l);
        continueLine = false;
      } else {
        continueLine += ' ' + l;
      }


      // New line
    } else if (l.match(startsWithDate) && started) {
      if (cur) results.push(cur);
      // cur = [startsWithDate.exec(l)[1]];

      if (!l.match(endsWithCurrency)) {
        continueLine = l
      } else cur = parseLine(l);

    }
  }

  return results;
}


pdfParser.on("pdfParser_dataError", errData => {
  console.error(errData.parserError)
});


module.exports = (file) => {
  pdfParser.loadPDF(file);

  return new Promise(res => {
    pdfParser.on("pdfParser_dataReady", () => {
      const results = parsePDF()
        .filter(t => !excludeTransactions.includes(t.type))
        .filter(t => {
          if (t.type != 'Transfer') return true;
          return t.description !== ('Transfer to Chime Savings Account');
        })
      res(results);
    });
  })
}
