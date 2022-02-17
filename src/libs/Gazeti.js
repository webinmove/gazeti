const pino = require('pino');
const os = require('os');
const loadJson = require('../helpers/loadJson');

const packageInfo = loadJson('package.json');
const versionInfo = loadJson('version.json', {});

const levels = ['debug', 'info', 'warn', 'error', 'fatal'];

module.exports = class Gazeti {
  constructor ({
    logLevel = '',
    stackLevel = 'error',
    destination = pino.destination(1),
    messageErrorLength = 0, // 0 means no limit
    pretty = false,
    useLabels = false
  } = {}) {
    let { projectName, buildNumber, commit } = versionInfo;

    if (!buildNumber) {
      buildNumber = process.env.BUILD_NUMBER;
    }

    this.main = pino({
      name: packageInfo.name,
      base: {
        hostname: os.hostname(),
        pid: process.pid,
        version: packageInfo.version,
        projectName,
        buildNumber,
        commit
      },
      level: logLevel || 'info',
      timestamp: () => `,"time":"${new Date().toISOString()}"`,
      prettyPrint: pretty ? { colorize: true } : false,
      useLevelLabels: useLabels
    }, destination);

    this.messageErrorLength = messageErrorLength;
    this.stackLevelIndex = levels.indexOf(stackLevel);
  }

  shortenMessage (error) {
    if (error.message.length > this.messageErrorLength) {
      error.message = error.message.substring(0, this.messageErrorLength);
    }
  }

  removeStack (error) {
    const { message, stack, ...rest } = error;
    const ErrorNoStack = { message, ...rest };
    // Needed to be recognized as an error
    Object.setPrototypeOf(ErrorNoStack, Object.getPrototypeOf(error));

    return ErrorNoStack;
  }

  serializeError (logLevelindex, logData) {
    let serialized;
    const isError = logData instanceof Error;
    let baseError;

    if (isError) {
      baseError = logData;
    } else if ((logData || {}).error instanceof Error) {
      baseError = logData.error;
    }

    if (baseError) {
      // Some packages put entire file in message, this is too crazy ...
      if (this.messageErrorLength > 0) {
        this.shortenMessage(baseError);
      }

      if (logLevelindex < this.stackLevelIndex) {
        // Remove stack when not required
        baseError = this.removeStack(baseError);
      }

      if (isError) {
        serialized = { error: pino.stdSerializers.err(baseError) };
      } else {
        serialized = {
          ...logData,
          error: pino.stdSerializers.err(baseError)
        };
      }
    } else {
      serialized = logData;
    }

    return serialized;
  }

  buildLog (logLevelindex, event, indexed = null, raw = null, traceId = null) {
    const finalLog = {
      event,
      indexed: this.serializeError(logLevelindex, indexed),
      raw: this.serializeError(logLevelindex, raw),
      traceId
    };

    return finalLog;
  }

  create (info) {
    const childLogger = this.main.child(info);

    return levels.reduce((finalLogger, logLevel, logLevelindex) => {
      finalLogger[logLevel] = (event, data, meta, traceId) => {
        childLogger[logLevel](this.buildLog(logLevelindex, event, data, meta, traceId));
      };

      return finalLogger;
    }, {});
  }
};
