"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import { startCall, endCall } from "@/lib/callFunctions";
import { CallConfig, SelectedTool } from "@/lib/types";
import demoConfig from "@/app/demo-config";
import {
  Role,
  Transcript,
  UltravoxExperimentalMessageEvent,
  UltravoxSessionStatus,
} from "ultravox-client";

import MicToggleButton from "@/components/MicToggleButton";
import { PhoneOffIcon, PhoneCall } from "lucide-react";
import OrderDetails from '@/components/OrderDetails';
import CalendarManager from '@/components/CalendarManager';

type SearchParamsProps = {
  showMuteSpeakerButton: boolean;
  modelOverride: string | undefined;
  showDebugMessages: boolean;
  showUserTranscripts: boolean;
};

type SearchParamsHandlerProps = {
  children: (props: SearchParamsProps) => React.ReactNode;
};

function SearchParamsHandler({ children }: SearchParamsHandlerProps) {
  const searchParams = useSearchParams();
  const showMuteSpeakerButton = searchParams.get("showSpeakerMute") === "true";
  const showDebugMessages = searchParams.get("showDebugMessages") === "true";
  const showUserTranscripts = searchParams.get("showUserTranscripts") === "true";
  let modelOverride: string | undefined;

  if (searchParams.get("model")) {
    modelOverride = "fixie-ai/" + searchParams.get("model");
  }

  return children({
    showMuteSpeakerButton,
    modelOverride,
    showDebugMessages,
    showUserTranscripts,
  });
}

