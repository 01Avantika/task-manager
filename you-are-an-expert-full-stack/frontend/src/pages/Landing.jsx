import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const features = [
  ['Project management', 'Plan initiatives, ownership, and team scope in one place.'],
  ['Kanban task tracking', 'Move work from pending to done with a clear board view.'],
  ['Team collaboration', 'Discuss tasks with comments and visible accountability.'],
  ['Analytics dashboard', 'Understand workload, progress, and completion trends.'],
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

function MotionLink({ to, className, children }) {
  return (
    <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link to={to} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}

function ProductPreview() {
  return (
    <motion.div
      className="product-preview"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.15, ease: 'easeOut' }}
    >
      <div className="preview-topbar">
        <span />
        <span />
        <span />
      </div>
      <div className="preview-dashboard">
        <div className="preview-metrics">
          <article><span>Total tasks</span><strong>128</strong></article>
          <article><span>Completed</span><strong>74%</strong></article>
          <article><span>Projects</span><strong>12</strong></article>
        </div>
        <div className="preview-graph-card">
          <div>
            <strong>Tasks per project</strong>
            <span>Live workload distribution</span>
          </div>
          <svg viewBox="0 0 520 210" role="img" aria-label="Preview bar chart">
            <line x1="20" y1="180" x2="500" y2="180" />
            {[92, 138, 72, 160, 118, 150].map((height, index) => (
              <rect
                key={height}
                x={48 + index * 75}
                y={180 - height}
                width="42"
                height={height}
                rx="8"
                className={index % 3 === 1 ? 'accent' : index % 3 === 2 ? 'success' : ''}
              />
            ))}
            <polyline points="48,128 123,82 198,132 273,60 348,102 423,72" />
          </svg>
        </div>
        <div className="preview-bottom-grid">
          <div className="preview-list">
            <strong>Active projects</strong>
            <span><i /> Product Launch <b>82%</b></span>
            <span><i /> Customer Portal <b>61%</b></span>
            <span><i /> Analytics Upgrade <b>44%</b></span>
          </div>
          <div className="preview-donut">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="44" />
              <circle cx="60" cy="60" r="44" />
            </svg>
            <strong>74%</strong>
            <span>complete</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <Link to="/" className="landing-brand">TaskFlow</Link>
        <div>
          <MotionLink to="/login" className="btn ghost">Login</MotionLink>
          <MotionLink to="/signup" className="btn primary">Get Started</MotionLink>
        </div>
      </header>

      <section className="hero hero-polished">
        <motion.div
          className="hero-copy"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <span className="eyebrow">Modern team operations</span>
          <h1>Organize projects with clarity.</h1>
          <p>Track work, collaborate on tasks, and understand progress from one calm team workspace.</p>
          <div className="hero-actions">
            <MotionLink to="/signup" className="btn primary large">Get Started</MotionLink>
            <MotionLink to="/login" className="btn surface large">Login</MotionLink>
          </div>
        </motion.div>
        <ProductPreview />
      </section>

      <motion.section className="landing-section" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={fadeUp} transition={{ duration: 0.45 }}>
        <div className="section-head centered">
          <h2>Built for teams that need steady execution</h2>
          <p>Structured planning, fast task updates, team context, and simple reporting in one workspace.</p>
        </div>
        <div className="feature-grid">
          {features.map(([feature, copy]) => (
            <article className="feature-card" key={feature}>
              <span className="feature-dot" />
              <h3>{feature}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </motion.section>

      <motion.section className="preview-section professional-preview" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={fadeUp} transition={{ duration: 0.45 }}>
        <div className="preview-card wide">
          <div className="preview-card-header">
            <strong>Board view</strong>
            <span>Clean task flow from pending to done</span>
          </div>
          <div className="preview-kanban">
            {['Pending', 'In progress', 'Done'].map((column, index) => (
              <div key={column}>
                <strong>{column}</strong>
                <span />
                <span className={index === 1 ? 'active' : ''} />
                <span />
              </div>
            ))}
          </div>
        </div>
        <div className="preview-card analytics-preview-card">
          <div className="preview-card-header">
            <strong>Analytics</strong>
            <span>Status at a glance</span>
          </div>
          <svg viewBox="0 0 240 180" role="img" aria-label="Preview analytics chart">
            <rect x="24" y="78" width="34" height="76" rx="7" />
            <rect x="76" y="44" width="34" height="110" rx="7" />
            <rect x="128" y="64" width="34" height="90" rx="7" />
            <rect x="180" y="28" width="34" height="126" rx="7" />
            <path d="M24 54 C72 18 110 88 148 48 S204 42 220 24" />
          </svg>
        </div>
      </motion.section>

      <motion.section className="cta-band" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={fadeUp} transition={{ duration: 0.45 }}>
        <h2>Bring your projects into focus.</h2>
        <MotionLink to="/signup" className="btn primary large">Start free</MotionLink>
      </motion.section>
      <footer className="landing-footer">TaskFlow (c) 2026. Built for calm, capable teams.</footer>
    </div>
  );
}
