# Chime 2 CSV

This is a small CLI that converts a Chime Bank monthly pdf statement into a CSV to be used in spreadsheets.

## Usage
```bash
pnpm install # Install dependencies
node convert.js STATEMENT.pdf GENERATED.csv
```

The CLI takes 2 positional arguments:
1. Path to the PDF to read
2. Path to the CSV file to generate