export default function Home() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string>("off");
  const [callTranscript, setCallTranscript] = useState<Transcript[] | null>([]);
  const [callDebugMessages, setCallDebugMessages] = useState<
    UltravoxExperimentalMessageEvent[]
  >([]);
  const [customerProfileKey, setCustomerProfileKey] = useState<string | null>(
    null
  );

  const [currentCallId, setCurrentCallId] = useState<string | null>(null);

  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const previousTranscriptLength = useRef<number>(0);

  useEffect(() => {
    if (
      transcriptContainerRef.current &&
      callTranscript &&
      callTranscript.length > previousTranscriptLength.current
    ) {
      transcriptContainerRef.current.scrollTop =
        transcriptContainerRef.current.scrollHeight;
    }
    previousTranscriptLength.current = callTranscript?.length || 0;
  }, [callTranscript]);

  const handleStatusChange = useCallback(
    (status: UltravoxSessionStatus | string | undefined) => {
      if (status) {
        setAgentStatus(status);
      } else {
        setAgentStatus("off");
      }
    },
    []
  );

  const handleTranscriptChange = useCallback(
    (transcripts: Transcript[] | undefined) => {
      if (transcripts) {
        setCallTranscript([...transcripts]);
      }
    },
    []
  );

  const handleDebugMessage = useCallback(
    (debugMessage: UltravoxExperimentalMessageEvent) => {
      setCallDebugMessages((prevMessages) => [...prevMessages, debugMessage]);
    },
    []
  );

  const clearCustomerProfile = useCallback(() => {
    setCustomerProfileKey((prev) => (prev ? `${prev}-cleared` : "cleared"));
  }, []);

  const handleStartCallButtonClick = async (
    modelOverride?: string,
    showDebugMessages?: boolean
  ) => {
    try {
      handleStatusChange("Starting call...");
      setCallTranscript(null);
      setCallDebugMessages([]);
      clearCustomerProfile();

      // Generate a new call ID which we will consider as caller ID
      const newKey = `call-${Date.now()}`;
      setCustomerProfileKey(newKey);
      setCurrentCallId(newKey);

      console.log("LOG: Starting new call with callerId:", newKey);

      let callConfig: CallConfig = {
        systemPrompt: demoConfig.callConfig.systemPrompt,
        model: modelOverride || demoConfig.callConfig.model,
        languageHint: demoConfig.callConfig.languageHint,
        voice: demoConfig.callConfig.voice,
        temperature: demoConfig.callConfig.temperature,
        maxDuration: demoConfig.callConfig.maxDuration,
        timeExceededMessage: demoConfig.callConfig.timeExceededMessage,
      };

      const paramOverride: { [key: string]: any } = {
        callId: newKey,
      };

      let cpTool: SelectedTool | undefined =
        demoConfig?.callConfig?.selectedTools?.find(
          (tool) => tool.toolName === "createProfile"
        );

      if (cpTool) {
        cpTool.parameterOverrides = paramOverride;
      }
      callConfig.selectedTools = demoConfig.callConfig.selectedTools;

      await startCall(
        {
          onStatusChange: handleStatusChange,
          onTranscriptChange: handleTranscriptChange,
          onDebugMessage: handleDebugMessage,
        },
        callConfig,
        showDebugMessages
      );

      setIsCallActive(true);
      handleStatusChange("Call started successfully");
    } catch (error) {
      handleStatusChange(
        `Error starting call: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const handleEndCallButtonClick = async () => {
    try {
      handleStatusChange("Ending call...");
      await endCall();
      setIsCallActive(false);

      if (currentCallId) {
        console.log("LOG: Ending call with callerId:", currentCallId);
      }

      clearCustomerProfile();
      setCustomerProfileKey(null);
      setCurrentCallId(null);
      handleStatusChange("Call ended successfully");
    } catch (error) {
      handleStatusChange(
        `Error ending call: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      }
    >
      <SearchParamsHandler>
        {({
          showMuteSpeakerButton,
          modelOverride,
          showDebugMessages,
        }: SearchParamsProps) => (
          <div className="h-screen flex flex-col bg-gray-100">
            {/* Header / Navbar */}
            <div className="h-16 bg-white shadow-sm p-4 flex items-center justify-between">
              <div className="text-xl font-bold text-gray-800">
                Call Center Dashboard
              </div>
              <div className="text-sm text-gray-500">{agentStatus}</div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Left Column: Call & Transcript Area */}
              <div className="lg:w-2/3 border-r border-gray-300 bg-white flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="text-lg font-semibold text-gray-700">
                    {isCallActive ? "Active Call" : "Ready to Start a Call"}
                  </div>
                </div>

                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  {isCallActive ? (
                    <div className="flex flex-col h-full">
                      <div
                        ref={transcriptContainerRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                      >
                        {callTranscript &&
                          callTranscript.map((transcript, index) => (
                            <div
                              key={index}
                              className={`flex ${
                                transcript.speaker === "agent"
                                  ? "justify-start"
                                  : "justify-end"
                              }`}
                            >
                              <div
                                className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                                  transcript.speaker === "agent"
                                    ? "bg-blue-100 text-gray-900"
                                    : "bg-green-100 text-gray-900"
                                }`}
                              >
                                <p className="text-sm font-bold mb-1">
                                  {transcript.speaker === "agent"
                                    ? "Ania"
                                    : "User"}
                                </p>
                                <p className="text-base">{transcript.text}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                      <div className="p-4 bg-gray-100 flex space-x-4 items-center">
                        <MicToggleButton role={Role.USER} />
                        {showMuteSpeakerButton && (
                          <MicToggleButton role={Role.AGENT} />
                        )}
                        <button
                          type="button"
                          className="flex-grow flex items-center justify-center h-10 bg-red-600 text-white font-semibold rounded hover:bg-red-700"
                          onClick={handleEndCallButtonClick}
                          disabled={!isCallActive}
                        >
                          <PhoneOffIcon width={20} className="mr-2" />
                          End Call
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full items-center justify-center p-10 text-center text-gray-600">
                      <p className="mb-6">{demoConfig.overview}</p>
                      <button
                        type="button"
                        className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 flex items-center"
                        onClick={() =>
                          handleStartCallButtonClick(
                            modelOverride,
                            showDebugMessages
                          )
                        }
                      >
                        <PhoneCall className="mr-2" />
                        Start Call
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Service Details & Calendar Manager */}
              <div className="lg:w-1/3 bg-white p-4 space-y-4">
                <div className="text-lg font-semibold text-gray-700 mb-4">
                  Service Details
                </div>

                

                <CalendarManager />

                {showDebugMessages && (
                  <div className="p-4 border rounded bg-gray-50">
                    <h3 className="font-bold text-gray-800 mb-2">
                      Debug Messages
                    </h3>
                    <div className="overflow-y-auto max-h-40 text-sm text-gray-600 space-y-2">
                      {callDebugMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className="border-b border-gray-200 pb-2"
                        >
                          <strong>{msg.type}: </strong>
                          {msg.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </SearchParamsHandler>
    </Suspense>
  );
}
