import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

const UKURAN = [180, 192, 512];

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const diminta = Number(sp.get("size"));
  const ukuran = UKURAN.includes(diminta) ? diminta : 512;
  const penuh = sp.get("maskable") === "1";

  // Layani berkas aset statis resmi logo-kit bila ada
  try {
    let namaBerkas = "";
    if (ukuran === 180) {
      namaBerkas = "apple-touch-icon.png";
    } else if (ukuran === 192 && !penuh) {
      namaBerkas = "icon-192.png";
    } else if (ukuran === 512) {
      namaBerkas = penuh ? "maskable-512.png" : "icon-512.png";
    }

    if (namaBerkas) {
      const lokasi = join(process.cwd(), "public", namaBerkas);
      const buffer = await readFile(lokasi);
      return new Response(buffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400, immutable",
        },
      });
    }
  } catch {
    // Abaikan dan lanjutkan ke perender ImageResponse
  }

  const kartu = Math.round(ukuran * (penuh ? 0.6 : 0.66));
  const logo = Math.round(kartu * 0.76);

  return new ImageResponse(
    <div
      style={{
        width: ukuran,
        height: ukuran,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0A5C36",
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
        <svg width={logo} height={logo} viewBox="0 0 256 256">
          <path
            d="M 224 24 C 204 38 180 44 148 44 C 94 44 54 70 54 104 C 54 130 76 144 116 156 L 142 126 C 106 114 94 106 94 96 C 94 80 110 74 140 74 C 168 74 198 64 218 48 C 222 44 224 34 224 24 Z"
            fill="#0A5C36"
          />
          <path
            d="M 32 232 C 52 218 76 212 108 212 C 162 212 202 186 202 152 C 202 126 180 112 140 100 L 114 130 C 150 142 162 150 162 160 C 162 176 146 182 116 182 C 88 182 58 192 38 208 C 34 212 32 222 32 232 Z"
            fill="#059669"
          />
          <polygon
            points="128,100.29 144,128 128,155.71 112,128"
            fill="#D97706"
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
