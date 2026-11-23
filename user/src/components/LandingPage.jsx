import React from 'react';

/**
 * LandingPage: Minimal, spacious, appealing front page for Pioneer.
 * Focuses on clarity, large readable typography, zero clutter,
 * and instant one-click jump into practice topics.
 */
export default function LandingPage({ categories = [], onExploreTopic, onStartPractice, onOpenNotes, onGoToAdmin }) {
  const totalQuestions = categories.reduce(
    (sum, cat) => sum + cat.topics.reduce((qSum, t) => qSum + (t.questions?.length || 0), 0),
    0
  );

  const totalTopics = categories.reduce((sum, cat) => sum + cat.topics.length, 0);

  return (
    <div className="pioneer-landing">
      {/* 1. Hero Section */}
      <section className="pioneer-hero">
        {/* <div className="pioneer-hero-badge">
          <span className="pioneer-pulse-dot"></span>
          <span>Open Knowledge & Practice Platform</span>
        </div> */}

        <h1 className="pioneer-hero-title">
          Master Concepts.<br />
          <span className="pioneer-gradient-text">Practice Without Distraction.</span>
        </h1>

        <p className="pioneer-hero-subtitle">
          Clean, high-yield practice questions with step-by-step explanations and verified PDF study sheets.
          No signups, no clutter, no paywalls. Just read, practice, and learn.
        </p>

        <div className="pioneer-hero-cta-group">
          <button
            type="button"
            className="pioneer-btn-hero-primary"
            onClick={onStartPractice}
          >
            Start Practicing Now →
          </button>
          <button
            type="button"
            className="pioneer-btn-hero-secondary"
            onClick={onOpenNotes}
          >
             Browse Study PDFs
          </button>
        </div>

        {/* Minimal Live Stats */}
        <div className="pioneer-hero-stats">
          <div className="pioneer-stat-item">
            <span className="pioneer-stat-num">{totalTopics}+</span>
            <span className="pioneer-stat-label">Core Topics</span>
          </div>
          <div className="pioneer-stat-sep">/</div>
          <div className="pioneer-stat-item">
            <span className="pioneer-stat-num">{totalQuestions}+</span>
            <span className="pioneer-stat-label">Practice Questions</span>
          </div>
          <div className="pioneer-stat-sep">/</div>
          <div className="pioneer-stat-item">
            <span className="pioneer-stat-num">100%</span>
            <span className="pioneer-stat-label">Free & Instant</span>
          </div>
        </div>
      </section>

      {/* 2. Topics & Categories Quick Directory */}
      <section className="pioneer-categories-section">
        <div className="pioneer-section-header">
          <span className="pioneer-eyebrow">CURATED TRACKS</span>
          <h2 className="pioneer-section-title">Explore Topics by Subject</h2>
          <p className="pioneer-section-desc">
            Select any module below to dive straight into practice questions and comprehensive formula notes.
          </p>
        </div>

        <div className="pioneer-category-grid">
          {categories.map((cat, idx) => {
            const catQuestions = cat.topics.reduce(
              (qSum, t) => qSum + (t.questions?.length || 0),
              0
            );
            const firstTopic = cat.topics[0];

            return (
              <div
                key={cat.category || idx}
                className="pioneer-cat-card"
                onClick={() => onExploreTopic(firstTopic, cat.category)}
                role="button"
                tabIndex={0}
              >
                <div className="pioneer-cat-top">
                  <span className="pioneer-cat-qcount">{catQuestions} Questions</span>
                </div>

                <h3 className="pioneer-cat-title">{cat.category}</h3>

                <div className="pioneer-cat-topics-list">
                  {cat.topics.slice(0, 3).map((topic) => (
                    <span
                      key={topic.id}
                      className="pioneer-topic-pill"
                      onClick={(e) => {
                        e.stopPropagation();
                        onExploreTopic(topic, cat.category);
                      }}
                    >
                      {topic.title}
                    </span>
                  ))}
                  {cat.topics.length > 3 && (
                    <span className="pioneer-topic-pill more">
                      +{cat.topics.length - 3} more
                    </span>
                  )}
                </div>

                <div className="pioneer-cat-footer">
                  <span className="pioneer-cat-explore-link">
                    Open Track →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Why Pioneer / Experience Section */}
      <section className="pioneer-features-section">
        <div className="pioneer-section-header">
          <span className="pioneer-eyebrow">SIMPLE ARCHITECTURE</span>
          <h2 className="pioneer-section-title">Built for Pure Focus</h2>
        </div>

        <div className="pioneer-features-grid">
          <div className="pioneer-feature-box">
            <h3>No Congestion, Bigger Text</h3>
            <p>
              Generous whitespace and large readable typography engineered for long problem-solving sessions without eye strain.
            </p>
          </div>

          <div className="pioneer-feature-box">
            <h3>Instant Explanations</h3>
            <p>
              Reveal detailed formulas, steps, and shortcuts with one click. Test yourself first, then review the methodology.
            </p>
          </div>

          <div className="pioneer-feature-box">
            <h3>Attached PDF Reference Sheets</h3>
            <p>
              Every topic supports high-resolution PDF notes, formula summaries, and cheat sheets embedded right beside the questions.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Minimal Footer */}
      <footer className="pioneer-landing-footer">
        <div className="pioneer-footer-inner">
          <div className="pioneer-footer-brand">
            <span className="pioneer-logo-sm">P</span>
            <strong>Pioneer</strong>
            <span className="pioneer-footer-tagline">Open Practice Base</span>
          </div>

          <div className="pioneer-footer-links">
            <button type="button" onClick={onStartPractice} className="pioneer-footer-btn">
              Practice Questions
            </button>
            <button type="button" onClick={onOpenNotes} className="pioneer-footer-btn">
              Study Notes & PDFs
            </button>
            <button type="button" onClick={onGoToAdmin} className="pioneer-footer-btn pioneer-footer-admin">
              Admin Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
