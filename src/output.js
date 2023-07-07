const fs = require("fs");

function saveToSQL(filename, data, tableName) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Data array must be a non-empty array.");
  }

  const columns = Object.keys(data[0]);
  const statements = [];

  for (let i = 0; i < data.length; i += config.BATCH_SIZE_INSERT_SQL) {
    const batchData = data.slice(i, i + config.BATCH_SIZE_INSERT_SQL);
    const valueSets = batchData.map((obj) => {
      const values = Object.values(obj).map((value) => {
        if (typeof value === "string") {
          return `'${value}'`;
        }
        return value;
      });
      return `(${values.join(", ")})\n`;
    });

    const sql = `INSERT INTO ${tableName} (${columns.join(
      ", "
    )})\n VALUES ${valueSets.join(", ")};`;
    statements.push(sql);
  }

  fs.writeFileSync(filename, statements.join("\n"));
}

function saveToCSV(filename, data) {
  const headers = Object.keys(data[0]);
  const headerRow = headers.join(",") + "\n";
  const dataRows = data
    .map((row) => headers.map((header) => row[header]).join(","))
    .join("\n");
  const csv = headerRow + dataRows;
  fs.writeFileSync(filename, csv);
}

module.exports = { saveToSQL, saveToCSV };
