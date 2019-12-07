function processRow(row: any[]) {
  let finalVal = "";
  for (var j = 0; j < row.length; j++) {
    let innerValue = row[j] === null ? "" : row[j].toString();
    if (row[j] instanceof Date) {
      innerValue = row[j].toLocaleString();
    }
    let result = innerValue.replace(/"/g, '""');
    if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
    if (j > 0) finalVal += ",";
    finalVal += result;
  }
  return finalVal + "\n";
}

export function toCsv(rows: any[][]) {
  let csvFile = "";
  rows.forEach(row => (csvFile += processRow(row)));
  return new Blob([csvFile], { type: "text/csv; charset=utf-8;" });
}
