type IconProps = { className?: string }

export function BrandIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7.5h8.5A3.5 3.5 0 0 1 19 11v1M17 9.5l2 2 2-2M17 16.5H8.5A3.5 3.5 0 0 1 5 13v-1M7 14.5l-2-2-2 2" /></svg>
}

export function SearchIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
}

export function HeartIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 6.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z" /></svg>
}

export function SunIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
}

export function MoonIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.4A8.5 8.5 0 0 1 9.6 3.5a8.5 8.5 0 1 0 10.9 10.9Z" /></svg>
}

export function MenuIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
}

export function HomeIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8M5.5 9.5V21h13V9.5M9.5 21v-6h5v6" /></svg>
}

export function GridIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>
}

export function ChevronIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
}

export function CategoryIcon({ category, className }: IconProps & { category: string }) {
  if (category === 'PDF') return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7zM14 3v5h4M9.5 13h5M9.5 17h5" /></svg>
  if (category === 'Documents') return <FileIcon className={className} />
  if (category === 'Spreadsheets') return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M4 9h16M10 9v12M10 14h10" /></svg>
  if (category === 'Images') return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m5 18 5-5 3 3 2-2 4 4" /></svg>
  if (category === 'OCR') return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8V4h4m8 0h4v4m0 8v4h-4M8 20H4v-4M8 9h8M8 13h8M8 17h5" /></svg>
  return <GridIcon className={className} />
}

export function UploadIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14.5v3A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5v-3" /></svg>
}

export function FileIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Z" /><path d="M14 2v5h5M9 13h6M9 17h4" /></svg>
}

export function CheckIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="m6.5 12.5 3.5 3.5 7.5-8" /></svg>
}

export function DownloadIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M5 20h14" /></svg>
}

export function LockIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3M6 10h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Zm6 4v4" /></svg>
}

export function CodeIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M14 4l-4 16" /></svg>
}

export function TerminalIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m7 9 3 3-3 3M13 15h4" /></svg>
}

export function CopyIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
}

export function ExternalLinkIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M19 5l-9 9M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></svg>
}

export function PlusIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
}

export function CloseIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
}

export function TrashIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6" /></svg>
}

export function KeyIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><circle cx="8.5" cy="15.5" r="4.5" /><path d="m12 12 8-8m-3 3 3 3m-6 0 2 2" /></svg>
}

export function LogoutIcon({ className }: IconProps) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4M14 8l4 4-4 4M9 12h9" /></svg>
}
