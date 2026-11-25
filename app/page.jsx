'use client';

import { useEffect, useRef, useState } from 'react';
import { problems } from './problems';

const icons = {
  logo: 'M5 8l-4 4 4 4m14-8 4 4-4 4M14 4l-4 16',
  grid: 'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.1M3 12h.1M3 18h.1',
  bookmark: 'M6 4h12v16l-6-4-6 4z',
  chart: 'M4 19h16M7 16v-5m5 5V5m5 11V8',
  target: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Zm-5 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Zm-5 0h.01',
  check: 'm5 12 4 4L19 6',
  layers: 'm12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5',
  search: 'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-2 5 5 5',
  chevron: 'm9 5 7 7-7 7',
  bolt: 'm13 2-9 12h7l-1 8 10-12h-7z',
  reset: 'M3 12a9 9 0 1 1 3 7M3 6v6h6',
  play: 'm8 5 12 7-12 7z',
  close: 'm6 6 12 12M18 6 6 18',
};
function Icon({ name, size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icons[name]} /></svg>;
}
const topics = ['All topics', ...new Set(problems.map(p => p.topic))];
const levels = ['Easy', 'Medium', 'Hard'];
const empty = { drafts: {}, saved: [], solved: [] };

async function judge(code, tests) {
  const response = await fetch('./judge.js');
  if (!response.ok) throw Error('The JavaScript runner could not load.');
  const source = await response.text();
  return new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');
    frame.hidden = true;
    frame.setAttribute('sandbox', 'allow-scripts');
    const clean = () => {
      clearTimeout(timeout);
      window.removeEventListener('message', receive);
      frame.remove();
    };
    const receive = ({ source, data }) => {
      if (source !== frame.contentWindow) return;
      if (data?.ready === true) {
        frame.contentWindow.postMessage({ code, tests }, '*');
      } else if (data?.error || Array.isArray(data?.results)) {
        clean();
        resolve(data);
      }
    };
    const timeout = setTimeout(() => {
      clean();
      reject(Error('Execution timed out. Check for an infinite loop.'));
    }, 3000);
    window.addEventListener('message', receive);
    frame.srcdoc = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; worker-src blob:"><script>
      const worker = new Worker(URL.createObjectURL(new Blob([${JSON.stringify(source).replaceAll('<', '\\u003c')}], {type:'text/javascript'})));
      window.onmessage = event => { if (event.source === parent) worker.postMessage(event.data); };
      worker.onmessage = event => parent.postMessage(event.data, '*');
      worker.onerror = () => parent.postMessage({error:'Unable to start the JavaScript runner.'}, '*');
      parent.postMessage({ready:true}, '*');
    <\/script>`;
    document.body.append(frame);
  });
}

function Workspace({ problem, data, update, toggle, close }) {
  const dialog = useRef(null);
  const [hint, setHint] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const code = data.drafts[problem.id] ?? problem.starter;
  useEffect(() => { dialog.current.showModal(); }, []);
  const change = value => update(prev => ({ ...prev, drafts: { ...prev.drafts, [problem.id]: value } }));
  async function run(submit) {
    setRunning(true);
    setResult(null);
    try {
      const outcome = await judge(code, submit ? problem.tests : problem.tests.slice(0, 2));
      const passed = outcome.results?.every(test => test.pass);
      if (submit && passed) update(prev => ({ ...prev, solved: [...new Set([...prev.solved, problem.id])] }));
      setResult({ ...outcome, accepted: submit && passed });
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setRunning(false);
    }
  }
  return <dialog ref={dialog} className="workspace" aria-label="Practice workspace" onCancel={close}>
    <header className="workspace-header"><strong><Icon name="logo" /> Practice workspace</strong><button className="icon-button" onClick={close} aria-label="Close workspace"><Icon name="close" /></button></header>
    <div className="workspace-grid">
      <section className="description">
        <div className="problem-meta"><span className={'level ' + problem.level.toLowerCase()}>{problem.level}</span><span className="topic-label">{problem.topic}</span></div>
        <h2>{problem.id}. {problem.title}</h2><p>{problem.prompt}</p>
        <h3>Examples</h3>
        {problem.tests.slice(0, 2).map(([args, expected], i) => <pre key={i}>Input: {args.map(arg => JSON.stringify(arg)).join(', ')}{'\n'}Output: {JSON.stringify(expected)}</pre>)}
        <div className="workspace-actions"><button className="secondary" onClick={() => setHint(!hint)} aria-expanded={hint}><Icon name="bolt" /> {hint ? 'Hide hint' : 'Show hint'}</button><button className="secondary" onClick={() => toggle(problem.id)}><Icon name="bookmark" /> {data.saved.includes(problem.id) ? 'Saved' : 'Save'}</button></div>
        {hint && <p className="hint">{problem.hint}</p>}
      </section>
      <section className="editor">
        <div className="editor-header"><label htmlFor="solution">JavaScript</label><button className="icon-button" aria-label="Reset code" disabled={running} onClick={() => { change(problem.starter); setResult(null); }}><Icon name="reset" /></button></div>
        <textarea id="solution" spellCheck={false} value={code} readOnly={running} onChange={event => { change(event.target.value); setResult(null); }} />
        <div className="results" aria-live="polite">
          {running ? 'Running tests…' : result?.error ? <span className="hard">{result.error}</span> : result?.results ? <>
            <strong>{result.accepted ? 'Accepted' : result.results.every(test => test.pass) ? 'Examples passed' : 'Some tests failed'}</strong>
            {result.results.map(({ pass, actual }, i) => <div key={i} className={pass ? 'easy' : 'hard'}>Test {i + 1}: {pass ? 'Passed' : 'Expected ' + JSON.stringify(problem.tests[i][1]) + ', received ' + actual}</div>)}
          </> : 'Run your code to check the examples.'}
        </div>
        <div className="editor-footer"><button className="secondary" disabled={running} onClick={() => run(false)}><Icon name="play" size={15} /> Run code</button><button className="primary" disabled={running} onClick={() => run(true)}>Submit solution</button></div>
      </section>
    </div>
  </dialog>;
}

export default function Home() {
  const [data, setData] = useState(empty);
  const [section, setSection] = useState('Problems');
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('All topics');
  const [level, setLevel] = useState('All difficulties');
  const [status, setStatus] = useState('Any status');
  const [active, setActive] = useState(null);
  const search = useRef(null);
  const current = useRef(empty);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('algolab-progress'));
      if (stored) { current.current = { ...empty, ...stored }; setData(current.current); }
    } catch {}
  }, []);
  useEffect(() => {
    const focusSearch = event => {
      if (event.key === '/' && !active && !event.target.matches('input, textarea, select')) {
        event.preventDefault();
        setSection('Problems');
        requestAnimationFrame(() => search.current?.focus());
      }
    };
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, [active]);
  function update(change) {
    current.current = change(current.current);
    setData(current.current);
    try { localStorage.setItem('algolab-progress', JSON.stringify(current.current)); } catch {}
  }
  function toggle(id) {
    update(prev => ({ ...prev, saved: prev.saved.includes(id) ? prev.saved.filter(saved => saved !== id) : [...prev.saved, id] }));
  }
  function navigate(next) {
    setSection(next); setQuery(''); setLevel('All difficulties'); setTopic('All topics'); setStatus('Any status');
  }
  const isSolved = id => data.solved.includes(id);
  const filtered = problems.filter(p => {
    const state = isSolved(p.id) ? 'Solved' : p.id in data.drafts ? 'Attempted' : 'Unstarted';
    return (section !== 'Bookmarks' || data.saved.includes(p.id)) &&
      (topic === 'All topics' || p.topic === topic) &&
      (level === 'All difficulties' || p.level === level) &&
      (status === 'Any status' || state === status) &&
      (p.title + ' ' + p.topic).toLowerCase().includes(query.trim().toLowerCase());
  });
  const nextProblem = problems.find(p => !isSolved(p.id)) ?? problems[0];
  return <div className="shell">
    <aside className="sidebar">
      <button className="brand" onClick={() => navigate('Problems')}><span className="brand-icon"><Icon name="logo" size={20} /></span>Algo<span>Lab</span></button>
      <div className="nav-label">WORKSPACE</div>
      <nav aria-label="Workspace">
        {[['Problems', 'grid'], ['Bookmarks', 'bookmark'], ['Progress', 'chart']].map(([name, icon]) => <button key={name} className={section === name ? 'nav active' : 'nav'} aria-current={section === name ? 'page' : undefined} onClick={() => navigate(name)}><Icon name={icon} />{name}</button>)}
      </nav>
      <div className="sidebar-bottom"><span className="avatar">A</span><div><strong>Local workspace</strong><small>Personal practice</small></div></div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><span><span className="breadcrumb-root">Workspace</span> <Icon name="chevron" size={13} /> <strong>{section}</strong></span></header>
      <main>
        {section === 'Problems' && <section className="hero">
          <div className="hero-text">
            <div className="hero-label"><Icon name="bolt" size={14} /> DSA PRACTICE</div>
            <h1>Build your <em>algorithm<br className="desktop-break" /> intuition.</em></h1>
            <p>Sharpen your problem-solving skills, one challenge at a time.</p>
            <button className="primary" onClick={() => setActive(nextProblem)}><Icon name="play" size={15} /> {data.drafts[nextProblem.id] ? 'Continue practice' : 'Start practicing'}</button>
          </div>
          <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit orbit-three"/><i className="star s1"/><i className="star s2"/><i className="star s3"/><i className="star s4"/><div className="code-tile"><Icon name="logo" size={63} /></div><div className="code-chip chip-one">{'{ }'}</div><div className="code-chip chip-two">{'[ ]'}</div></div>
        </section>}
        {section !== 'Bookmarks' && <div className="stats">
          {[[problems.length, 'Total problems', 'layers', 'purple'], [data.solved.length, 'Solved', 'check', 'green'], [data.saved.length, 'Bookmarked', 'bookmark', 'orange']].map(([number, name, icon, color]) => <div className="stat" key={name}><div className={'stat-icon ' + color}><Icon name={icon} size={20} /></div><div><strong>{number}</strong><span>{name}</span></div></div>)}
        </div>}
        {section === 'Progress' ? <section className="progress-view"><h1>Your progress</h1><p>{data.solved.length} of {problems.length} problems solved</p>{levels.map(item => {
          const group = problems.filter(p => p.level === item);
          const solved = group.filter(p => isSolved(p.id)).length;
          return <div className="progress-row" key={item}><span className={item.toLowerCase()}>{item}</span><progress value={solved} max={group.length} aria-label={item + ' problems solved'} /><span>{solved} / {group.length}</span></div>;
        })}</section> : <section className="library">
          <div className="library-heading"><h2>{section === 'Bookmarks' ? 'Bookmarked problems' : 'Problem library'}</h2><span>{filtered.length} {filtered.length === 1 ? 'problem' : 'problems'}</span></div>
          <div className="topics" aria-label="Filter by topic">{topics.map(item => <button className={topic === item ? 'topic selected' : 'topic'} key={item} aria-pressed={topic === item} onClick={() => setTopic(item)}>{item}</button>)}</div>
          <div className="filters">
            <div className="search"><Icon name="search" /><input ref={search} aria-label="Search problems" placeholder="Search problems…" value={query} onChange={event => setQuery(event.target.value)} /><kbd>/</kbd></div>
            <select aria-label="Difficulty" value={level} onChange={event => setLevel(event.target.value)}>{['All difficulties', ...levels].map(item => <option key={item}>{item}</option>)}</select>
            <select aria-label="Status" value={status} onChange={event => setStatus(event.target.value)}>{['Any status', 'Solved', 'Attempted', 'Unstarted'].map(item => <option key={item}>{item}</option>)}</select>
          </div>
          <div className="table-wrap"><table><thead><tr><th>Status</th><th>Problem</th><th>Difficulty</th><th>Topic</th><th><span className="sr-only">Bookmark</span></th></tr></thead><tbody>
            {filtered.map(p => <tr key={p.id}>
              <td><span className={'status-icon ' + (isSolved(p.id) ? 'solved' : p.id in data.drafts ? 'attempted' : '')} role="img" aria-label={isSolved(p.id) ? 'Solved' : p.id in data.drafts ? 'Attempted' : 'Unstarted'}>{isSolved(p.id) && <Icon name="check" size={14} />}</span></td>
              <td><button className="problem-link" onClick={() => setActive(p)}><span>{String(p.id).padStart(2, '0')}</span>{p.title}</button></td>
              <td><span className={'level ' + p.level.toLowerCase()}>{p.level}</span></td><td><span className="topic-label">{p.topic}</span></td>
              <td><button className={'icon-button save ' + (data.saved.includes(p.id) ? 'saved' : '')} aria-label={(data.saved.includes(p.id) ? 'Remove bookmark for ' : 'Bookmark ') + p.title} aria-pressed={data.saved.includes(p.id)} onClick={() => toggle(p.id)}><Icon name="bookmark" size={17} /></button></td>
            </tr>)}
            {filtered.length === 0 && <tr><td colSpan={5} className="empty">{section === 'Bookmarks' && !data.saved.length ? 'Bookmark a problem to find it here.' : 'No problems match these filters.'}</td></tr>}
          </tbody></table></div>
        </section>}
      </main>
    </div>
    {active && <Workspace key={active.id} problem={active} data={data} update={update} toggle={toggle} close={() => setActive(null)} />}
  </div>;
}
