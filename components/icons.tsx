type IconProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size, height: size, viewBox: '0 0 24 24',
  fill: 'none' as const, 'aria-hidden': true as const,
});

export const SearchIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" />
  </svg>
);

export const ThemeIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" /><path d="M12 3v1.5" /><path d="M12 19.5V21" /><path d="M4.9 4.9l1.1 1.1" />
    <path d="M18 18l1.1 1.1" /><path d="M3 12h1.5" /><path d="M19.5 12H21" /><path d="M6 18l-1.1 1.1" /><path d="M19.1 4.9L18 6" />
  </svg>
);

export const PlusIcon = ({ size = 14, className }: IconProps) => (
  <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={2.6} strokeLinecap="round">
    <path d="M12 5v14" /><path d="M5 12h14" />
  </svg>
);

export const PlayIcon = ({ size = 13, className }: IconProps) => (
  <svg {...base(size)} className={className} fill="currentColor"><path d="M7 4.5v15l13-7.5z" /></svg>
);

export const PauseIcon = ({ size = 13, className }: IconProps) => (
  <svg {...base(size)} className={className} fill="currentColor">
    <rect x="6" y="4.5" width="4" height="15" rx="1.2" /><rect x="14" y="4.5" width="4" height="15" rx="1.2" />
  </svg>
);

export const MetronomeIcon = ({ size = 13, className }: IconProps) => (
  <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={1.9} strokeLinejoin="round">
    <path d="M9 3h6l4 18H5L9 3Z" /><path d="m12 18 4-11" />
  </svg>
);

export const SoundOnIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M16 9a4 4 0 0 1 0 6" /><path d="M19 6.5a8 8 0 0 1 0 11" />
  </svg>
);

export const SoundOffIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="m17 9 4 6" /><path d="m21 9-4 6" />
  </svg>
);

export const FocusIcon = ({ size = 14, className }: IconProps) => (
  <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9V5a2 2 0 0 1 2-2h4" /><path d="M15 3h4a2 2 0 0 1 2 2v4" />
    <path d="M21 15v4a2 2 0 0 1-2 2h-4" /><path d="M9 21H5a2 2 0 0 1-2-2v-4" />
  </svg>
);

export const ChevronLeftIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);
