/**
 * The three floating glass panels beside the portrait. Purely decorative —
 * they depict the kind of work described in the CV without asserting any
 * figures, so nothing here can be read as a fabricated metric.
 */

function Panel({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none rounded-2xl border border-white/70 bg-white/75 p-3 shadow-[0_16px_40px_-24px_rgba(28,20,60,0.55)] backdrop-blur-md ${className}`}
    >
      <p className="mb-2 font-display text-[8px] font-semibold uppercase tracking-[0.2em] text-accent-deep">
        {label}
      </p>
      {children}
    </div>
  );
}

export function RagPanel({ className = "" }: { className?: string }) {
  return (
    <Panel label="RAG Pipeline" className={className}>
      <svg viewBox="0 0 132 52" className="h-auto w-full">
        {["Query", "Embed", "Retrieve"].map((t, i) => (
          <g key={t}>
            <rect
              x={2 + i * 44}
              y={8}
              width={38}
              height={16}
              rx={5}
              fill={i === 2 ? "#8b73e4" : "#EFECFD"}
            />
            <text
              x={21 + i * 44}
              y={19}
              textAnchor="middle"
              fontSize="6.5"
              fontWeight="600"
              fill={i === 2 ? "#ffffff" : "#6d4fd0"}
            >
              {t}
            </text>
            {i < 2 && (
              <path
                d={`M${40 + i * 44} 16h4`}
                stroke="#C9BEF7"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            )}
          </g>
        ))}
        <rect x="2" y="32" width="128" height="6" rx="3" fill="#F1EEFD" />
        <rect x="2" y="32" width="86" height="6" rx="3" fill="#A896EE" />
        <rect x="2" y="42" width="128" height="6" rx="3" fill="#F1EEFD" />
        <rect x="2" y="42" width="54" height="6" rx="3" fill="#CFC4F6" />
      </svg>
    </Panel>
  );
}

export function ObservabilityPanel({ className = "" }: { className?: string }) {
  return (
    <Panel label="Observability" className={className}>
      <svg viewBox="0 0 132 44" className="h-auto w-full">
        <defs>
          <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b73e4" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8b73e4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M2 34 L18 26 L32 30 L46 16 L62 22 L78 10 L94 18 L110 8 L130 14"
          fill="none"
          stroke="#7c5ce0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 34 L18 26 L32 30 L46 16 L62 22 L78 10 L94 18 L110 8 L130 14 L130 42 L2 42 Z"
          fill="url(#spark)"
        />
        <circle cx="110" cy="8" r="3" fill="#6d4fd0" />
      </svg>
    </Panel>
  );
}

export function PipelinePanel({ className = "" }: { className?: string }) {
  const stages = ["Build", "Test", "Deploy"];
  return (
    <Panel label="CI / CD" className={className}>
      <div className="space-y-1.5">
        {stages.map((s, i) => (
          <div key={s} className="flex items-center justify-between gap-3">
            <span className="font-display text-[9px] font-medium text-body">
              {s}
            </span>
            <span
              className={`flex h-3 w-3 items-center justify-center rounded-full ${
                i < 3 ? "bg-accent" : "bg-line"
              }`}
            >
              <svg viewBox="0 0 10 10" width="6" height="6">
                <path
                  d="M2 5.2l2 2 4-4"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
