import { JsonLogger } from './json.logger';
import { TskvLogger } from './tskv.logger';

describe('форматирование логгера', () => {
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;

  const getStdout = () =>
    stdoutSpy.mock.calls.map(([chunk]) => String(chunk)).join('');
  const getStderr = () =>
    stderrSpy.mock.calls.map(([chunk]) => String(chunk)).join('');

  beforeEach(() => {
    stdoutSpy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    stderrSpy = jest
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true);
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-11-14T10:20:30.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('JsonLogger', () => {
    it('записывает log, debug и verbose в stdout в формате JSON', () => {
      const logger = new JsonLogger();

      logger.log('log message', { requestId: 1 }, 'AppService');
      logger.debug('debug message');
      logger.verbose('verbose message');

      expect(getStdout()).toBe(
        [
          {
            level: 'log',
            message: 'log message',
            optionalParams: [{ requestId: 1 }, 'AppService'],
          },
          {
            level: 'debug',
            message: 'debug message',
            optionalParams: [],
          },
          {
            level: 'verbose',
            message: 'verbose message',
            optionalParams: [],
          },
        ]
          .map((record) => `${JSON.stringify(record)}\n`)
          .join(''),
      );
      expect(getStderr()).toBe('');
    });

    it('записывает warn, error и fatal в stderr в формате JSON', () => {
      const logger = new JsonLogger();

      logger.warn('warning');
      logger.error('error');
      logger.fatal('fatal');

      expect(getStdout()).toBe('');
      expect(
        getStderr()
          .trimEnd()
          .split('\n')
          .map((line) => JSON.parse(line)),
      ).toEqual([
        { level: 'warn', message: 'warning', optionalParams: [] },
        { level: 'error', message: 'error', optionalParams: [] },
        { level: 'fatal', message: 'fatal', optionalParams: [] },
      ]);
    });

    it('сериализует Error, bigint и циклические значения без нарушения JSON', () => {
      const logger = new JsonLogger();
      const circular: Record<string, unknown> = {};
      circular.self = circular;

      logger.error(new Error('boom'), circular, 42n);

      const record = JSON.parse(getStderr());

      expect(record.level).toBe('error');
      expect(record.message).toEqual({
        name: 'Error',
        message: 'boom',
        stack: expect.any(String),
      });
      expect(record.optionalParams).toEqual([{ self: '[Circular]' }, '42']);
    });
  });

  describe('TskvLogger', () => {
    it('записывает поля в формате TSKV и экранирует зарезервированные символы', () => {
      const logger = new TskvLogger();

      logger.log('line 1\nline=2\tend\\path\r', { requestId: 7 });

      const escapedMessage = String.raw`line 1\nline\=2\tend\\path\r`;
      const serializedOptionalParams = '[{"requestId":7}]';

      expect(getStdout()).toBe(
        [
          'time=2026-11-14T10:20:30.000Z',
          'level=log',
          `message=${escapedMessage}`,
          `optionalParams=${serializedOptionalParams}`,
        ].join('\t') + '\n',
      );
      expect(getStderr()).toBe('');
    });

    it('записывает warn, error и fatal в stderr', () => {
      const logger = new TskvLogger();

      logger.warn('warning');
      logger.error('error');
      logger.fatal('fatal');

      expect(getStdout()).toBe('');
      expect(
        getStderr()
          .trimEnd()
          .split('\n')
          .map((line) =>
            Object.fromEntries(
              line.split('\t').map((field) => {
                const separatorIndex = field.indexOf('=');
                return [
                  field.slice(0, separatorIndex),
                  field.slice(separatorIndex + 1),
                ];
              }),
            ),
          ),
      ).toEqual([
        {
          time: '2026-11-14T10:20:30.000Z',
          level: 'warn',
          message: 'warning',
          optionalParams: '[]',
        },
        {
          time: '2026-11-14T10:20:30.000Z',
          level: 'error',
          message: 'error',
          optionalParams: '[]',
        },
        {
          time: '2026-11-14T10:20:30.000Z',
          level: 'fatal',
          message: 'fatal',
          optionalParams: '[]',
        },
      ]);
    });

    it('сериализует Error, bigint и циклические значения в дополнительных параметрах', () => {
      const logger = new TskvLogger();
      const circular: Record<string, unknown> = {};
      circular.self = circular;

      logger.error(new Error('boom'), circular, 42n);

      const optionalParamsField = getStderr()
        .trimEnd()
        .split('\t')
        .find((field) => field.startsWith('optionalParams='));

      expect(optionalParamsField).toBeDefined();

      const optionalParams = JSON.parse(
        optionalParamsField!.replace('optionalParams=', ''),
      );

      expect(optionalParams).toEqual([{ self: '[Circular]' }, '42']);
    });
  });
});
