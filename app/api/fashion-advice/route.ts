import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

export type WardrobeItem = {
  id: string;
  type: "top" | "bottom" | "outerwear" | "footwear" | "accessory" | "hat" | "swimwear";
  name: string;
  colors: string[];
  features?: string[];
};

export type FashionAdviceInput = {
  wardrobe: WardrobeItem[];
  destination: { name: string; lat?: number; lon?: number };
  activity: "beach" | "hiking" | "city" | "adventure" | "wildlife" | "photo";
  season?: "summer" | "autumn" | "winter" | "spring";
  palette?: string[];
  weather?: { tempC: number; condition: string; uv?: number; windKph?: number };
};

type GuideItem = WardrobeItem & { why: string };

type Guide = {
  items: GuideItem[];
  palette: string[];
  notes: string[];
};

const activityNeeds: Record<
  FashionAdviceInput["activity"],
  { types: WardrobeItem["type"][]; note: string }
> = {
  beach: {
    types: ["swimwear", "top", "bottom", "footwear", "hat", "accessory"],
    note: "Sun protection and quick-dry fabrics help at the beach",
  },
  hiking: {
    types: ["top", "bottom", "footwear", "outerwear", "hat", "accessory"],
    note: "Supportive footwear and layers for changing trail weather",
  },
  city: {
    types: ["top", "bottom", "footwear", "outerwear", "accessory"],
    note: "Comfortable layers for urban exploration",
  },
  adventure: {
    types: ["top", "bottom", "footwear", "outerwear", "accessory", "hat"],
    note: "Durable gear for action-packed activities",
  },
  wildlife: {
    types: ["top", "bottom", "footwear", "outerwear", "hat", "accessory"],
    note: "Earthy tones blend with environment and protect from insects",
  },
  photo: {
    types: ["top", "bottom", "footwear", "outerwear", "accessory", "hat"],
    note: "Functional pockets and neutral tones keep focus on scenery",
  },
};

function hexToRgb(hex: string) {
  const v = parseInt(hex.replace("#", ""), 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

function colorDistance(a: string, b: string) {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  return Math.sqrt(
    Math.pow(ra.r - rb.r, 2) + Math.pow(ra.g - rb.g, 2) + Math.pow(ra.b - rb.b, 2)
  );
}

function pickByType(
  items: WardrobeItem[],
  type: WardrobeItem["type"],
  palette?: string[]
): WardrobeItem | undefined {
  const candidates = items.filter((w) => w.type === type);
  if (!candidates.length) return undefined;
  if (!palette || palette.length === 0) return candidates[0];
  const main = palette[0];
  return candidates.reduce((best, cur) => {
    const bestDist = Math.min(...best.colors.map((c) => colorDistance(c, main)));
    const curDist = Math.min(...cur.colors.map((c) => colorDistance(c, main)));
    return curDist < bestDist ? cur : best;
  });
}

async function polishReasons(items: GuideItem[]) {
  if (!process.env.OPENAI_API_KEY) return items;
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    for (const item of items) {
      const res = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Rewrite outfit reasons to be concise and friendly.",
          },
          { role: "user", content: item.why },
        ],
        max_tokens: 60,
      });
      item.why = res.choices?.[0]?.message?.content?.trim() || item.why;
    }
  } catch (e) {
    // silently fail
  }
  return items;
}

function baseReason(
  item: WardrobeItem,
  input: FashionAdviceInput,
  note: string
): string {
  const parts = [] as string[];
  if (input.weather) {
    if (input.weather.tempC >= 28) parts.push("keeps you cool in the heat");
    else if (input.weather.tempC <= 15) parts.push("adds warmth in cool temps");
    else parts.push("suits mild weather");
    parts.push(input.weather.condition.toLowerCase());
  }
  parts.push(note);
  if (input.palette && item.colors.length) {
    parts.push("matches natural palette");
  }
  if (input.activity === "wildlife") {
    parts.push("subtle tones help blend with surroundings");
  }
  return `${item.name}: ${parts.join(", ")}`;
}

function buildGuide(input: FashionAdviceInput): Guide {
  const rule = activityNeeds[input.activity];
  const items: GuideItem[] = [];
  for (const type of rule.types) {
    const chosen = pickByType(input.wardrobe, type, input.palette);
    if (chosen) {
      items.push({ ...chosen, why: baseReason(chosen, input, rule.note) });
    }
  }
  return { items, palette: input.palette || [], notes: [] };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as FashionAdviceInput;
    const guide = buildGuide(body);
    await polishReasons(guide.items);
    return NextResponse.json({ success: true, guide });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Failed to generate advice" },
      { status: 500 }
    );
  }
}
