import { UserAgent } from './user-agent.vo';

describe('UserAgent Value Object', () => {
  it('should store user agent string', () => {
    const ua = new UserAgent('Mozilla/5.0');
    expect(ua.toString()).toBe('Mozilla/5.0');
  });

  it('should default to unknown if empty', () => {
    const ua = new UserAgent('');
    expect(ua.toString()).toBe('unknown');
  });

  it('should default to unknown if undefined', () => {
    const ua = new UserAgent(undefined as any);
    expect(ua.toString()).toBe('unknown');
  });
});
