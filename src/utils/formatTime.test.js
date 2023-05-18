import { formatTime, formatTimeRange } from './formatTime';

describe('formatTime function', () => {
  it('should return a correctly formatted time string', () => {
    const unixTime = 1683870369; 
    const result = formatTime(unixTime);
    expect(result).toBe('05.12 13:46');
  });
});
describe('formatTimeRange function', () => {
  it('should return a correctly formatted time string', () => {
    const startTime = { seconds: 1683870369 };
    const endTime = { seconds: 1683870369 };
    const result = formatTimeRange(startTime, endTime);
    expect(result).toBe('05.12 13:46 — 05.12 13:46');
  });
});
