import { useState, useEffect, useMemo } from 'react';

/**
 * CoursePage — Dedicated detail page for a single course/category.
 * Inspired by ZTM-style course landing pages.
 *
 * Shows:
 * - Back link to all courses
 * - Course title, description, stats (topics, questions, materials)
 * - Instructor / last-updated info
 * - Company hiring banner
 * - Sticky sidebar with membership/enrollment card
 * - Tab navigation: Overview, Curriculum, FAQs
 * - "What you'll learn" grid with checkmarks
 * - Curriculum accordion (expandable topics)
 */
export default function CoursePage({ category, onBack, onStartTopic }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedTopics, setExpandedTopics] = useState({});

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!category) return null;

  const topics = category.topics || [];
  const totalQuestions = topics.reduce((sum, t) => sum + (t.questions?.length || 0), 0);
  const totalMaterials = topics.reduce((sum, t) => sum + (t.materials?.length || 0), 0);

  // Generate "What you'll learn" points from topic summaries
  const learningPoints = topics
    .filter((t) => t.summary)
    .map((t) => t.summary)
    .slice(0, 6);

  // If fewer than 4 points, add generic ones
  const genericPoints = [
    `Master all ${topics.length} core topics with hands-on practice questions`,
    'Build strong problem-solving skills through detailed step-by-step explanations',
    'Access curated PDF study materials and formula sheets',
    'Prepare confidently for competitive exams and placements',
    'Track your progress across difficulty levels — Easy, Medium, Hard',
    'Learn at your own pace with instant answer verification'
  ];

  const allLearningPoints =
    learningPoints.length >= 4
      ? learningPoints
      : [...learningPoints, ...genericPoints].slice(0, 6);

  const toggleTopic = (topicId) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'faqs', label: 'FAQs' }
  ];

  // Simple FAQ data
  const faqs = [
    {
      q: 'Who is this course for?',
      a: `This track is designed for anyone who wants to master ${category.category}. Whether you are a beginner or someone brushing up for exams and placements, the structured questions and explanations will help you build confidence.`
    },
    {
      q: 'Are the study materials free?',
      a: 'Yes! All practice questions, explanations, and attached PDF study materials are 100% free and available instantly. No signup required.'
    },
    {
      q: 'How often is the content updated?',
      a: 'Our content is continuously updated by educators and contributors. New questions, topics, and reference PDFs are added regularly.'
    },
    {
      q: 'Can I practice offline?',
      a: 'Currently, Pioneer is a web-based platform. However, you can download attached PDF study sheets for offline review.'
    }
  ];

  const [openFaq, setOpenFaq] = useState(null);

  const companies = ['Google', 'IBM', 'Tesla', 'Apple', 'Uber', 'Amazon', 'Microsoft', 'Infosys'];

  return (
    <div className="cp-root">
      {/* Top: Back link */}
      <div className="cp-container">
        <button type="button" className="cp-back-link" onClick={onBack}>
          ‹ SEE ALL COURSES
        </button>
      </div>

      {/* Hero Section */}
      <div className="cp-hero-section">
        <div className="cp-container cp-hero-grid">
          {/* Left: Course info */}
          <div className="cp-hero-left">
            <h1 className="cp-hero-title">{category.category}</h1>
            <p className="cp-hero-desc">
              Comprehensive practice track covering {topics.length} core topics with {totalQuestions}+ carefully curated
              questions, step-by-step explanations, and {totalMaterials > 0 ? `${totalMaterials} attached study PDFs` : 'reference materials'}.
              Go from fundamentals to advanced problem-solving.
            </p>

            {/* Stats pills */}
            <div className="cp-stats-row">
              <span className="cp-stat-pill">
                {topics.length} Topics
              </span>
              <span className="cp-stat-pill">
                {totalQuestions}+ Questions
              </span>
              {totalMaterials > 0 && (
                <span className="cp-stat-pill">
                  {totalMaterials} PDFs
                </span>
              )}
            </div>

            {/* Rating + Meta */}
            <div className="cp-meta-row">
              <div className="cp-rating">
                <span className="cp-rating-label">Excellent</span>
                <span className="cp-rating-score">4.9 out of 5</span>
              </div>
              <span className="cp-meta-sep">|</span>
              <span className="cp-meta-info">
                Taught by: <strong>Pioneer Educators</strong>
              </span>
              <span className="cp-meta-sep">|</span>
              <span className="cp-meta-info">
                📅 Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Average time */}
            <div className="cp-time-block">
              <div className="cp-time-num">
                <span className="cp-time-digit">{Math.max(5, topics.length * 3)}</span>
              </div>
              <div className="cp-time-text">
                <strong>Days</strong>
                <span>Average time students take to complete this track.</span>
              </div>
            </div>
          </div>

          {/* Right: Course thumbnail / play button */}
          <div className="cp-hero-right">
            <div className="cp-thumbnail">
              <div className="cp-thumb-title">{category.category}</div>
              <button type="button" className="cp-play-btn" onClick={() => onStartTopic(topics[0])}>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Company Hiring Banner */}
      <div className="cp-companies-section">
        <div className="cp-container">
          <p className="cp-companies-text">
            <strong>Our students are getting hired at these companies. We can help you too.</strong>
          </p>
          <div className="cp-companies-logos">
            {companies.map((name) => (
              <span key={name} className="cp-company-logo">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content + Sidebar Layout */}
      <div className="cp-container cp-main-grid">
        {/* Left: Tabs + Content */}
        <div className="cp-main-content">
          {/* Tab Navigation */}
          <nav className="cp-tab-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`cp-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="cp-tab-content">
              {/* What you'll learn */}
              <section className="cp-learn-section">
                <h2 className="cp-section-title">What you'll learn</h2>
                <div className="cp-learn-grid">
                  {allLearningPoints.map((point, idx) => (
                    <div key={idx} className="cp-learn-item">
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Course description */}
              <section className="cp-desc-section">
                <p className="cp-desc-text">
                  This {category.category} track covers all essential concepts, best practices, and problem-solving
                  techniques to build a strong foundation. Each topic includes carefully crafted questions with detailed
                  step-by-step explanations.
                </p>
                <p className="cp-desc-highlight">
                  That means you'll never have to spend time on confusing, out-of-date, or incomplete tutorials anymore.
                </p>
              </section>

              {/* Quick topic overview */}
              <section className="cp-topics-overview">
                <h2 className="cp-section-title">Topics in this Track</h2>
                <div className="cp-topics-grid">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="cp-topic-card"
                      onClick={() => onStartTopic(topic)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="cp-topic-card-top">
                        <h3>{topic.title}</h3>
                        <span className="cp-topic-q-badge">
                          {topic.questions?.length || 0} Q
                        </span>
                      </div>
                      {topic.summary && (
                        <p className="cp-topic-card-desc">{topic.summary}</p>
                      )}
                      <span className="cp-topic-start-link">Start Practicing →</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Curriculum Tab */}
          {activeTab === 'curriculum' && (
            <div className="cp-tab-content">
              <section className="cp-curriculum-section">
                <h2 className="cp-section-title">Course Curriculum</h2>
                <p className="cp-curriculum-summary">
                  {topics.length} topics • {totalQuestions} questions •{' '}
                  {totalMaterials} study materials
                </p>

                <div className="cp-curriculum-list">
                  {topics.map((topic, idx) => (
                    <div key={topic.id} className="cp-curriculum-item">
                      <button
                        type="button"
                        className="cp-curriculum-header"
                        onClick={() => toggleTopic(topic.id)}
                      >
                        <div className="cp-curr-left">
                          <span className="cp-curr-arrow">
                            {expandedTopics[topic.id] ? '▾' : '▸'}
                          </span>
                          <span className="cp-curr-num">{idx + 1}.</span>
                          <span className="cp-curr-title">{topic.title}</span>
                        </div>
                        <div className="cp-curr-right">
                          <span className="cp-curr-count">
                            {topic.questions?.length || 0} questions
                          </span>
                          {topic.materials?.length > 0 && (
                            <span className="cp-curr-mat-badge">
                              {topic.materials.length} PDF{topic.materials.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </button>

                      {expandedTopics[topic.id] && (
                        <div className="cp-curriculum-body">
                          {topic.summary && (
                            <p className="cp-curr-summary">{topic.summary}</p>
                          )}
                          <div className="cp-curr-actions">
                            <button
                              type="button"
                              className="cp-curr-start-btn"
                              onClick={() => onStartTopic(topic)}
                            >
                              Start Practice
                            </button>
                            {topic.materials?.length > 0 && (
                              <span className="cp-curr-mat-info">
                                {topic.materials.length} attached reference PDF{topic.materials.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          {/* Show question previews */}
                          {topic.questions?.length > 0 && (
                            <div className="cp-curr-questions-preview">
                              {topic.questions.slice(0, 3).map((q, qIdx) => (
                                <div key={q.id} className="cp-curr-q-row">
                                  <span className="cp-curr-q-text">
                                    Q{q.qNumber || qIdx + 1}: {q.questionText.length > 90
                                      ? q.questionText.substring(0, 90) + '…'
                                      : q.questionText}
                                  </span>
                                  {q.difficulty && (
                                    <span className={`cp-curr-q-diff ${q.difficulty.toLowerCase()}`}>
                                      {q.difficulty}
                                    </span>
                                  )}
                                </div>
                              ))}
                              {topic.questions.length > 3 && (
                                <div className="cp-curr-q-more">
                                  + {topic.questions.length - 3} more questions
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* FAQs Tab */}
          {activeTab === 'faqs' && (
            <div className="cp-tab-content">
              <section className="cp-faq-section">
                <h2 className="cp-section-title">Frequently Asked Questions</h2>
                <div className="cp-faq-list">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="cp-faq-item">
                      <button
                        type="button"
                        className={`cp-faq-question ${openFaq === idx ? 'open' : ''}`}
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      >
                        <span>{faq.q}</span>
                        <span className="cp-faq-toggle">{openFaq === idx ? '−' : '+'}</span>
                      </button>
                      {openFaq === idx && (
                        <div className="cp-faq-answer">
                          <p>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Right Sidebar: Sticky enrollment card */}
        <aside className="cp-sidebar">
          <div className="cp-sidebar-card">
            <h3 className="cp-sidebar-heading">Included in Pioneer</h3>
            <p className="cp-sidebar-desc">
              Get this track, plus <strong>{totalQuestions}+</strong> practice questions across all our curated courses — completely free.
            </p>

            <button
              type="button"
              className="cp-sidebar-cta"
              onClick={() => onStartTopic(topics[0])}
            >
              START LEARNING FREE
            </button>

            <p className="cp-sidebar-sub">Free forever • No signup required</p>

            <div className="cp-sidebar-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="cp-sidebar-secondary-cta"
              onClick={() => onStartTopic(topics[0])}
            >
              BROWSE STUDY MATERIALS
            </button>
            <p className="cp-sidebar-access">Full lifetime access</p>

            {/* Risk free badge */}
            <div className="cp-sidebar-badge">
              <div className="cp-badge-text">
                <strong>100% FREE & OPEN</strong>
                <span>Pioneer is completely free. No hidden costs, no paywalls, no distractions.</span>
              </div>
            </div>

            {/* Community badge */}
            <div className="cp-sidebar-badge">
              <div className="cp-badge-text">
                <span>
                  Join <strong>thousands of learners</strong> upskilling with Pioneer courses!
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
