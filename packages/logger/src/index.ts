import pino, { type Logger as PinoLogger } from 'pino';

export const LOG_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];
export type LogContext = Record<string, unknown>;

export interface Logger {
  readonly level: LogLevel;
  readonly name: string;
  child(bindings: LogContext, options?: { level?: LogLevel }): Logger;
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  fatal(message: string, context?: LogContext): void;
}

export interface CreateLoggerOptions {
  readonly name: string;
  readonly level?: LogLevel | string | undefined;
  readonly bindings?: LogContext | undefined;
  readonly enabled?: boolean | undefined;
}

export function createLogger(options: CreateLoggerOptions | string): Logger {
  const resolvedOptions =
    typeof options === 'string' ? { name: options } : options;
  const level = resolveLogLevel(resolvedOptions.level);

  const instance = pino({
    name: resolvedOptions.name,
    level,
    enabled: resolvedOptions.enabled ?? true,
    serializers: {
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err
    }
  }).child(resolvedOptions.bindings ?? {});

  return new PinoLoggerAdapter({
    instance,
    level,
    name: resolvedOptions.name
  });
}

class PinoLoggerAdapter implements Logger {
  public readonly level: LogLevel;
  public readonly name: string;

  readonly #instance: PinoLogger;

  constructor(options: {
    instance: PinoLogger;
    level: LogLevel;
    name: string;
  }) {
    this.#instance = options.instance;
    this.level = options.level;
    this.name = options.name;
  }

  public child(bindings: LogContext, options?: { level?: LogLevel }): Logger {
    const childName =
      typeof bindings.name === 'string' ? bindings.name : this.name;
    const childLevel = options?.level ?? this.level;
    return new PinoLoggerAdapter({
      instance: this.#instance.child(bindings as pino.Bindings),
      level: childLevel,
      name: childName
    });
  }

  public debug(message: string, context?: LogContext): void {
    this.write('debug', message, context);
  }

  public info(message: string, context?: LogContext): void {
    this.write('info', message, context);
  }

  public warn(message: string, context?: LogContext): void {
    this.write('warn', message, context);
  }

  public error(message: string, context?: LogContext): void {
    this.write('error', message, context);
  }

  public fatal(message: string, context?: LogContext): void {
    this.write('fatal', message, context);
  }

  private write(level: LogLevel, message: string, context?: LogContext): void {
    if (context) {
      this.#instance[level](context, message);
    } else {
      this.#instance[level](message);
    }
  }
}

export function resolveLogLevel(level?: LogLevel | string): LogLevel {
  if (!level) {
    return 'info';
  }

  const normalized = level.toLowerCase();
  if (isLogLevel(normalized)) {
    return normalized;
  }

  console.warn(
    `[logger] Invalid log level "${level}", falling back to "info".`
  );
  return 'info';
}

export function isLogLevel(value: string): value is LogLevel {
  return LOG_LEVELS.includes(value as LogLevel);
}
