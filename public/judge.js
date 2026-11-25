// The parent creates this worker inside an iframe with an opaque origin.
self.onmessage = async ({ data: { code, tests } }) => {
  const output = { stdout: '', stderr: '' };
  const MAX_OUTPUT = 12000;
  const format = value => {
    if (typeof value === 'string') return value;
    try { return JSON.stringify(value) ?? String(value); }
    catch { return String(value); }
  };
  const write = (stream, values) => {
    if (output[stream].length >= MAX_OUTPUT) return;
    const text = values.map(format).join(' ') + '\n';
    const remaining = MAX_OUTPUT - output[stream].length;
    output[stream] += text.length > remaining ? text.slice(0, remaining) + '\n[Output truncated]\n' : text;
  };
  const console = {
    log: (...args) => write('stdout', args),
    info: (...args) => write('stdout', args),
    warn: (...args) => write('stderr', args),
    error: (...args) => write('stderr', args),
  };
  try {
    const results = [];
    for (const [args, expected] of tests) {
      const solve = new Function('console', code + '\nreturn solve;')(console);
      const actual = await solve(...args);
      results.push({
        pass: JSON.stringify(actual) === JSON.stringify(expected),
        actual: format(actual),
      });
    }
    self.postMessage({ ...output, results });
  } catch (error) {
    self.postMessage({ ...output, error: String(error) });
  }
};
