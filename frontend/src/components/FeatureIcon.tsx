interface FeatureIconProps {
  name: 'quran' | 'prayer';
  className?: string;
}

export function FeatureIcon({ name, className }: FeatureIconProps) {
  if (name === 'quran') {
    return (
      <svg
        aria-hidden="true"
        className={className}
        fill="none"
        viewBox="0 0 32 32"
      >
        <path d="M16 8.5c-3.2-2.1-7-2.2-11-.8v16.5c4-.9 7.8-.5 11 1.7m0-17.4c3.2-2.1 7-2.2 11-.8v16.5c-4-.9-7.8-.5-11 1.7m0-17.4v17.4" />
        <path d="M8.5 12.2c1.7-.3 3.4-.1 5 .6m-5 3c1.7-.3 3.4-.1 5 .6m5.5-3.6c1.7-.7 3.4-.9 5-.6m-5 3.6c1.7-.7 3.4-.9 5-.6" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 32 32"
    >
      <path d="M5.5 25.5h21m-18.5 0V15.2h16v10.3M8 15.2l8-6.7 8 6.7m-12.5 0v-3.4m9 3.4v-3.4M16 4v2m-2 16v-4m4 4v-4" />
      <path d="M13.5 25.5v-3a2.5 2.5 0 0 1 5 0v3" />
    </svg>
  );
}
