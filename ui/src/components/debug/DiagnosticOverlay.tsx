"use client";

import { useState, useEffect } from "react";
import { getDiagnosticData, type DiagnosticData } from "@/lib/debug/diagnostics";

// Only render in diagnostic mode
const DIAG_ENABLED = process.env.NEXT_PUBLIC_DIAG_FREEZE === "1";

export function DiagnosticOverlay() {
  const [data, setData] = useState<DiagnosticData | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!DIAG_ENABLED) return;

    // Update every 500ms
    const interval = setInterval(() => {
      const newData = getDiagnosticData();
      setData(newData);
      // Expose to window for console capture during freeze
      (window as unknown as { __DIAG_DATA__: DiagnosticData }).__DIAG_DATA__ = newData;
    }, 500);

    // Initial data
    const initialData = getDiagnosticData();
    setData(initialData);
    (window as unknown as { __DIAG_DATA__: DiagnosticData }).__DIAG_DATA__ = initialData;

    return () => clearInterval(interval);
  }, []);

  if (!DIAG_ENABLED || !data) {
    return null;
  }

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        style={{
          position: "fixed",
          bottom: 8,
          right: 8,
          zIndex: 99999,
          background: "#1a1a2e",
          color: "#00ff88",
          border: "1px solid #00ff88",
          borderRadius: 4,
          padding: "4px 8px",
          fontSize: 10,
          fontFamily: "monospace",
          cursor: "pointer",
        }}
      >
        [DIAG]
      </button>
    );
  }

  const { renders, requests, killSwitches, activePollers, pollerKeys } = data;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 8,
        right: 8,
        zIndex: 99999,
        background: "rgba(26, 26, 46, 0.95)",
        color: "#e0e0e0",
        border: "1px solid #00ff88",
        borderRadius: 6,
        padding: 8,
        fontSize: 10,
        fontFamily: "monospace",
        maxWidth: 320,
        maxHeight: 400,
        overflow: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
          paddingBottom: 4,
          borderBottom: "1px solid #333",
        }}
      >
        <span style={{ color: "#00ff88", fontWeight: "bold" }}>
          DIAG OVERLAY
        </span>
        <button
          onClick={() => setIsCollapsed(true)}
          style={{
            background: "transparent",
            color: "#888",
            border: "none",
            cursor: "pointer",
            padding: "0 4px",
          }}
        >
          [x]
        </button>
      </div>

      {/* Kill Switches */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ color: "#ff6b6b", fontWeight: "bold", marginBottom: 4 }}>
          Kill Switches:
        </div>
        <div style={{ paddingLeft: 8, color: "#aaa" }}>
          <div>
            BrandBrainClient:{" "}
            <span style={{ color: killSwitches.disableBrandBrainClient ? "#ff6b6b" : "#4ecdc4" }}>
              {killSwitches.disableBrandBrainClient ? "DISABLED" : "active"}
            </span>
          </div>
          <div>
            SnapshotRender:{" "}
            <span style={{ color: killSwitches.disableSnapshotRender ? "#ff6b6b" : "#4ecdc4" }}>
              {killSwitches.disableSnapshotRender ? "DISABLED" : "active"}
            </span>
          </div>
          <div>
            Polling:{" "}
            <span style={{ color: killSwitches.disablePolling ? "#ff6b6b" : "#4ecdc4" }}>
              {killSwitches.disablePolling ? "DISABLED" : "active"}
            </span>
          </div>
        </div>
      </div>

      {/* Render Counters */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ color: "#ffd93d", fontWeight: "bold", marginBottom: 4 }}>
          Renders:
        </div>
        <div style={{ paddingLeft: 8 }}>
          {Object.keys(renders).length === 0 ? (
            <span style={{ color: "#666" }}>(no renders tracked)</span>
          ) : (
            Object.entries(renders).map(([name, stats]) => (
              <div key={name} style={{ color: stats.ratePerSec > 2 ? "#ff6b6b" : "#aaa" }}>
                {name}: <span style={{ color: "#fff" }}>{stats.count}</span>
                {stats.ratePerSec > 0 && (
                  <span style={{ color: "#888" }}> ({stats.ratePerSec}/s)</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Request Metrics */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ color: "#4ecdc4", fontWeight: "bold", marginBottom: 4 }}>
          Requests:
        </div>
        <div style={{ paddingLeft: 8 }}>
          {Object.keys(requests).length === 0 ? (
            <span style={{ color: "#666" }}>(no requests tracked)</span>
          ) : (
            Object.entries(requests).map(([endpoint, stats]) => {
              const shortName = endpoint.split("/").filter(Boolean).slice(-2).join("/");
              return (
                <div key={endpoint} style={{ color: stats.inFlight > 0 ? "#ffd93d" : "#aaa" }}>
                  {shortName}:{" "}
                  <span style={{ color: "#fff" }}>{stats.count}x</span>
                  <span style={{ color: "#888" }}> ~{stats.avgMs}ms</span>
                  <span style={{ color: "#888" }}> {stats.totalKB}KB</span>
                  {stats.inFlight > 0 && (
                    <span style={{ color: "#ffd93d" }}> [{stats.inFlight} pending]</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Active Pollers */}
      <div>
        <div style={{ color: "#ff6b6b", fontWeight: "bold", marginBottom: 4 }}>
          Pollers: {activePollers}
        </div>
        {pollerKeys.length > 0 && (
          <div style={{ paddingLeft: 8, color: "#888", fontSize: 9 }}>
            {pollerKeys.map((key) => (
              <div key={key}>{key}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

DiagnosticOverlay.displayName = "DiagnosticOverlay";
