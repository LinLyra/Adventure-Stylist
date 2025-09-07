import { NextRequest, NextResponse } from "next/server";

/**
 * Deterministic mock recommender for demo.
 * Keeps your existing color-extraction API intact.
 * Input: { destination, seasonStyle, activity, style, wardrobeItems, extractedColors }
 * Output: fixed yet believable guide per destination.
 */

type WardrobeItem = {
  name: string;
  type: "top" | "bottom" | "shoes" | "outer" | "accessory";
  colorHex?: string;
  tags?: string[];
};

function pickByKeyword(
  items: WardrobeItem[] | undefined,
  keyword: string,
  fallback: WardrobeItem
): WardrobeItem {
  if (!items || items.length === 0) return fallback;
  const hit =
    items.find((i) => i.name.toLowerCase().includes(keyword)) ||
    items.find((i) => (i.tags || []).some((t) => t.toLowerCase().includes(keyword)));
  return hit || fallback;
}

function fallbackWardrobe(): WardrobeItem[] {
  return [
    { name: "White T-Shirt", type: "top", tags: ["lightweight"] },
    { name: "Khaki Cargo Shorts", type: "bottom", tags: ["durable"] },
    { name: "Blue Jeans", type: "bottom", tags: ["durable"] },
    { name: "Brown Hiking Boots", type: "shoes", tags: ["grip", "waterproof"] },
    { name: "Sun Hat", type: "accessory", tags: ["uv"] },
    { name: "Windbreaker Jacket", type: "outer", tags: ["windproof", "light-jacket"] },
  ];
}

function guideForBlueMountains(
  wardrobe: WardrobeItem[],
  extractedColors?: string[]
) {
  const items = [
    pickByKeyword(wardrobe, "t-shirt", { name: "White T-Shirt", type: "top" }),
    pickByKeyword(wardrobe, "cargo", { name: "Khaki Cargo Shorts", type: "bottom" }),
    pickByKeyword(wardrobe, "boots", { name: "Brown Hiking Boots", type: "shoes" }),
    pickByKeyword(wardrobe, "hat", { name: "Sun Hat", type: "accessory" }),
    pickByKeyword(wardrobe, "wind", { name: "Windbreaker Jacket", type: "outer" }), // optional layer
  ];

  return {
    palette: extractedColors?.length
      ? extractedColors.slice(0, 5)
      : ["#2E8B57", "#DDA15E", "#87CEEB", "#8B4513"], // eucalyptus, sandstone, sky, earth
    items,
    why:
      "High UV on the plateau — add sun protection. Trail terrain favors durable bottoms and grippy boots. " +
      "Breeze along lookouts — bring a light windproof layer. Palette echoes eucalyptus greens and sandstone cliffs.",
  };
}

function guideForSydneyHarbour(
  wardrobe: WardrobeItem[],
  extractedColors?: string[]
) {
  const items = [
    pickByKeyword(wardrobe, "t-shirt", { name: "White T-Shirt", type: "top" }),
    pickByKeyword(wardrobe, "jeans", { name: "Blue Jeans", type: "bottom" }),
    pickByKeyword(wardrobe, "boots", { name: "Brown Hiking Boots", type: "shoes" }), // treat as comfy walkers
    pickByKeyword(wardrobe, "hat", { name: "Sun Hat", type: "accessory" }),
  ];

  return {
    palette: extractedColors?.length
      ? extractedColors.slice(0, 5)
      : ["#1F4C73", "#E6B800", "#9EC6D8"], // harbour blue, sunset gold, sea mist
    items,
    why:
      "Sunny harbour with a light sea breeze — choose breathable top and a hat for UV. " +
      "Blues and neutrals echo the harbour water and sunset tones; comfortable shoes for long walks by the quay.",
  };
}

function guideForGreatOceanRoad(
  wardrobe: WardrobeItem[],
  extractedColors?: string[]
) {
  const items = [
    pickByKeyword(wardrobe, "t-shirt", { name: "White T-Shirt", type: "top" }),
    pickByKeyword(wardrobe, "cargo", { name: "Khaki Cargo Shorts", type: "bottom" }),
    pickByKeyword(wardrobe, "boots", { name: "Brown Hiking Boots", type: "shoes" }),
    pickByKeyword(wardrobe, "hat", { name: "Sun Hat", type: "accessory" }),
    pickByKeyword(wardrobe, "wind", { name: "Windbreaker Jacket", type: "outer" }), // optional
  ];

  return {
    palette: extractedColors?.length
      ? extractedColors.slice(0, 5)
      : ["#4682B4", "#B0E0E6", "#F5DEB3"], // ocean blue, seafoam, limestone beige
    items,
    why:
      "Coastal wind along the cliffs — pack a light wind layer. UV peaks at midday, so a hat is essential. " +
      "Palette follows ocean hues and limestone stacks.",
  };
}

function guideGeneric(wardrobe: WardrobeItem[], extractedColors?: string[]) {
  const items = [
    pickByKeyword(wardrobe, "t-shirt", { name: "White T-Shirt", type: "top" }),
    pickByKeyword(wardrobe, "jeans", { name: "Blue Jeans", type: "bottom" }),
    pickByKeyword(wardrobe, "boots", { name: "Brown Hiking Boots", type: "shoes" }),
    pickByKeyword(wardrobe, "hat", { name: "Sun Hat", type: "accessory" }),
  ];

  return {
    palette: extractedColors?.length
      ? extractedColors.slice(0, 5)
      : ["#2E8B57", "#87CEEB", "#F4E8D2"], // green, sky, sand
    items,
    why:
      "Balanced conditions — comfortable layers with nature-inspired tones. " +
      "We prioritize items you already own for sustainability.",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const destination: string = (body.destination || body.location || "").toLowerCase();
    const activity: string = (body.activity || "Hiking") as string;
    const seasonStyle: string = (body.seasonStyle || "Autumn Earth") as string;
    const stylePref: string = (body.style || "Outdoor") as string;
    const extractedColors: string[] | undefined = body.extractedColors;
    const providedWardrobe: WardrobeItem[] = body.wardrobeItems || body.wardrobe || [];

    // Use provided wardrobe or fall back to a demo set so the guide is always populated
    const wardrobe = (providedWardrobe.length ? providedWardrobe : fallbackWardrobe()).map(
      (w) => ({ ...w, name: w.name || "Item" })
    );

    // Choose a deterministic guide by destination keywords
    let guide;
    if (destination.includes("blue") && destination.includes("mountain")) {
      guide = guideForBlueMountains(wardrobe, extractedColors);
    } else if (destination.includes("sydney") || destination.includes("harbour") || destination.includes("opera")) {
      guide = guideForSydneyHarbour(wardrobe, extractedColors);
    } else if (destination.includes("great ocean") || destination.includes("apostles")) {
      guide = guideForGreatOceanRoad(wardrobe, extractedColors);
    } else {
      guide = guideGeneric(wardrobe, extractedColors);
    }

    const response = {
      success: true,
      advice: {
        destination: body.destination || body.location || "Your destination",
        activity,
        seasonStyle,
        stylePref,
        palette: guide.palette,
        items: guide.items,
        sustainability: { owned_ratio: 1.0, note: "All items selected from your wardrobe" },
        why: guide.why,
        generatedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("fashion-advice error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to generate advice" },
      { status: 500 }
    );
  }
}
