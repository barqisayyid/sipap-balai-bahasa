export function HeroKalender() {
  const baris = [77, 94, 111];
  const kolom = [56, 75, 94];

  return (
    <svg
      className="h-full w-full"
      fill="none"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient
          id="calBg"
          gradientUnits="userSpaceOnUse"
          x1="40"
          x2="140"
          y1="35"
          y2="155"
        >
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#eaf2ed" />
        </linearGradient>
        <linearGradient
          id="headerGreen"
          gradientUnits="userSpaceOnUse"
          x1="40"
          x2="135"
          y1="36"
          y2="70"
        >
          <stop offset="0%" stopColor="#239459" />
          <stop offset="100%" stopColor="#146d3e" />
        </linearGradient>
        <linearGradient id="ringGreen" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#197a48" />
          <stop offset="100%" stopColor="#0a4626" />
        </linearGradient>
        <linearGradient
          id="clockOuter"
          gradientUnits="userSpaceOnUse"
          x1="100"
          x2="165"
          y1="90"
          y2="165"
        >
          <stop offset="0%" stopColor="#1e8954" />
          <stop offset="100%" stopColor="#0f5c35" />
        </linearGradient>
        <filter id="shadowBlur" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="8" floodOpacity="0.12" stdDeviation="6" />
        </filter>
      </defs>

      <ellipse
        cx="96"
        cy="158"
        fill="#1b4d35"
        fillOpacity="0.14"
        rx="64"
        ry="12"
      />

      {/* Kalender */}
      <g filter="url(#shadowBlur)">
        <rect
          fill="url(#calBg)"
          height="104"
          rx="20"
          width="94"
          x="42"
          y="38"
        />
        <path
          d="M42 56C42 46.0589 50.0589 38 60 38H118C127.941 38 136 46.0589 136 56V66H42V56Z"
          fill="url(#headerGreen)"
        />
        <rect
          fill="url(#ringGreen)"
          height="22"
          rx="4"
          width="8"
          x="62"
          y="28"
        />
        <rect
          fill="#5ac08c"
          height="10"
          opacity="0.6"
          rx="1.5"
          width="3"
          x="63.5"
          y="29"
        />
        <rect
          fill="url(#ringGreen)"
          height="22"
          rx="4"
          width="8"
          x="108"
          y="28"
        />
        <rect
          fill="#5ac08c"
          height="10"
          opacity="0.6"
          rx="1.5"
          width="3"
          x="109.5"
          y="29"
        />
        {baris.flatMap((y) =>
          kolom.map((x) => (
            <rect
              key={`${x}-${y}`}
              fill="#a8d5be"
              height="11"
              rx="3.5"
              width="13"
              x={x}
              y={y}
            />
          )),
        )}
      </g>

      {/* Jam */}
      <g filter="url(#shadowBlur)">
        <ellipse
          cx="132"
          cy="156"
          fill="#1b4d35"
          fillOpacity="0.22"
          rx="24"
          ry="7"
        />
        <circle cx="132" cy="126" fill="url(#clockOuter)" r="32" />
        <circle
          cx="132"
          cy="126"
          r="31"
          stroke="#ffffff"
          strokeOpacity="0.15"
          strokeWidth="1.5"
        />
        <circle cx="132" cy="126" fill="#ffffff" r="23" />
        <path
          d="M132 126V114"
          stroke="#166534"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <path
          d="M132 126L142 133"
          stroke="#166534"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <circle cx="132" cy="126" fill="#14532d" r="2.2" />
      </g>
    </svg>
  );
}
