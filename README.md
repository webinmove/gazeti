# Gazeti

## Description

Gazeti means "log" in Swahili.

A basic Logger object that force a logging format for a correct logstash extraction

## Environment Variables

```sh
LOG_LEVEL # (optional) Defines you log level, defaut 'info'
LOG_STACK_LEVEL # (optional) Defines minimum level to log stack, default 'error'
LOG_PRETTY # (optional) Defines pretty print output, default false
LOG_LABELS # (optional) Defines if log labels should be used instead of levels, default false
LOG_ERROR_MESSAGE_LENGTH # (optional) Defines error message max length output, default 0 (no limit)
```

*Notes:*

 - *LOG_ENDPOINT is intended to be used with AWS Lambda and will be over UDP*
 - *LOG_PRETTY is intended to be used in local development*
 - *LOG_ERROR_MESSAGE_LENGTH is intended to be used when package like request log full request content with files...*

## Automatic loads

This logger automatically loads info from the `package.json`
but also from a `version.json` file if present at the root of the project.

**version.json structure**

```json
{
  "projectName": "my-project",
  "buildNumber": "120",
  "commit": "a8f571799deb70dae2da3ba1de62097700bde304"
}
```

## Usage

```js
var log = require('@webinmove/gazeti')
  .create({ module: 'files-controller' });

log.debug('event', {
  user: {
    id : 132
  }
}, {
  user: {
    name: 'Someone'
  }
});
```

The indexed and raw parameters are optional.
They can be or they can contain an `Error` object in a error field which will be serialized

Here are the different logging methods:

```js
log.debug(event, indexed, raw);
log.info(event, indexed, raw);
log.warn(event, indexed, raw);
log.error(event, indexed, raw);
log.fatal(event, indexed, raw);
```

## Output

With this code and a `version.json` file present:

```js
log.error('ERROR_EVENT', { error: new Error('Some error') }, { foo: 'bar' });
```

```json
{
  "level": 50,
  "time": "2019-01-01T00: 00: 00.000Z",
  "hostname": "my-hostname",
  "pid": 71202,
  "version": "1.0.1",
  "projectName": "gazeti",
  "buildNumber": "120",
  "commit": "a8f571799deb70dae2da3ba1de62097700bde304",
  "name": "my-service",
  "module": "mymodule",
  "event": "ERROR_EVENT",
  "indexed": {
    "error": {
      "type": "Error",
      "message": "Some error",
      "stack": "Error: Some error\n    at Context.it (/var/www/gazeti/test/libs/Gazeti.spec.js:191:31)\n    at callFnAsync (/var/www/gazeti/node_modules/mocha/lib/runnable.js:400:21)\n    at Test.Runnable.run (/var/www/gazeti/node_modules/mocha/lib/runnable.js:342:7)\n    at Runner.runTest (/var/www/gazeti/node_modules/mocha/lib/runner.js:455:10)\n    at /var/www/gazeti/node_modules/mocha/lib/runner.js:573:12\n    at next (/var/www/gazeti/node_modules/mocha/lib/runner.js:369:14)\n    at /var/www/gazeti/node_modules/mocha/lib/runner.js:379:7\n    at next (/var/www/gazeti/node_modules/mocha/lib/runner.js:303:14)\n    at Immediate._onImmediate (/var/www/gazeti/node_modules/mocha/lib/runner.js:347:5)\n    at runCallback (timers.js:694:18)\n    at tryOnImmediate (timers.js:665:5)\n    at processImmediate (timers.js:647:5)"
    }
  },
  "raw": {
    "foo": "bar"
  },
  "v":1
}
```
