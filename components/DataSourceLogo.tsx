"use client";

import { useState } from "react";

interface DataSourceLogoProps {
  name: string;
  description: string;
  href: string;
  favicon: string;
  initials: string;
  color: string;
}

export default function DataSourceLogo({
  name,
  description,
  href,
  favicon,
  initials,
  color,
}: DataSourceLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={`${name} — ${description}`}
      className="group relative w-7 h-7 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] flex items-center justify-center hover:border-[var(--orange)]/40 transition-all duration-200 overflow-visible"
    >
      {!imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={favicon}
          alt={name}
          width={14}
          height={14}
          className="w-3.5 h-3.5 object-contain"
          onError={() => setImgFailed(true)}
        />
      ) : (
        // Colored initials fallback
        <span
          className="w-full h-full flex items-center justify-center rounded-lg text-white font-bold"
          style={{ fontSize: 7, background: color }}
        >
          {initials}
        </span>
      )}

      {/* Hover tooltip */}
      <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded-md bg-[var(--bg-card)] border border-[var(--border)] text-[10px] text-[var(--text-secondary)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
        {name}
      </span>
    </a>
  );
}
