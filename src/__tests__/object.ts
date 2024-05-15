import { String } from '../object';

describe('String hash key', () => {
  const hello1 = new String('Hello World');
  const hello2 = new String('Hello World');
  const diff1 = new String('My name is johnny');
  const diff2 = new String('My name is johnny');

  it('string with same content have same hash keys', () => {
    expect(hello1.hashKey().compare(hello2.hashKey())).toBe(true);
    expect(diff1.hashKey().compare(diff2.hashKey())).toBe(true);
  });

  it('string with different content have differen hash keys', () => {
    expect(hello1.hashKey().compare(diff1.hashKey())).toBe(false);
  });
});
