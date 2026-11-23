import { useState } from 'react';

/**
 * QuestionCard: Modern, spacious MCQ card with large readable text,
 * interactive self-testing, and expandable step-by-step explanation.
 */
export default function QuestionCard({ question, index }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const isCorrect = selectedOption === question.correctOption;

  return (
    <article className="pioneer-q-card" id={`q-${question.id}`}>
      {/* Question Header */}
      <div className="pioneer-q-header">
        <div className="pioneer-q-meta">
          <span className="pioneer-q-index">Q{question.qNumber || index + 1}.</span>
          {question.difficulty && (
            <span className={`pioneer-diff-badge ${question.difficulty.toLowerCase()}`}>
              {question.difficulty}
            </span>
          )}
        </div>

        <button
          type="button"
          className={`pioneer-bookmark-btn ${bookmarked ? 'active' : ''}`}
          onClick={() => setBookmarked(!bookmarked)}
          title={bookmarked ? 'Remove bookmark' : 'Bookmark this question'}
        >
          {bookmarked ? 'Saved' : 'Bookmark'}
        </button>
      </div>

      {/* Question Body with comfortable large text */}
      <div className="pioneer-q-body">
        <p className="pioneer-q-text">{question.questionText}</p>
      </div>

      {/* Options Grid */}
      <div className="pioneer-options-list">
        {question.options.map((option, optIdx) => {
          const letter = optionLetters[optIdx] || optIdx + 1;
          const isThisSelected = selectedOption === optIdx;
          const isThisAnswer = question.correctOption === optIdx;

          let optionClass = 'pioneer-option-item';
          if (isThisSelected) optionClass += ' selected';
          if (showAnswer) {
            if (isThisAnswer) optionClass += ' correct';
            else if (isThisSelected && !isCorrect) optionClass += ' wrong';
          }

          return (
            <div
              key={optIdx}
              className={optionClass}
              onClick={() => setSelectedOption(optIdx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setSelectedOption(optIdx);
              }}
            >
              <div className="pioneer-opt-left">
                <span className="pioneer-opt-indicator">{letter}</span>
                <span className="pioneer-opt-label">{option}</span>
              </div>
              {showAnswer && isThisAnswer && (
                <span className="pioneer-answer-pill">Correct Answer</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Card Action Footer */}
      <div className="pioneer-q-footer">
        <button
          type="button"
          className={`pioneer-btn-toggle-answer ${showAnswer ? 'active' : ''}`}
          onClick={() => setShowAnswer(!showAnswer)}
        >
          {showAnswer ? 'Hide Solution' : 'View Solution & Explanation'}
        </button>
      </div>

      {/* Expandable Step-by-Step Explanation */}
      {showAnswer && (
        <div className="pioneer-explanation-box">
          <div className="pioneer-exp-header">
            <span className="pioneer-exp-badge">
              Correct Option: <strong>{optionLetters[question.correctOption]}</strong>
            </span>
            <span className="pioneer-exp-hint">Step-by-step breakdown:</span>
          </div>

          <div className="pioneer-exp-content">
            <p className="pioneer-exp-text">{question.explanation}</p>
          </div>
        </div>
      )}
    </article>
  );
}
