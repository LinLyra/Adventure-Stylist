import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || searchParams.get("location");
  let lat = searchParams.get("lat");
  let lon = searchParams.get("lon");

  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      mock: true,
      weather: { tempC: 24, condition: "Sunny" },
      error: "Missing WEATHER_API_KEY",
    });
  }

  try {
    if ((!lat || !lon) && q) {
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${apiKey}`
      );
      if (geoRes.ok) {
        const geo = await geoRes.json();
        lat = geo[0]?.lat?.toString();
        lon = geo[0]?.lon?.toString();
      }
    }

    if (!lat || !lon) {
      return NextResponse.json(
        { success: false, error: "Latitude and longitude required" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    if (!res.ok) throw new Error("Weather API error");
    const data = await res.json();
    const weather = {
      tempC: Math.round(data.main.temp),
      condition: data.weather?.[0]?.main || "Unknown",
      windKph: data.wind?.speed ? Math.round(data.wind.speed * 3.6) : undefined,
    };
    return NextResponse.json({ success: true, weather });
  } catch (e) {
    return NextResponse.json({
      success: false,
      mock: true,
      weather: { tempC: 23, condition: "Sunny" },
    });
  }
}
