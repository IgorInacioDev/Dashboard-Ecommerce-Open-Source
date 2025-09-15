type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type LogContext = {
  requestId?: string
  url?: string
  userId?: string
  component?: string
  [key: string]: unknown
}

function format(level: LogLevel, message: string, context?: LogContext) {
  return JSON.stringify({
    ts: new Date().toISOString(),
    level,
    message,
    ...(context ? { context } : {}),
  })
}

function emit(level: LogLevel, message: string, context?: LogContext) {
  const payload = format(level, message, context)
  switch (level) {
    case 'debug':
      console.debug(payload)
      break
    case 'info':
      console.info(payload)
      break
    case 'warn':
      console.warn(payload)
      break
    case 'error':
      console.error(payload)
      break
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => emit('debug', message, context),
  info: (message: string, context?: LogContext) => emit('info', message, context),
  warn: (message: string, context?: LogContext) => emit('warn', message, context),
  error: (message: string, context?: LogContext) => emit('error', message, context),
}