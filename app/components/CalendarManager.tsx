"use client";

import React, { useState } from "react";

interface CalendarEvent {
  id?: string;
  summary?: string;
  start?: { dateTime?: string };
  end?: { dateTime?: string };
}

const CalendarManager: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [fetchStatus, setFetchStatus] = useState<string | null>(null);

  const [addStatus, setAddStatus] = useState<string | null>(null);
  const [newEventSummary, setNewEventSummary] = useState("");
  const [newEventStart, setNewEventStart] = useState("");
  const [newEventEnd, setNewEventEnd] = useState("");

  
  const fetchEvents = async () => {
    setFetchStatus("Fetching events...");
    try {
      const response = await fetch("/api/updateCalendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get" }),
      });
      const data = await response.json();
      if (data.events) {
        setEvents(data.events);
        setFetchStatus("Events fetched successfully!");
      } else {
        setFetchStatus("No events found or an error occurred.");
      }
    } catch (err) {
      console.error(err);
      setFetchStatus("Error fetching events.");
    }
  };

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddStatus("Adding event...");
    try {
      const eventData = {
        summary: newEventSummary,
        start: { dateTime: newEventStart },
        end: { dateTime: newEventEnd },
      };
      const response = await fetch("/api/updateCalendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", eventData }),
      });

      const data = await response.json();

      if (data.success && data.event) {
        setAddStatus("Event added successfully!");
        // Optionally refetch the events to show the newly added event
        await fetchEvents();
      } else {
        setAddStatus("Failed to add event.");
      }
    } catch (err) {
      console.error(err);
      setAddStatus("An error occurred while adding the event.");
    }

    // Clear form
    setNewEventSummary("");
    setNewEventStart("");
    setNewEventEnd("");
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded bg-gray-50">
        <h3 className="font-bold text-gray-800 mb-2">Manage Calendar Events</h3>
        <button
          onClick={fetchEvents}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Fetch Events
        </button>
        {fetchStatus && <p className="mt-2 text-gray-700">{fetchStatus}</p>}
        <div className="max-h-40 overflow-y-auto mt-4 text-gray-800">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event.id} className="border-b border-gray-200 pb-2 mb-2">
                <strong>Summary:</strong> {event.summary || "No Title"} <br />
                <strong>Start:</strong> {event.start?.dateTime || "N/A"} <br />
                <strong>End:</strong> {event.end?.dateTime || "N/A"} <br />
              </div>
            ))
          ) : (
            <p>No events yet.</p>
          )}
        </div>
      </div>

      <div className="p-4 border rounded bg-gray-50 text-gray-800">
        <h3 className="font-bold text-gray-800 mb-2">Add New Event</h3>
        <form onSubmit={addEvent} className="space-y-2">
          <div>
            <label className="block text-gray-700 font-medium">Summary</label>
            <input
              type="text"
              value={newEventSummary}
              onChange={(e) => setNewEventSummary(e.target.value)}
              className="border rounded w-full p-2 text-gray-800"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Start DateTime (ISO)</label>
            <input
              type="text"
              value={newEventStart}
              onChange={(e) => setNewEventStart(e.target.value)}
              className="border rounded w-full p-2"
              placeholder="e.g. 2024-12-16T09:00:00-07:00"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">End DateTime (ISO)</label>
            <input
              type="text"
              value={newEventEnd}
              onChange={(e) => setNewEventEnd(e.target.value)}
              className="border rounded w-full p-2"
              placeholder="e.g. 2024-12-16T10:00:00-07:00"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Event
          </button>
        </form>
        {addStatus && <p className="mt-2 text-gray-700">{addStatus}</p>}
      </div>
    </div>
  );
};

export default CalendarManager;
