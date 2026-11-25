import { useEffect, useRef, useState } from 'react';
import CodeEditor from './code-editor';
import { judge } from './browser-judge';
import { checkProgram, initialRuntimes, javascript, loadRuntimes, loadTemplate, runProgram, starterCode } from './runtimes';

const display = value => JSON.stringify(value);
const exampleInput = args => display(args) + '\n';

function Terminal({ result, running, progress, clear }) {
  const output = { ...result, ...result?.results?.at(-1) };
  return <section className="terminal" aria-label="Terminal">
    <header className="terminal-bar">
      <strong><span aria-hidden="true">›_</span> Terminal</strong>
      <button type="button" onClick={clear} disabled={running || !result}>Clear</button>
    </header>
    <div className="terminal-output" role="log" aria-live="polite" aria-busy={running}>
      {running && <p className="terminal-dim">{progress}</p>}
      {!running && !result && <p className="terminal-dim">Run your solution to see its output here.</p>}
      {result?.error && <pre className="terminal-error">{result.error}</pre>}
      {result?.message && <p className="terminal-dim">{result.message}</p>}
      {output?.compiler && <div><span className="terminal-label">Compiler</span><pre>{output.compiler}</pre></div>}
      {output?.stdout && <div><span className="terminal-label">stdout</span><pre>{output.stdout}</pre></div>}
      {output?.stderr && <div><span className="terminal-label">stderr</span><pre className="terminal-error">{output.stderr}</pre></div>}
      {output?.signal && <p className="terminal-error">Terminated by {output.signal}</p>}
      {output?.exitCode != null && output.exitCode !== '' && <p className={output.exitCode === '0' ? 'terminal-dim' : 'terminal-error'}>Exit code {output.exitCode}</p>}
      {result?.results && <>
        <strong className={result.passed ? 'terminal-pass' : 'terminal-error'}>{result.accepted ? 'Accepted' : result.passed ? 'Examples passed' : 'Some tests failed'}</strong>
        {result.results.map(({ pass, actual }, i) => <p key={i} className={pass ? 'terminal-pass' : 'terminal-error'}>
          Test {i + 1} · {pass ? 'Passed' : 'Expected ' + display(result.tests[i][1]) + ', received ' + actual}
        </p>)}
      </>}
    </div>
  </section>;
}

