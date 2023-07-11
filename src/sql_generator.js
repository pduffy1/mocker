const fs = require('fs');

function generateTableSql(table) {
    let sql = `CREATE TABLE ${table.table_name} (\n`;
  
    for (const column of table.columns) {
      sql += `  ${column.name} ${column.type}`;
  
      if (!column.nullable) {
        sql += ' NOT NULL';
      }
  
      if (column.primary_key) {
        sql += ' PRIMARY KEY';
      }
  
      if (column.auto_increment) {
        sql += ' AUTO_INCREMENT';
      }
  
      if (column.foreign_key) {
        const { table: refTable, column: refColumn } = column.foreign_key;
        sql += ` REFERENCES ${refTable}(${refColumn})`;
      }
  
      sql += ',\n';
    }
  
    sql = sql.slice(0, -2);
    sql += '\n);\n';
  
    return sql;
  }
  
  function generateSchemaSql(schema) {
    let sql = '';
  
    sql += generateTableSql(schema.cases);
    sql += generateTableSql(schema.events);
  
    return sql;
  }


module.exports = { generateSchemaSql };
