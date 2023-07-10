const { loadAndSetUserConfigurations, config } = require("./config");
const { processVocabulary } = require("./vocabulary");
const { generateTicketsData, generateTransitionsData } = require("./data");
const { saveToCSV, saveToSQL } = require("./output");

async function main() {
  loadAndSetUserConfigurations();
  const vocabulary = processVocabulary();
  
  const ticketsData = generateTicketsData(config.NUMBER_OF_CASES);
  const transitionsData = generateTransitionsData(ticketsData);
  
  if (config.SHOW_PROGRESS) {
    console.log("Writing data to files.")
  }
  
  if (config.OUTPUT_FORMAT === "csv") {
    saveToCSV("out/Tickets.csv", ticketsData);
    saveToCSV("out/TicketTransitions.csv", transitionsData);
  } else if (config.OUTPUT_FORMAT === "sql") {
    saveToSQL("out/Tickets.sql", ticketsData, "TICKETS");
  } else {
    throw new Error(
      `Invalid format: "${config.OUTPUT_FORMAT}". To see a list of valid formats, please rerun with the -help option"`
    );
  }
  if (config.SHOW_PROGRESS) {
    console.log("Done!")
  }
}

main().catch((error) => console.error(error));
