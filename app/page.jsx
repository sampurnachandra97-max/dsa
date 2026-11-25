'use client';

import { useEffect, useRef, useState } from 'react';
import { problems } from './problems';
import Icon from './icons';
import { usePracticeData } from './practice-data';
import CourseContent from './course-content';

const topics = ['All topics', ...new Set(problems.map(p => p.topic))];
const levels = ['Easy', 'Medium', 'Hard'];

export default function Home() {
  const { data, toggle } = usePracticeData();
  const [section, setSection] = useState('Problems');
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('All topics');
  const [level, setLevel] = useState('All difficulties');
  const [status, setStatus] = useState('Any status');
  const search = useRef(null);
  useEffect(() => {
    const focusSearch = event => {
      if (event.key === '/' && !event.target.matches('input, textarea, select')) {
        event.preventDefault();
        setSection('Problems');
        requestAnimationFrame(() => search.current?.focus());
      }
    };
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);
  function navigate(next) {
    setSection(next); setQuery(''); setLevel('All difficulties'); setTopic('All topics'); setStatus('Any status');
  }
  const isSolved = id => data.solved.includes(id);
  const attempted = id => id in data.drafts || Object.keys(data.programs[id] ?? {}).length > 0;
  const filtered = problems.filter(p => {
    const state = isSolved(p.id) ? 'Solved' : attempted(p.id) ? 'Attempted' : 'Unstarted';
    return (section !== 'Bookmarks' || data.saved.includes(p.id)) &&
      (topic === 'All topics' || p.topic === topic) &&
      (level === 'All difficulties' || p.level === level) &&
      (status === 'Any status' || state === status) &&
      (p.title + ' ' + p.topic).toLowerCase().includes(query.trim().toLowerCase());
  });
  const nextProblem = problems.find(p => !isSolved(p.id)) ?? problems[0];
  return <div className="shell">
    <aside className="sidebar">
      <button className="brand" onClick={() => navigate('Problems')}><img className="brand-icon" src="/algolab-mark.svg" alt="" width={36} height={36} /><span className="wordmark">Algo<span>Lab</span></span></button>
      <div className="nav-label">WORKSPACE</div>
      <nav aria-label="Workspace">
        {[['Problems', 'grid'], ['Bookmarks', 'bookmark'], ['Progress', 'chart'], ['Course Content', 'book']].map(([name, icon]) => <button key={name} className={section === name ? 'nav active' : 'nav'} aria-current={section === name ? 'page' : undefined} onClick={() => navigate(name)}><Icon name={icon} />{name}</button>)}
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
            <a className="primary" href={'/problems/' + nextProblem.id + '/'}><Icon name="play" size={15} /> {attempted(nextProblem.id) ? 'Continue practice' : 'Start practicing'}</a>
          </div>
          <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit orbit-three"/><i className="star s1"/><i className="star s2"/><i className="star s3"/><i className="star s4"/><div className="code-tile"><Icon name="logo" size={63} /></div><div className="code-chip chip-one">{'{ }'}</div><div className="code-chip chip-two">{'[ ]'}</div></div>
        </section>}
        {(section === 'Problems' || section === 'Progress') && <div className="stats">
          {[[problems.length, 'Total problems', 'layers', 'purple'], [data.solved.length, 'Solved', 'check', 'green'], [data.saved.length, 'Bookmarked', 'bookmark', 'orange']].map(([number, name, icon, color]) => <div className="stat" key={name}><div className={'stat-icon ' + color}><Icon name={icon} size={20} /></div><div><strong>{number}</strong><span>{name}</span></div></div>)}
        </div>}
        {section === 'Course Content' ? <CourseContent /> : section === 'Progress' ? <section className="progress-view"><h1>Your progress</h1><p>{data.solved.length} of {problems.length} problems solved</p>{levels.map(item => {
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
              <td><span className={'status-icon ' + (isSolved(p.id) ? 'solved' : attempted(p.id) ? 'attempted' : '')} role="img" aria-label={isSolved(p.id) ? 'Solved' : attempted(p.id) ? 'Attempted' : 'Unstarted'}>{isSolved(p.id) && <Icon name="check" size={14} />}</span></td>
              <td><a className="problem-link" href={'/problems/' + p.id + '/'}><span>{String(p.id).padStart(2, '0')}</span>{p.title}</a></td>
              <td><span className={'level ' + p.level.toLowerCase()}>{p.level}</span></td><td><span className="topic-label">{p.topic}</span></td>
              <td><button className={'icon-button save ' + (data.saved.includes(p.id) ? 'saved' : '')} aria-label={(data.saved.includes(p.id) ? 'Remove bookmark for ' : 'Bookmark ') + p.title} aria-pressed={data.saved.includes(p.id)} onClick={() => toggle(p.id)}><Icon name="bookmark" size={17} /></button></td>
            </tr>)}
            {filtered.length === 0 && <tr><td colSpan={5} className="empty">{section === 'Bookmarks' && !data.saved.length ? 'Bookmark a problem to find it here.' : 'No problems match these filters.'}</td></tr>}
          </tbody></table></div>
        </section>}
      </main>
    </div>
  </div>;
}
