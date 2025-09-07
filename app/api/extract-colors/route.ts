import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function hexToRgb(hex: string) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

function brightness({ r, g, b }: { r: number; g: number; b: number }) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let buffer: Buffer;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ success: false, error: "Image file required" }, { status: 400 });
      }
      buffer = Buffer.from(await file.arrayBuffer());
    } else {
      const { imageUrl } = await req.json();
      if (!imageUrl) {
        return NextResponse.json({ success: false, error: "imageUrl is required" }, { status: 400 });
      }
      const res = await fetch(imageUrl);
      buffer = Buffer.from(await res.arrayBuffer());
    }

    const sharp = (await import("sharp")).default;
    buffer = await sharp(buffer).resize({ width: 300 }).toBuffer();

    const { getPalette } = await import("color-thief-node");
    const palette = await getPalette(buffer, 6);
    let colors = palette.map((rgb) => rgbToHex(rgb[0], rgb[1], rgb[2]));

    colors = colors
      .filter((c) => {
        const l = brightness(hexToRgb(c));
        return l > 40 && l < 220;
      })
      .filter((c, idx, arr) => arr.indexOf(c) === idx)
      .slice(0, 4);

    return NextResponse.json({ success: true, colors });
  } catch (e) {
    const fallback = ["#87CEEB", "#F5DEB3", "#2E8B57", "#8B4513"];
    return NextResponse.json({ success: false, colors: fallback });
  }
}
