import CircuitBreaker from 'opossum';
import { logger } from './logger';
import { CIRCUIT_BREAKER_CONFIG } from '../utils/constants';

export const createCircuitBreaker = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  name: string
): CircuitBreaker<T, R> => {
  const breaker = new CircuitBreaker<T, R>(fn, {
    timeout: CIRCUIT_BREAKER_CONFIG.TIMEOUT,
    errorThresholdPercentage: CIRCUIT_BREAKER_CONFIG.ERROR_THRESHOLD_PERCENTAGE,
    resetTimeout: CIRCUIT_BREAKER_CONFIG.RESET_TIMEOUT,
    name,
  });

  breaker.on('open', () => {
    logger.warn(`Circuit breaker ${name} opened`);
  });

  breaker.on('halfOpen', () => {
    logger.info(`Circuit breaker ${name} half-open`);
  });

  breaker.on('close', () => {
    logger.info(`Circuit breaker ${name} closed`);
  });

  breaker.on('failure', (error) => {
    logger.error(`Circuit breaker ${name} failure:`, error);
  });

  return breaker;
};
