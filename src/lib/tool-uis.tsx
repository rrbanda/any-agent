"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";

export const WeatherToolUI = makeAssistantToolUI({
  toolName: "get_weather",
  render: ({ args, result, status }) => {
    const location = (args as { location?: string })?.location ?? "Unknown";
    const parsed = result
      ? typeof result === "string"
        ? (() => {
            try {
              return JSON.parse(result);
            } catch {
              return null;
            }
          })()
        : result
      : null;

    const isRunning = status?.type === "running";

    return (
      <div className="my-2 rounded-lg border border-border bg-card p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <span className="text-lg">
            {isRunning ? "⏳" : parsed?.condition === "partly cloudy" ? "⛅" : "🌤️"}
          </span>
          <span>Weather in {location}</span>
        </div>
        {isRunning ? (
          <p className="mt-1 text-xs text-muted-foreground animate-pulse">
            Fetching weather data...
          </p>
        ) : parsed ? (
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded bg-muted p-2 text-center">
              <div className="text-lg font-semibold text-foreground">
                {parsed.temperature}°{parsed.unit === "celsius" ? "C" : "F"}
              </div>
              <div className="text-muted-foreground">Temperature</div>
            </div>
            <div className="rounded bg-muted p-2 text-center">
              <div className="text-lg font-semibold text-foreground">
                {parsed.humidity}%
              </div>
              <div className="text-muted-foreground">Humidity</div>
            </div>
            <div className="rounded bg-muted p-2 text-center">
              <div className="text-lg font-semibold text-foreground">
                {parsed.wind_speed}
              </div>
              <div className="text-muted-foreground">Wind</div>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">No data</p>
        )}
      </div>
    );
  },
});
