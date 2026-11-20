import React from 'react';

/* One line-icon family: 24px grid, 1.75 stroke, round caps and joins. */
const Line = ({ className, children, strokeWidth = 1.75 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const GlobeIcon = ({ className }) => (
  <Line className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c-2.8 3.2-2.8 14.8 0 18" />
    <path d="M12 3c2.8 3.2 2.8 14.8 0 18" />
  </Line>
);

export const TableIcon = ({ className }) => (
  <Line className={className}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" />
  </Line>
);

export const ExperiencesIcon = ({ className }) => (
  <Line className={className}>
    <path d="M15 9.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6.5L5.5 9.5" />
    <path d="M9 11a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v9l-3-2.5h-7a2 2 0 0 1-2-2z" />
  </Line>
);

export const ChatIcon = ({ className }) => (
  <Line className={className}>
    <path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l.9-4.4A8 8 0 1 1 20 12z" />
    <path d="M12 8.5l.9 1.9 1.9.9-1.9.9-.9 1.9-.9-1.9-1.9-.9 1.9-.9z" fill="currentColor" strokeWidth="1" />
  </Line>
);

export const SearchIcon = ({ className }) => (
  <Line className={className} strokeWidth={2}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.2-4.2" />
  </Line>
);

export const ClearIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" fill="currentColor" />
    <path d="M9 9l6 6M15 9l-6 6" stroke="rgb(var(--surface))" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

export const ChevronIcon = ({ className }) => (
  <Line className={className} strokeWidth={2}>
    <path d="M9 6l6 6-6 6" />
  </Line>
);

export const ExternalIcon = ({ className }) => (
  <Line className={className}>
    <path d="M14 4h6v6" />
    <path d="M20 4l-9 9" />
    <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
  </Line>
);

export const PhoneIcon = ({ className }) => (
  <Line className={className}>
    <path d="M5 4h3.5l1.5 4-2 1.2a11 11 0 0 0 6.8 6.8L16 14l4 1.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />
  </Line>
);

export const PinIcon = ({ className }) => (
  <Line className={className}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.3" />
  </Line>
);

export const BuildingIcon = ({ className }) => (
  <Line className={className}>
    <path d="M3 21h18" />
    <path d="M4 10h16" />
    <path d="M12 3l8 4.5H4z" />
    <path d="M6 10v8M10 10v8M14 10v8M18 10v8" />
  </Line>
);

export const PlaneIcon = ({ className }) => (
  <Line className={className}>
    <path d="M10.5 13.5L4 11l1.5-1.5 7 .5 4.2-4.2a2 2 0 0 1 2.9 2.8L15.4 12.8l.6 7-1.5 1.5-2.5-6.5" />
    <path d="M7 17l-2 2" />
  </Line>
);

export const TelegramIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.26.26-.51.26l.213-3.053 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
  </svg>
);
