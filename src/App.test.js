function sum(a, b) {
  if (typeof a === 'string') {
    alert('string');
  } else {
    return a + b;
  }
}

describe('sum module', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });
  test('adds -1 + 1 to equal 0', () => {
    expect(sum(-1, 1)).toBe(0);
  });
});
