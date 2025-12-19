/* Simple console-based logger; can be replaced with Winston/Pino in real deployments */

export const logger = {
  info: (...args) => {
    // eslint-disable-next-line no-console
    console.log('[INFO]', ...args);
  },
  error: (...args) => {
    // eslint-disable-next-line no-console
    console.error('[ERROR]', ...args);
  },
  warn: (...args) => {
    // eslint-disable-next-line no-console
    console.warn('[WARN]', ...args);
  },
};