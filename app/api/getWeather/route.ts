import { NextRequest, NextResponse } from 'next/server';

const WEATHER_API_KEY = process.env.WEATHER_API_KEY; // Assume you have an API key
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

export async function POST(req: NextRequest) {
  try {
    const { location } = await req.json();

    if (!location) {
      return NextResponse.json({ error: "Missing location" }, { status: 400 });
    }

    // Fetch weather data from OpenWeatherMap (or another weather provider)
    const url = `${WEATHER_API_URL}?q=${encodeURIComponent(location)}&units=metric&appid=${WEATHER_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch weather data" }, { status: res.status });
    }

    const weatherData = await res.json();

    // Extract relevant info
    const temp = weatherData.main?.temp;
    const condition = weatherData.weather?.[0]?.description;
    const city = weatherData.name;
    
    return NextResponse.json({
      location: city,
      temperature: temp,
      condition: condition,
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("ERROR fetching weather:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
