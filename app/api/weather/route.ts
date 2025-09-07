import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get("location")

  if (!location) {
    return NextResponse.json({ error: "Location is required" }, { status: 400 })
  }

  try {
    // Using OpenWeatherMap API - you can replace with your preferred weather service
    const apiKey = process.env.OPENWEATHER_API_KEY

    if (!apiKey) {
      // Fallback to mock data if no API key
      const mockWeatherData = {
        main: {
          temp: Math.round(15 + Math.random() * 20),
          feels_like: Math.round(15 + Math.random() * 20),
          humidity: Math.round(40 + Math.random() * 40),
        },
        weather: [
          {
            main: ["Sunny", "Cloudy", "Partly Cloudy"][Math.floor(Math.random() * 3)],
            description: "clear sky",
          },
        ],
        wind: { speed: Math.round(Math.random() * 15) },
        name: location,
      }

      return NextResponse.json(mockWeatherData)
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location},AU&appid=${apiKey}&units=metric`,
    )

    if (!response.ok) {
      throw new Error("Weather API request failed")
    }

    const weatherData = await response.json()
    return NextResponse.json(weatherData)
  } catch (error) {
    console.error("Weather fetch failed:", error)

    // Return mock data as fallback
    const fallbackWeather = {
      main: { temp: 22, feels_like: 24, humidity: 65 },
      weather: [{ main: "Sunny", description: "clear sky" }],
      wind: { speed: 8 },
      name: location,
    }

    return NextResponse.json(fallbackWeather)
  }
}
