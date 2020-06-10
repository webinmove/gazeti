const { Writable } = require('stream');

const createStream = (outputHandler) => {
  let output = '';

  return new Writable({
    write: (chunk, encoding, done) => {
      output += chunk.toString();
      done();
    }
  })
    .on('finish', () => {
      outputHandler(output);
    });
};

module.exports = createStream;
