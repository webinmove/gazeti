const { expect } = require('chai');
const { useFakeTimers } = require('sinon');
const destinationStream = require('../fixtures/destintionStream');

const Gazeti = require('../../src/libs/Gazeti');
const hostname = require('os').hostname();
const version = require('../../package.json').version;
const pid = process.pid;

describe('Class Gazeti', () => {
  let clock;

  before(() => {
    clock = useFakeTimers({
      now: new Date('2019-01-01T00:00:00.000Z').getTime()
    });
  });

  after(() => {
    clock.restore();
  });

  it('has method "create" exists', () => {
    const logger = new Gazeti();

    expect(logger.create).to.be.a('function');
  });

  it('takes one argument', () => {
    const logger = new Gazeti();

    expect(logger.create).to.have.lengthOf(1);
  });

  describe('Method create ', () => {
    const logger = new Gazeti();
    const log = logger.create({ module: 'test' });

    it('creates an object logger', () => {
      expect(log).to.be.an('object');
    });

    it('creates a logger with 5 methods', () => {
      expect(Object.keys(log)).to.have.lengthOf(5);
    });

    it('creates a logger with a "debug" method having 3 arguments', () => {
      expect(log.debug).to.have.lengthOf(3);
    });

    it('creates a logger with a "info" method having 3 arguments', () => {
      expect(log.info).to.have.lengthOf(3);
    });

    it('creates a logger with a "warn" method having 3 arguments', () => {
      expect(log.warn).to.have.lengthOf(3);
    });

    it('creates a logger with a "error" method having 3 arguments', () => {
      expect(log.error).to.have.lengthOf(3);
    });

    it('creates a logger with a "fatal" method having 3 arguments', () => {
      expect(log.fatal).to.have.lengthOf(3);
    });
  });

  describe('Logging format', () => {
    it('should log in the good JSON format', (done) => {
      const destination = destinationStream(outputText => {
        const output = JSON.parse(outputText);

        expect(output).to.deep.equal({
          level: 30,
          time: '2019-01-01T00:00:00.000Z',
          hostname,
          pid,
          version,
          name: '@webinmove/gazeti',
          module: 'test',
          event: 'TEST_EVENT',
          indexed: { val: 1 },
          raw: { val: '2' },
          v: 1
        });

        done();
      });
      const logger = new Gazeti({ destination });

      const log = logger.create({ module: 'test' });

      log.info('TEST_EVENT', { val: 1 }, { val: '2' });
      destination.end();
    });

    it('should log in the good pretty format', (done) => {
      const destination = destinationStream(outputText => {
        expect(outputText.split('\n')).to.deep.equal([
          `["2019-01-01T00:00:00.000Z"] \u001b[32mINFO \u001b[39m (@webinmove/gazeti/${pid} on ${hostname}):`,
          `    version: "${version}"`,
          '    module: "test"',
          '    event: "TEST_EVENT"',
          '    indexed: null',
          '    raw: null',
          ''
        ]);
        done();
      });

      const logger = new Gazeti({ destination, pretty: true });

      const log = logger.create({ module: 'test' });
      log.info('TEST_EVENT');
      destination.end();
    });
  });

  describe('Logging error stack', () => {
    it('should log error and indexed', (done) => {
      const destination = destinationStream(outputText => {
        const output = JSON.parse(outputText);

        expect(output).to.have.nested.property('indexed.error.message', 'test');
        expect(output).to.have.nested.property('indexed.error.stack');
        expect(output).to.have.nested.deep.property('indexed.user', { id: 123 });
        done();
      });

      const logger = new Gazeti({ destination, stackLevel: 'error' });
      const log = logger.create({ module: 'test' });
      log.error('TEST_ERROR', {
        user: {
          id: 123
        },
        error: new Error('test')
      });
      destination.end();
    });

    it('should log the stack for defined level', (done) => {
      const destination = destinationStream(outputText => {
        const output = JSON.parse(outputText);

        expect(output).to.have.nested.property('indexed.error.message', 'test');
        expect(output).to.have.nested.property('indexed.error.stack');
        done();
      });

      const logger = new Gazeti({ destination, stackLevel: 'error' });
      const log = logger.create({ module: 'test' });
      log.error('TEST_ERROR', new Error('test'));
      destination.end();
    });

    it('should log the stack above defined level', (done) => {
      const destination = destinationStream(outputText => {
        const output = JSON.parse(outputText);

        expect(output).to.have.nested.property('indexed.error.message', 'test');
        expect(output).to.have.nested.property('indexed.error.stack');
        done();
      });

      const logger = new Gazeti({ destination, stackLevel: 'warn' });
      const log = logger.create({ module: 'test' });
      log.fatal('TEST_ERROR', new Error('test'));
      destination.end();
    });

    it('should NOT log the stack below defined level', (done) => {
      const destination = destinationStream(outputText => {
        const output = JSON.parse(outputText);

        expect(output).to.have.nested.property('indexed.error.message', 'test');
        expect(output).to.not.have.nested.property('indexed.error.stack');
        done();
      });

      const logger = new Gazeti({ destination, stackLevel: 'error' });
      const log = logger.create({ module: 'test' });
      const error = new Error('test');

      log.warn('TEST_ERROR', error);
      destination.end();
    });
  });

  describe('Logging error message', () => {
    it('should log a shortened error message', (done) => {
      const destination = destinationStream(outputText => {
        const output = JSON.parse(outputText);

        expect(output).to.have.nested.property('indexed.error.message', 'test');
        done();
      });

      const logger = new Gazeti({ destination, messageErrorLength: 4 });
      const log = logger.create({ module: 'test' });
      const error = new Error('test-to-be-shorten');

      log.error('TEST_ERROR', error);
      destination.end();
    });
  });
});
