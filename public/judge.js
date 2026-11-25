// The parent creates this worker inside an iframe with an opaque origin.
self.onmessage = async ({ data: { code, tests } }) => {
  try {
    const results = [];
    for (const [args, expected] of tests) {
      const solve = new Function(code + '\nreturn solve;')();
      const actual = await solve(...args);
      results.push({
        pass: JSON.stringify(actual) === JSON.stringify(expected),
        actual: JSON.stringify(actual) ?? String(actual),
      });
    }
    self.postMessage({ results });
  } catch (error) {
    self.postMessage({ error: String(error) });
  }
};
