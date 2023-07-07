const fs = require("fs");

const _vocabulary = {
  randomStrings: {}
};

function processVocabulary() {
  const events = parseVocabulary();

  for (const event in events) {
    const transitions = events[event];
    const parsedTransitions = [];

    for (const nextEvent in transitions) {
      const weight = transitions[nextEvent];
      parsedTransitions.push({ string: nextEvent, weight: weight });
    }

    randomizeWithWeights(event, parsedTransitions);
  }

  _vocabulary.initialEvent = getRandomString("__initial_event__");
  _vocabulary.finalEvent = getRandomString("__final_event__");

  return _vocabulary;
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

  _vocabulary.randomStrings[key] = {
    weight: cumulativeWeights,
    values,
  };
}

function getRandomString(key) {
  if (!_vocabulary.randomStrings[key]) {
    if (key === _vocabulary.finalEvent) {
      return _vocabulary.finalEvent;
    }
    throw new Error(
      `Missing key: "${key}". Please ensure that your configuration of attributes and events contains an entry for "${key}"`
    );
  }

  const randomNum = Math.random();
  const index = _vocabulary.randomStrings[key].weight.findIndex((cp) => randomNum <= cp);

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
