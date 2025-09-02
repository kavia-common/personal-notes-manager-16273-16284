import React from 'react';

/**
 * AssistantMessage - A reusable assistant/help message card component that follows the new design style guide.
 * Renders a header, an alert row, a "Please:" label, a bulleted list, and further paragraphs.
 *
 * Props:
 * - headerText: string - label above the card (e.g., "KaviaAI")
 * - alertContent: React.ReactNode - content for the alert block; can include <b> for emphasis
 * - bullets: string[] - bullet items
 * - paragraphs: string[] - body paragraphs below bullets
 * - showAlertBg: boolean (default: true) - whether to show subtle amber alert background
 *
 * Accessibility:
 * - The alert block is rendered with role="alert" and descriptive text for screen readers.
 */

// PUBLIC_INTERFACE
export default function AssistantMessage({
  headerText = 'KaviaAI',
  alertContent,
  bullets = [],
  paragraphs = [],
  showAlertBg = true,
}) {
  return (
    <section className="assistant-msg" aria-label="Assistant message">
      <div className="assistant-msg__header">{headerText}</div>
      <div className="assistant-msg__card" role="group" aria-label="Assistant message content">
        <div
          className={
            'assistant-msg__alert' + (showAlertBg ? '' : ' assistant-msg__alert--no-bg')
          }
          role="alert"
          aria-live="polite"
        >
          <SparkIcon className="assistant-msg__icon" aria-hidden="true" />
          <div className="assistant-msg__alert-text">{alertContent}</div>
        </div>

        <div className="assistant-msg__label">Please:</div>
        <ul className="assistant-msg__list">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>

        {paragraphs.map((p, i) => (
          <p key={i} className="assistant-msg__para">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

function SparkIcon(props) {
  // Simple spark/asterisk/star icon, 1.5px stroke, 16x16, color via currentColor.
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 3l1.6 3.8L18 8.5l-3.5 1.6L12 14l-1.6-3.9L7 8.5l4.4-1.7L12 3z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path d="M12 15v6M6 12H3M21 12h-3M12 3v0" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
