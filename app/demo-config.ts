import { DemoConfig, ParameterLocation, SelectedTool } from "@/lib/types";
import { RoleEnum } from "@/lib/types";

function getSystemPrompt() {
  let sysPrompt: string;
  sysPrompt = `
  ## Agent Role
  - Name: Aanai
  - Context: You are a voice-based personal assistant that helps user to know weather, use google calendar, and use gmail.
  - Current time: ${new Date().toISOString()}

  ## Conversation guideline
  - Always conversation with questions
  - Call Tools if requred to check calendar, weather or gmail on your own.
  - Remember everything user tells you in between the call.

  ## Agent Capabilities
  - You can retrieve existing events from the Google Calendar.
  - You can add new events to the calendar with specified start/end times, descriptions, and other details.
  - You can delete events from the calendar when the user requests it.
  - You can edit existing events in the calendar.
  - You can also fetch current weather data for a specified location.

  ## Tools
  - Use "updateCalendar" Tool For managing calendar events.
  - Use "getWeather" Tool For fetching weather details given a location.
  - Use "gmailTool" Tool to send or read emails.

  ## Conversation Guidelines
  - Call "getWeather" Tool to know current detials
  - Call the "updateCalendar" tool with "get" action, as this will give events from the calendar. Wait for 10 sec max until you receive the calendar event.
  - After retrieving events using the 'get' action, you MUST summarize them to the user in your next message.
  - If the user wants to add an event, gather all the required information (title, summary, description, start time, end time) and then call the "updateCalendar" tool with the "add" action. Ensure the event details match the required schema.
  - If the user wants to delete an event, confirm the event ID and call "updateCalendar" with the "delete" action.
  - Always respond politely, helpfully, and in a natural tone. Clearly guide the user through any scheduling or review actions.
  - Use the provided current time as a reference time zone for adding or referring to events.

  ## Actions for updateCalendar tool
  - To add a new event: use "add".
  - To fetch all events: use "get".
  - To edit an event: use "edit".
  - To delete an event: use "delete".

  ## Additional Guidelines
  - When the user asks for a summary of the day's schedule, fetch the data and provide a concise summary.
  - Never reveal the actual function calls or their parameters to the user.
  - Use convenient, natural language when communicating.
  - Do not make up any imaginary event by your own. TELL EVENT LISTED ON CALENDAR ONLY.
  - Please use local timezone to update anything on the calendar.
  - Do not call any tool unless asked.

  ## Gmail usage
  - To send an email: action "send" with "to", "subject", and "body".
  - To list recent emails: action "list".

  `;

  sysPrompt = sysPrompt.replace(/"/g, '"').replace(/\n/g, "\n");

  return sysPrompt;
}

const selectedTools: SelectedTool[] = [
  {
    temporaryTool: {
      modelToolName: "updateCalendar",
      timeout: "5s",
      description:
        "Add or remove appointments/events from Google Calendar and read all existing items.Call this any time the user asks for calendar",
      dynamicParameters: [
        {
          name: "calendarActionData",
          location: ParameterLocation.BODY,
          schema: {
            description:
              "Data required to perform actions on the Google Calendar, including add, delete, or read actions.",
            type: "object",
            properties: {
              action: {
                type: "string",
                description:
                  "Action to perform on the calendar. Can be 'add','edit', 'delete', or 'get'.",
              },
              eventId: {
                type: "string",
                description:
                  "The ID of the event to delete/get. Required if action is 'delete' or 'get'.",
              },
              eventData: {
                type: "object",
                description: "Details of the event when adding a new event.",
                properties: {
                  title: { type: "string", description: "Title of the event" },
                  start: {
                    type: "object",
                    description: "Start time of the event",
                    properties: {
                      dateTime: {
                        type: "string",
                        description:
                          "Start time in ISO format, e.g. 2024-12-16T09:00:00-07:00",
                      },
                    },
                    required: ["dateTime"],
                  },
                  description: {
                    type: "string",
                    description: "Start time of the event",
                  },
                  id: { type: "string", description: "give some random id" },
                  summary: {
                    type: "string",
                    description: "motive of the event, what is this event for?",
                  },
                  end: {
                    type: "object",
                    description: "End time of the event",
                    properties: {
                      dateTime: {
                        type: "string",
                        description:
                          "End time in ISO format, e.g. 2024-12-16T10:00:00-07:00",
                      },
                    },
                    required: ["dateTime"],
                  },
                },
                required: [
                  "title",
                  "start",
                  "description",
                  "summary",
                  "id",
                  "end",
                ],
              },
            },
            required: ["action"],
          },
          required: true,
        },
      ],
      

      client: {},
    },
  },
  {
    temporaryTool: {
      modelToolName: "getWeather",
      timeout: "5s",
      description:
        "Fetch the current weather for a given location. Call this when the user asks about the weather.",
      dynamicParameters: [
        {
          name: "weatherQuery",
          location: ParameterLocation.BODY,
          schema: {
            description: "Location information to fetch the weather for.",
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "The name of the city or region for which to get the weather.",
              },
            },
            required: ["location"],
          },
          required: true,
        },
      ],
      client: {},
    },
  },
  {
    temporaryTool: {
      modelToolName: "gmailTool",
      timeout: "5s",
      description:
        "Send or read emails in the user's Gmail account. Use 'send' action with to, subject, body fields or 'list' action to list recent emails.",
      dynamicParameters: [
        {
          name: "gmailActionData",
          location: ParameterLocation.BODY,
          schema: {
            description:
              "Data required to perform actions on the Gmail API, including send or list actions.",
            type: "object",
            properties: {
              action: {
                type: "string",
                description: "Action to perform: 'send' or 'list'.",
              },
              to: {
                type: "string",
                description: "Recipient email address (required if action is 'send').",
              },
              subject: {
                type: "string",
                description: "Email subject (required if action is 'send').",
              },
              body: {
                type: "string",
                description: "Email body (required if action is 'send').",
              },
            },
            required: ["action"],
          },
          required: true,
        },
      ],
      client: {},
    },
  },
];



export const demoConfig: DemoConfig = {
  title: "Aania",
  overview:
    "This agent can schedule appointments, provide weather updates, and handle emails via Gmail.",
  callConfig: {
    systemPrompt: getSystemPrompt(),

    model: "fixie-ai/ultravox-70B",
    languageHint: "en",
    selectedTools: selectedTools,
    // initialMessages: [{
    //   "role": RoleEnum.ASSISTANT,
    //   "text": "Hello, Thank You for calling Belgrade Dental Clinic."
    // },],
    voice: "Jessica",
    temperature: 0.4,
  },
};


export default demoConfig;
