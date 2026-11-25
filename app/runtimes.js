const api = 'https://wandbox.org/api';
export const javascript = { name: 'browser-js', label: 'JavaScript', language: 'JavaScript' };

const common = ['Python', 'C++', 'Java', 'C', 'TypeScript', 'C#', 'Go', 'Rust', 'Ruby', 'PHP'];
const fallback = [
  ['Python', 'cpython-3.14.7', 'cpython'], ['C++', 'gcc-13.2.0', 'gcc'],
  ['Java', 'openjdk-jdk-22+36', 'openjdk'], ['C', 'gcc-13.2.0-c', 'gcc-c'],
  ['TypeScript', 'typescript-5.6.2', 'typescript'], ['C#', 'dotnetcore-8.0.402', 'dotnetcore'],
  ['Go', 'go-1.27.4', 'go'], ['Rust', 'rust-1.100.0', 'rust'],
  ['Ruby', 'ruby-4.0.2', 'ruby'], ['PHP', 'php-8.3.12', 'php'],
];
export const initialRuntimes = [javascript, ...fallback.map(([language, name, template]) => ({ label: language === 'Python' ? 'Python 3' : language, language, name, template }))];

export async function loadRuntimes(signal) {
  const response = await fetch(api + '/list.json', { signal, credentials: 'omit' });
  if (!response.ok) throw Error('The language catalog is temporarily unavailable.');
  const compilers = await response.json();
  const byLanguage = new Map();
  for (const compiler of compilers) {
    const { language, name, templates, version } = compiler;
    if (!language || !name || /head|experimental/i.test(name + ' ' + version)) continue;
    if (language === 'Python' && !/^cpython-3\./.test(name)) continue;
    if (language === 'C#' && !name.startsWith('dotnetcore-')) continue;
    if (!byLanguage.has(language)) {
      const label = language === 'JavaScript' ? 'JavaScript (Node.js)' : language === 'Python' ? 'Python 3' : language;
      byLanguage.set(language, { language, name, label, version, template: templates?.[0] });
    }
  }
  const featured = common.map(language => byLanguage.get(language)).filter(Boolean);
  const extra = [...byLanguage.values()].filter(runtime => !common.includes(runtime.language));
  return [javascript, ...featured, ...extra.sort((a, b) => a.label.localeCompare(b.label))];
}

export function starterCode(runtime, problem) {
  if (runtime.name === javascript.name) return problem.starter;
  if (runtime.language === 'Python') {
    const args = problem.starter.match(/function solve\(([^)]*)\)/)[1];
    return 'import json\nimport sys\n\ndef solve(' + args + '):\n    # Write your solution here\n    return None\n\nprint(json.dumps(solve(*json.load(sys.stdin))))\n';
  }
  if (runtime.language === 'JavaScript') {
    return "const fs = require('node:fs');\n\n" + problem.starter +
      "\n\nconst args = JSON.parse(fs.readFileSync(0, 'utf8'));\nconsole.log(JSON.stringify(solve(...args)));\n";
  }
  return '';
}

export async function loadTemplate(runtime, signal) {
  const response = await fetch(api + '/template/' + encodeURIComponent(runtime.template), { signal, credentials: 'omit' });
  if (!response.ok) throw Error('This starter could not be loaded.');
  const template = await response.json();
  if (typeof template.code !== 'string') throw Error('This starter is unavailable.');
  return template.code;
}

export async function runProgram(runtime, code, stdin, signal) {
  const response = await fetch(api + '/compile.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'omit',
    body: JSON.stringify({ compiler: runtime.name, code, stdin, save: false }),
    signal: AbortSignal.any([signal, AbortSignal.timeout(30000)]),
  });
  if (response.status === 429) throw Error('The compiler is busy. Wait a moment and try again.');
  if (!response.ok) throw Error('The compiler could not run this request (HTTP ' + response.status + ').');
  const output = await response.json();
  return {
    stdout: output.program_output ?? '',
    stderr: output.program_error ?? '',
    compiler: [output.compiler_output, output.compiler_error].filter(Boolean).join('\n'),
    exitCode: output.status,
    signal: output.signal,
  };
}

export async function checkProgram(runtime, code, tests, signal, onProgress) {
  const results = [];
  for (const [args, expected] of tests) {
    const output = await runProgram(runtime, code, JSON.stringify(args) + '\n', signal);
    signal.throwIfAborted();
    const actual = output.stdout.trim();
    let pass = false;
    try {
      pass = output.exitCode === '0' && !output.signal && JSON.stringify(JSON.parse(actual)) === JSON.stringify(expected);
    } catch {
      // Test submissions must print exactly one JSON value.
    }
    results.push({ ...output, actual: actual || '(no output)', pass });
    onProgress(results.length);
    if (!pass) break;
  }
  return { results };
}