export default function Workspace({ problem, data, update, toggle, Icon }) {
  const task = useRef(null);
  const [runtimes, setRuntimes] = useState(initialRuntimes);
  const [language, setLanguage] = useState(javascript.label);
  const [stdin, setStdin] = useState(() => exampleInput(problem.tests[0][0]));
  const [example, setExample] = useState(0);
  const [hint, setHint] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);
  const [copyStatus, setCopyStatus] = useState('');
  const runtime = runtimes.find(item => item.label === language) ?? javascript;
  const local = runtime.name === javascript.name;
  const running = progress !== '';
  const starter = starterCode(runtime, problem);
  const code = (local ? data.drafts[problem.id] : data.programs[problem.id]?.[language]) ?? starter;

  useEffect(() => {
    const catalog = new AbortController();
    const signal = AbortSignal.any([catalog.signal, AbortSignal.timeout(10000)]);
    loadRuntimes(signal).then(items => {
      if (!catalog.signal.aborted) {
        const labels = new Set(items.map(item => item.label));
        setRuntimes([...items, ...initialRuntimes.filter(item => !labels.has(item.label))]);
      }
    }).catch(() => {});
    return () => { catalog.abort(); task.current?.abort(); };
  }, []);

  function change(value) {
    update(previous => {
      if (local) return { ...previous, drafts: { ...previous.drafts, [problem.id]: value } };
      return {
        ...previous,
        programs: {
          ...previous.programs,
          [problem.id]: { ...previous.programs[problem.id], [language]: value },
        },
      };
    });
    setCopyStatus('');
  }

  async function execute(message, action) {
    if (task.current) return;
    const controller = new AbortController();
    task.current = controller;
    setProgress(message);
    setResult(null);
    try {
      await action(controller.signal);
    } catch (error) {
      setResult(controller.signal.aborted
        ? { message: 'Run stopped.' }
        : { error: error.name === 'TimeoutError' ? 'Execution timed out.' : error.message });
    } finally {
      task.current = null;
      setProgress('');
    }
  }

  function run(submit) {
    return execute(local || submit ? 'Running tests…' : 'Running program…', async signal => {
      const tests = submit ? problem.tests : problem.tests.slice(0, 2);
      if (!local && !submit) {
        const output = await runProgram(runtime, code, stdin, signal);
        signal.throwIfAborted();
        setResult({ ...output, message: !output.stdout && !output.stderr && !output.compiler ? 'No output.' : '' });
        return;
      }
      const outcome = local
        ? await judge(code, tests, signal)
        : await checkProgram(runtime, code, tests, signal, done => setProgress('Checked ' + done + ' of ' + tests.length + ' tests…'));
      signal.throwIfAborted();
      const passed = outcome.results?.length === tests.length && outcome.results.every(test => test.pass);
      if (submit && passed) update(previous => ({ ...previous, solved: [...new Set([...previous.solved, problem.id])] }));
      setResult({ ...outcome, tests, passed, accepted: submit && passed });
    });
  }

  function reset() {
    if (starter || !runtime.template) {
      change(starter);
      setResult(null);
      return;
    }
    execute('Loading starter…', async signal => {
      const template = await loadTemplate(runtime, AbortSignal.any([signal, AbortSignal.timeout(10000)]));
      signal.throwIfAborted();
      change(template);
    });
  }

  return <div className="shell problem-shell">
    <header className="workspace-header problem-topbar">
      <strong><img src="/algolab-mark.svg" alt="" width={22} height={22} /> Practice workspace</strong>
      <a className="secondary" href="/">Problem library</a>
    </header>
    <main className="workspace-grid practice-workspace">
      <section className="description">
        <div className="problem-meta"><span className={'level ' + problem.level.toLowerCase()}>{problem.level}</span><span className="topic-label">{problem.topic}</span></div>
        <h1>{problem.title}</h1><p>{problem.prompt}</p>
        <h3>Examples</h3>
        {problem.tests.slice(0, 2).map(([args, expected], i) => <pre key={i}>Input: {args.map(display).join(', ')}{'\n'}Output: {display(expected)}</pre>)}
        <div className="workspace-actions">
          <button className="secondary" onClick={() => setHint(!hint)} aria-expanded={hint}><Icon name="bolt" /> {hint ? 'Hide hint' : 'Show hint'}</button>
          <button className="secondary" onClick={() => toggle(problem.id)}><Icon name="bookmark" /> {data.saved.includes(problem.id) ? 'Saved' : 'Save'}</button>
        </div>
        {hint && <p className="hint">{problem.hint}</p>}
        <div className="leetcode-actions">
          {problem.leetcode && <a className="secondary" href={'https://leetcode.com/problems/' + problem.leetcode + '/'} target="_blank" rel="noopener noreferrer">Open in LeetCode</a>}
          <button className="secondary" disabled={!code.trim()} onClick={async () => {
            try { await navigator.clipboard.writeText(code); setCopyStatus('Copied'); }
            catch { setCopyStatus('Select the code to copy it.'); }
          }}>Copy code</button>
          <span role="status">{copyStatus}</span>
        </div>
        {problem.leetcode && <p className="leetcode-note">Use LeetCode’s own solution template when submitting there.</p>}
      </section>
      <section className="editor">
        <div className="editor-header practice-editor-header">
          <div className="runtime-control">
            <label htmlFor="runtime">Language</label>
            <select id="runtime" value={language} disabled={running} onChange={event => {
              setLanguage(event.target.value);
              setResult(null);
              setCopyStatus('');
            }}>
              {runtimes.map(item => <option key={item.label} value={item.label}>{item.label}</option>)}
            </select>
          </div>
          <button className="editor-tool" disabled={running} onClick={reset} aria-label={starter ? 'Reset code' : 'Load runtime starter'}><Icon name="reset" size={16} />{starter ? 'Reset' : 'Load starter'}</button>
        </div>
        <CodeEditor language={runtime.language} value={code} onChange={value => { change(value); setResult(null); }} locked={running} />
        {!local && <section className="stdin-panel">
          <div className="stdin-header">
            <label htmlFor="stdin">Standard input <span>(stdin)</span></label>
            <select aria-label="Load problem example into stdin" value={example} disabled={running} onChange={event => {
              const selected = Number(event.target.value);
              setExample(selected);
              setStdin(exampleInput(problem.tests[selected][0]));
            }}>{problem.tests.slice(0, 2).map((_, i) => <option key={i} value={i}>Example {i + 1}</option>)}</select>
            <button className="editor-tool" disabled={running} onClick={() => setStdin(exampleInput(problem.tests[example][0]))}>Load</button>
          </div>
          <textarea id="stdin" value={stdin} rows={2} spellCheck={false} readOnly={running} onChange={event => setStdin(event.target.value)} />
          <p>For submission, read one JSON array of arguments from stdin and print one JSON result per run.</p>
        </section>}
        <Terminal result={result} running={running} progress={progress} clear={() => setResult(null)} />
        <div className="editor-footer practice-editor-footer">
          <span>{local ? 'Runs in your browser' : 'Code and input run on Wandbox'}</span>
          {running
            ? <button className="secondary" onClick={() => task.current?.abort()}>Stop</button>
            : <><button className="secondary" disabled={!code.trim()} onClick={() => run(false)}><Icon name="play" size={15} />{local ? 'Run examples' : 'Run program'}</button><button className="primary" disabled={!code.trim()} onClick={() => run(true)}>Submit solution</button></>}
        </div>
      </section>
    </main>
  </div>;
}
