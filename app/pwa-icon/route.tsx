import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

const UKURAN = [180, 192, 512];

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const diminta = Number(sp.get("size"));
  const ukuran = UKURAN.includes(diminta) ? diminta : 512;
  // "maskable" & ikon iOS: latar penuh tanpa sudut membulat (OS yang memotongnya)
  const penuh = sp.get("maskable") === "1";

  const kartu = Math.round(ukuran * (penuh ? 0.58 : 0.66));
  const logo = Math.round(kartu * 0.72);

  return new ImageResponse(
    <div
      style={{
        width: ukuran,
        height: ukuran,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0B6645",
        borderRadius: penuh ? 0 : Math.round(ukuran * 0.22),
      }}
    >
      <div
        style={{
          width: kartu,
          height: kartu,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          borderRadius: Math.round(kartu * 0.28),
        }}
      >
        <svg width={logo} height={logo} viewBox="0 0 48 48">
          <path
            d="M10 24C10 18 16 14 22 17C17 21 16 28 10 32C8 30 10 26 10 24Z"
            fill="#14532D"
          />
          <path
            d="M12 21C16 16 24 16 26 21C22 24 17 24 12 30C10 27 10 23 12 21Z"
            fill="#0D9488"
          />
          <path
            d="M22 14C27 11 36 14 38 18C33 22 28 22 24 28C22 25 21 18 22 14Z"
            fill="#0284C7"
          />
          <path
            d="M14 28C18 26 26 28 28 32C24 36 17 37 14 34C13 32 13 30 14 28Z"
            fill="#EA580C"
          />
          <path
            d="M24 24C28 22 34 23 38 27C34 32 28 35 24 33C23 30 23 27 24 24Z"
            fill="#F97316"
          />
          <path
            d="M26 29C30 28 36 30 38 33C35 36 30 38 26 36C25 34 25 31 26 29Z"
            fill="#FBBF24"
          />
        </svg>
      </div>
    </div>,
    {
      width: ukuran,
      height: ukuran,
      headers: { "Cache-Control": "public, max-age=86400, immutable" },
    },
  );
}
