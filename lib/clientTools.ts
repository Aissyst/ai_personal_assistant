import { ClientToolImplementation } from 'ultravox-client';

// Client-implemented tool for Order Details
export const updateCalendarTool: ClientToolImplementation = async (parameters) => {
  console.debug("Updating schedule:", parameters.calendarActionData);

  const response = await fetch('/api/updateCalendar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parameters.calendarActionData)
  });

  if (!response.ok) {
    const errorMsg = await response.text();
    console.error('Failed to update calendar:', errorMsg);
    return `Failed to update calendar: ${errorMsg}`;
  }

  const data = await response.json();
  console.log('Calendar updated:', data.events);

  // If the action is "get", data.events should contain the events.
  // Return them so the agent can use/see them.
  if (parameters.calendarActionData.action === 'get' && data.events) {
    // Returning the events directly as JSON (stringified) or as a formatted string.
    // console.log('Fetching Data:', data.events);
    return JSON.stringify(data.events);
  }

  // For add/delete actions, you can still return a simple success message or the event details.
  return data.success ? "Event updated successfully." : "Operation completed.";
};

//get weather tool
export const getWeatherTool: ClientToolImplementation = async (parameters) => {
  const { weatherQuery } = parameters;
  console.debug("Fetching weather for:", weatherQuery.location);

  const response = await fetch('/api/getWeather', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(weatherQuery),
  });

  if (!response.ok) {
    const errorMsg = await response.text();
    console.error('Failed to fetch weather:', errorMsg);
    return `Failed to fetch weather: ${errorMsg}`;
  }

  const data = await response.json();
  console.log('Weather data fetched:', data);
  
  // Return a human-readable summary or JSON data so the agent can respond to the user.
  return `The weather in ${data.location} is currently ${data.condition} with a temperature of ${data.temperature}°C.`;
};
