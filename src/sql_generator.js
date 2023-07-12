const fs = require("fs");
const { config } = require("./config");

function generateSqlInsert(data, schema) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Data array must be a non-empty array.");
  }

  const columnsDisplayNames = Object.keys(data[0]),
    columnsMap = extractColumnsAsMap(schema.columns),
    statements = [],
    tableName = schema.table_name;

  for (let i = 0; i < data.length; i += config.BATCH_SIZE_INSERT_SQL) {
    const batchData = data.slice(i, i + config.BATCH_SIZE_INSERT_SQL);
    const valueSets = batchData.map((obj) => {
      const values = Object.entries(obj)
        .filter(([key]) => !key.startsWith("_"))
        .map(([key, value]) => {
          if (typeof value === "string") {
            value = value.replace("'", "''");
            return `'${value}'`;
          }
          return value;
        });
      return `(${values.join(", ")})\n`;
    });

    const columns = columnsFromMap(columnsMap, columnsDisplayNames);
    const sql = `INSERT INTO ${tableName} (${columns.join(
      ", "
    )})\n VALUES ${valueSets.join(", ")};`;
    statements.push(sql);
  }

  return statements.join("\n");
}

function generateDropTableSql(table) {
  return `DROP TABLE IF EXISTS ${table.table_name};\n`;
}

function generateTableSql(table) {
  let sql = `CREATE TABLE ${table.table_name} (\n`;

  for (const column of table.columns) {
    sql += `  ${column.name} ${column.type}`;

    if (!column.nullable) {
      sql += " NOT NULL";
    }

    if (column.primary_key) {
      sql += " PRIMARY KEY";
    }

    if (column.auto_increment) {
      sql += " AUTO_INCREMENT";
    }

    if (column.foreign_key) {
      const { table: refTable, column: refColumn } = column.foreign_key;
      sql += ` REFERENCES ${refTable}(${refColumn})`;
    }

    sql += ",\n";
  }

  sql = sql.slice(0, -2);
  sql += "\n);\n\n";

  return sql;
}

function generateSchemaSql(schema) {
  let sql = "";

  sql += generateDropTableSql(schema.events);
  sql += generateDropTableSql(schema.cases) + "\n";

  sql += generateTableSql(schema.cases);
  sql += generateTableSql(schema.events);

  return sql;
}

function extractColumnsAsMap(columns) {
  const map = {};

  for (const column of columns) {
    const { display_name, name } = column;
    map[display_name] = name;
  }

  return map;
}

function columnsFromMap(columnsMap, displayNames) {
  const columns = [];

  for (const key of displayNames) {
    if (key.startsWith("_")) continue;

    const value = columnsMap[key];
    columns.push(value);
  }

  return columns;
}

module.exports = { generateSchemaSql, generateSqlInsert };
