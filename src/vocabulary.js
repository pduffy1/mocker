const fs = require("fs");

const _vocabulary = {
  schema: {},
  data: {},
  randomStrings: {},
  cases: null,
  events: null
};

function processVocabulary() {
  const items = parseVocabulary();

  for (const key in items) {
    if (key === "__schema__") {
      _vocabulary.schema = items["__schema__"];
      continue;
    }

    const transitions = items[key];
    const parsedTransitions = [];

    for (const nextEvent in transitions) {
      const weight = transitions[nextEvent];
      parsedTransitions.push({ string: nextEvent, weight: weight });
    }

    randomizeWithWeights(key, parsedTransitions);
  }

  _vocabulary.initialEvent = getRandomString("__initial_event__");
  _vocabulary.finalEvent = getRandomString("__final_event__");

  parseSchema(items["__schema__"]);

  return _vocabulary;
}

function parseSchema(schema) {
  //Vocabulary data stored in a Lookup table
  if (schema.data) {
    for (const table of schema.data) {
      let id = 1;
      for (const column of table.columns) {
        //There can be at most a single column configured with is_lookup=true
        if (column.is_lookup) {
          _vocabulary.data[table.lookup_for] = {};
          
          const data = _vocabulary.randomStrings[table.lookup_for];
          if (!data) {
            throw new Error(
              `Missing key: "${table.lookup_for}". Please ensure that your configuration of attributes and events contains an entry for "${table.lookup_for}"`
            );
          }

          for (const item of data.values) {
            _vocabulary.data[table.lookup_for][item] = id++;
          }
        }
      }      
    }
  }
}

function randomizeWithWeights(key, stringsWithWeights) {
  const cumulativeWeights = [];
  const values = [];

  let cumulativeWeight = 0;
  for (const { string, weight } of stringsWithWeights) {
    cumulativeWeight += weight;
    cumulativeWeights.push(cumulativeWeight);
    values.push(string);
  }

  _vocabulary.randomStrings[key.toLowerCase()] = {
    weight: cumulativeWeights,
    values,
  };
}

function getRandomString(key) {
  key = key.toLowerCase();
  if (!_vocabulary.randomStrings[key]) {
    if (key === _vocabulary.finalEvent) {
      return _vocabulary.finalEvent;
    }
    throw new Error(
      `Missing key: "${key}". Please ensure that your configuration of attributes and events contains an entry for "${key}"`
    );
  }

  const randomNum = Math.random();
  const index = _vocabulary.randomStrings[key].weight.findIndex(
    (cp) => randomNum <= cp
  );

  if (index === -1) {
    return _vocabulary.randomStrings[key].values[0];
  }

  return _vocabulary.randomStrings[key].values[index];
}

function parseVocabulary() {
  try {
    return JSON.parse(fs.readFileSync("vocabulary.json", "utf8"));
  } catch (error) {
    console.error("Error parsing JSON file:", error);
    return null;
  }
}

function getVocabulary() {
  return _vocabulary;
}



module.exports = { processVocabulary, getRandomString, getVocabulary };
