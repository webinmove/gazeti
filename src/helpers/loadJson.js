const path = require('path');

const loadJson = (filename, defaults = null, attempts = 1) => {
  if (attempts > 5) {
    if (defaults) {
      return defaults;
    }

    throw new Error(`Can't resolve ${filename} file`);
  }
  // Need to resolve "." to get the path of the execution command
  let mainPath = path.resolve('.');
  if (attempts > 1) {
    mainPath = path.resolve(mainPath, '../'.repeat(attempts - 1));
  }
  try {
    return require(path.join(mainPath, filename));
  } catch (e) {
    return loadJson(filename, defaults, attempts + 1);
  }
};

module.exports = loadJson;
