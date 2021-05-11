const Gazeti = require('./libs/Gazeti');
const env = process.env;

module.exports = new Gazeti({
  logLevel: env.LOG_LEVEL,
  pretty: env.LOG_PRETTY === 'true',
  useLabels: env.LOG_LABELS === 'true',
  messageErrorLength: parseInt(env.LOG_ERROR_MESSAGE_LENGTH || 0, 10),
  stackLevel: env.LOG_STACK_LEVEL
});
