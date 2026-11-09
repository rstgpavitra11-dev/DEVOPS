import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const API = '/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Connecting to API…');
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const response = await fetch(`${API}/tasks`);
      if (!response.ok) throw new Error('API unavailable');
      setTasks(await response.json());
      setStatus('All systems operational');
    } catch {
      setStatus('Could not reach the API. Check that the services are running.');
    }
  }

  useEffect(() => { refresh(); }, []);

  async function addTask(event) {
    event.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      const response = await fetch(`${API}/tasks`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title })
      });
      if (!response.ok) throw new Error('Request failed');
      setTitle('');
      await refresh();
    } catch {
      setStatus('Task could not be saved. Please try again.');
    } finally { setBusy(false); }
  }

  return <main className="shell">
    <header className="topbar"><a className="brand" href="#"><span className="brand-mark">✓</span> Shipshape</a><span className="env"><i /> LIVE DEMO</span></header>
    <section className="hero">
      <div className="eyebrow"><span className="eyebrow-line" /> JENKINS CI/CD SHOWCASE</div>
      <h1>From commit<br />to <em>done.</em></h1>
      <p className="intro">A tiny task board powered by a full-stack deployment pipeline. Push code, watch Jenkins work, ship with confidence.</p>
      <div className="pipeline" aria-label="Pipeline steps">
        {['Push', 'Build', 'Test', 'Deploy'].map((step, index) => <React.Fragment key={step}><div className="pipe-step"><span className={`pipe-icon ${index < 3 ? 'complete' : 'active'}`}>{['↥', '◈', '✓', '↗'][index]}</span><span>{step}</span></div>{index < 3 && <span className="pipe-link" />}</React.Fragment>)}
      </div>
    </section>
    <section className="board">
      <div className="board-head"><div><div className="section-kicker">YOUR WORKSPACE</div><h2>Task board <span>{tasks.length.toString().padStart(2, '0')}</span></h2></div><div className="pulse"><i /> {status}</div></div>
      <form className="task-form" onSubmit={addTask}><label className="sr-only" htmlFor="task-title">New task</label><span className="plus">+</span><input id="task-title" value={title} onChange={event => setTitle(event.target.value)} placeholder="What needs to get done?" maxLength="200" /><button disabled={busy || !title.trim()}>{busy ? 'Adding…' : 'Add task'} <span>↗</span></button></form>
      <div className="task-list">{tasks.length === 0 ? <div className="empty"><div className="empty-icon">✳</div><strong>Nothing on the board yet</strong><span>Add a task above to see your first item.</span></div> : tasks.map((task, index) => <article className="task" key={task.id}><span className="task-check">✓</span><span className="task-title">{task.title}</span><span className="task-id">TASK-{String(task.id).padStart(3, '0')}</span><span className="task-arrow">↗</span></article>)}</div>
      <footer className="board-foot"><span>Showing <b>{tasks.length}</b> {tasks.length === 1 ? 'task' : 'tasks'}</span><span>Persistent storage <b>PostgreSQL</b></span></footer>
    </section>
    <footer className="site-foot"><span>BUILT TO SHIP <b>✳</b></span><span>React <i>·</i> Express <i>·</i> PostgreSQL <i>·</i> Jenkins</span></footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);

