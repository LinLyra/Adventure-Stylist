import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { city, lat, lon } = await req.json();
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        mock: true,
        weather: { tempC: 24, condition: "Sunny" },
        error: "Missing WEATHER_API_KEY",
      });
    }

    let url = "";
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    } else {
      return NextResponse.json(
        { success: false, error: "city or lat/lon required" },
        { status: 400 }
      );
    }

    const res = await fetch(url);
    const data = await res.json();

    if (data.cod !== 200) {
      return NextResponse.json(
        { success: false, error: "Weather API error", details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      weather: {
        tempC: data.main.temp,
        condition: data.weather?.[0]?.description,
        windKph: data.wind?.speed ? data.wind.speed * 3.6 : undefined,
        uv: data?.uv || null,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        success: false,
        mock: true,
        weather: { tempC: 23, condition: "Sunny" },
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

