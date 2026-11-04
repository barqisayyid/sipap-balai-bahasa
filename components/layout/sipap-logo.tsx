interface SipapLogoProps {
  className?: string;
  variant?: "symbol" | "symbol-small" | "horizontal" | "stacked";
  color?: "default" | "white" | "black" | "mono";
}

export function SipapLogo({
  className = "h-10 w-10",
  variant = "symbol",
  color = "default",
}: SipapLogoProps) {
  // Brand color mapping
  const upperColor =
    color === "white"
      ? "#FFFFFF"
      : color === "black"
        ? "#000000"
        : "#0A5C36"; // Forest Green

  const lowerColor =
    color === "white"
      ? "#FFFFFF"
      : color === "black"
        ? "#000000"
        : color === "mono"
          ? "#0A5C36"
          : "#059669"; // Mint Emerald

  const pivotColor =
    color === "white"
      ? "#FFFFFF"
      : color === "black"
        ? "#000000"
        : color === "mono"
          ? "#0A5C36"
          : "#D97706"; // Warm Amber Gold

  const textColor =
    color === "white"
      ? "#FFFFFF"
      : color === "black"
        ? "#000000"
        : "#0A5C36";

  const subtextColor =
    color === "white"
      ? "rgba(255,255,255,0.75)"
      : color === "black"
        ? "rgba(0,0,0,0.6)"
        : "#64748B"; // Muted Slate

  if (variant === "horizontal") {
    return (
      <svg
        className={className}
        viewBox="0 0 880 256"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="SIPAP Balai Bahasa Sumatera Barat"
      >
        <title>SIPAP - Balai Bahasa Sumatera Barat</title>
        {/* Symbol */}
        <g transform="translate(16, 16) scale(0.875)">
          <path
            fill={upperColor}
            d="M 224 24 C 204 38 180 44 148 44 C 94 44 54 70 54 104 C 54 130 76 144 116 156 L 142 126 C 106 114 94 106 94 96 C 94 80 110 74 140 74 C 168 74 198 64 218 48 C 222 44 224 34 224 24 Z"
          />
          <path
            fill={lowerColor}
            d="M 32 232 C 52 218 76 212 108 212 C 162 212 202 186 202 152 C 202 126 180 112 140 100 L 114 130 C 150 142 162 150 162 160 C 162 176 146 182 116 182 C 88 182 58 192 38 208 C 34 212 32 222 32 232 Z"
          />
          <polygon
            points="128,100.29 144,128 128,155.71 112,128"
            fill={pivotColor}
          />
        </g>
        {/* Wordmark */}
        <g transform="translate(240, 0)">
          {/* S */}
          <path
            fill={textColor}
            d="M 86 98 C 76 90 64 86 50 86 C 32 86 20 96 20 110 C 20 124 32 130 54 136 C 80 142 98 152 98 174 C 98 198 78 212 50 212 C 30 212 14 204 4 192 L 18 178 C 26 188 38 194 50 194 C 64 194 78 186 78 174 C 78 160 66 154 44 148 C 18 142 2 132 2 110 C 2 88 22 70 50 70 C 66 70 80 76 90 86 Z"
          />
          {/* I */}
          <rect x="114" y="72" width="20" height="138" rx="4" fill={textColor} />
          {/* P */}
          <path
            fill={textColor}
            d="M 152 72 L 192 72 C 216 72 232 86 232 108 C 232 130 216 144 192 144 L 172 144 L 172 210 L 152 210 Z M 172 90 L 172 126 L 190 126 C 202 126 212 118 212 108 C 212 98 202 90 190 90 Z"
          />
          {/* A */}
          <path
            fill={textColor}
            d="M 264 72 L 288 72 L 324 210 L 302 210 L 294 178 L 258 178 L 250 210 L 228 210 Z M 262 160 L 290 160 L 276 104 Z"
          />
          {/* P */}
          <path
            fill={textColor}
            d="M 342 72 L 382 72 C 406 72 422 86 422 108 C 422 130 406 144 382 144 L 362 144 L 362 210 L 342 210 Z M 362 90 L 362 126 L 380 126 C 392 126 402 118 402 108 C 402 98 392 90 380 90 Z"
          />
          {/* Subtitle */}
          <text
            x="6"
            y="238"
            fontFamily="var(--font-sans), sans-serif"
            fontSize="16"
            fontWeight="700"
            letterSpacing="4"
            fill={subtextColor}
          >
            BALAI BAHASA SUMATERA BARAT
          </text>
        </g>
      </svg>
    );
  }

  if (variant === "stacked") {
    return (
      <svg
        className={className}
        viewBox="0 0 480 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="SIPAP Balai Bahasa Sumatera Barat"
      >
        <title>SIPAP - Balai Bahasa Sumatera Barat</title>
        {/* Symbol Centered */}
        <g transform="translate(140, 28) scale(0.78)">
          <path
            fill={upperColor}
            d="M 224 24 C 204 38 180 44 148 44 C 94 44 54 70 54 104 C 54 130 76 144 116 156 L 142 126 C 106 114 94 106 94 96 C 94 80 110 74 140 74 C 168 74 198 64 218 48 C 222 44 224 34 224 24 Z"
          />
          <path
            fill={lowerColor}
            d="M 32 232 C 52 218 76 212 108 212 C 162 212 202 186 202 152 C 202 126 180 112 140 100 L 114 130 C 150 142 162 150 162 160 C 162 176 146 182 116 182 C 88 182 58 192 38 208 C 34 212 32 222 32 232 Z"
          />
          <polygon
            points="128,100.29 144,128 128,155.71 112,128"
            fill={pivotColor}
          />
        </g>
        {/* Wordmark Centered */}
        <g transform="translate(32, 170) scale(0.98)">
          {/* S */}
          <path
            fill={textColor}
            d="M 86 98 C 76 90 64 86 50 86 C 32 86 20 96 20 110 C 20 124 32 130 54 136 C 80 142 98 152 98 174 C 98 198 78 212 50 212 C 30 212 14 204 4 192 L 18 178 C 26 188 38 194 50 194 C 64 194 78 186 78 174 C 78 160 66 154 44 148 C 18 142 2 132 2 110 C 2 88 22 70 50 70 C 66 70 80 76 90 86 Z"
          />
          {/* I */}
          <rect x="114" y="72" width="20" height="138" rx="4" fill={textColor} />
          {/* P */}
          <path
            fill={textColor}
            d="M 152 72 L 192 72 C 216 72 232 86 232 108 C 232 130 216 144 192 144 L 172 144 L 172 210 L 152 210 Z M 172 90 L 172 126 L 190 126 C 202 126 212 118 212 108 C 212 98 202 90 190 90 Z"
          />
          {/* A */}
          <path
            fill={textColor}
            d="M 264 72 L 288 72 L 324 210 L 302 210 L 294 178 L 258 178 L 250 210 L 228 210 Z M 262 160 L 290 160 L 276 104 Z"
          />
          {/* P */}
          <path
            fill={textColor}
            d="M 342 72 L 382 72 C 406 72 422 86 422 108 C 422 130 406 144 382 144 L 362 144 L 362 210 L 342 210 Z M 362 90 L 362 126 L 380 126 C 392 126 402 118 402 108 C 402 98 392 90 380 90 Z"
          />
          {/* Subtitle */}
          <text
            x="18"
            y="246"
            fontFamily="var(--font-sans), sans-serif"
            fontSize="15"
            fontWeight="700"
            letterSpacing="4"
            fill={subtextColor}
          >
            BALAI BAHASA SUMATERA BARAT
          </text>
        </g>
      </svg>
    );
  }

  if (variant === "symbol-small") {
    return (
      <svg
        className={className}
        viewBox="0 0 256 256"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="SIPAP"
      >
        <title>SIPAP</title>
        <g id="symbol-small">
          <path
            fill={upperColor}
            d="M 226 22 C 202 38 176 46 144 46 C 86 46 48 74 48 108 C 48 136 74 150 114 162 L 144 126 C 106 112 92 104 92 94 C 92 78 110 70 140 70 C 168 70 200 58 220 42 C 224 38 226 30 226 22 Z"
          />
          <path
            fill={lowerColor}
            d="M 30 234 C 54 218 80 210 112 210 C 170 210 208 182 208 148 C 208 120 182 106 142 94 L 112 130 C 150 144 164 152 164 162 C 164 178 146 186 116 186 C 88 186 56 198 36 214 C 32 218 30 226 30 234 Z"
          />
          <polygon
            points="128,96.82 146,128 128,159.18 110,128"
            fill={pivotColor}
          />
        </g>
      </svg>
    );
  }

  // Default: Master Symbol ("Gonjong S")
  return (
    <svg
      className={className}
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="SIPAP"
    >
      <title>SIPAP</title>
      <g id="symbol">
        {/* Upper Ribbon: Forest Green */}
        <path
          fill={upperColor}
          d="M 224 24 C 204 38 180 44 148 44 C 94 44 54 70 54 104 C 54 130 76 144 116 156 L 142 126 C 106 114 94 106 94 96 C 94 80 110 74 140 74 C 168 74 198 64 218 48 C 222 44 224 34 224 24 Z"
        />
        {/* Lower Ribbon: Mint Emerald */}
        <path
          fill={lowerColor}
          d="M 32 232 C 52 218 76 212 108 212 C 162 212 202 186 202 152 C 202 126 180 112 140 100 L 114 130 C 150 142 162 150 162 160 C 162 176 146 182 116 182 C 88 182 58 192 38 208 C 34 212 32 222 32 232 Z"
        />
        {/* Central Pivot: Warm Amber Gold */}
        <polygon
          points="128,100.29 144,128 128,155.71 112,128"
          fill={pivotColor}
        />
      </g>
    </svg>
  );
}
