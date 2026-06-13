"use client";

import React, { useEffect, useRef, useState, type JSX } from "react";

// ── FRAME CONFIG ─────────────────────────────────────────────
const FRAMES_PER_PART = 192; // 8s × 24fps
const PARTS = 4;
const TOTAL = FRAMES_PER_PART * PARTS; // 768
const PX_PER_FRAME = 6;

// ══════════════════════════════════════════════════════════════
// ── OVERLAY CONFIG — EDIT THIS SINGLE ARRAY ──────────────────
// ══════════════════════════════════════════════════════════════
//
// Each entry defines:
//   part       → Which part (1-4) this overlay belongs to
//   component  → Which React component to render (OverlayPart1, OverlayPart2, etc.)
//   startFrame → Frame where overlay first appears
//   visibleEnd → Last frame at full opacity
//   fadeEnd    → Frame where overlay is completely gone
//
// Formula (if using defaults):
//   startFrame = (part - 1) × 192
//   visibleEnd = startFrame + 30
//   fadeEnd    = startFrame + 35
//
// You can override any frame numbers manually!
// ══════════════════════════════════════════════════════════════

interface OverlayProps {
  hideText?: boolean;
  hideInfoBox?: boolean;
}

interface SceneOverlay {
  part: number;
  component: (props: OverlayProps) => JSX.Element;
  navColor?: string; // Optional: define the color of the navbar for this specific scene
  // Optional manual overrides. If omitted, it calculates automatically.
  manualStartFrame?: number;
  manualFadeInEnd?: number;
  manualVisibleEnd?: number;
  manualFadeEnd?: number;
}

// Helper: resolves frames, falling back to auto-calculation if manual is not provided
function getOverlayFrames(o: SceneOverlay) {
  const s = o.manualStartFrame ?? (o.part - 1) * FRAMES_PER_PART;
  return {
    start: s - 20, // Begin fading in before the snap point
    fadeInEnd: o.manualFadeInEnd ?? s, // Fully visible exactly at the snap point
    visibleEnd: o.manualVisibleEnd ?? s + 30,
    fadeEnd: o.manualFadeEnd ?? s + 45, // Slightly extended fade out
  };
}

function getOverlayOpacity(o: SceneOverlay, frame: number): number {
  const { start, fadeInEnd, visibleEnd, fadeEnd } = getOverlayFrames(o);

  if (frame < start || frame >= fadeEnd) return 0;
  if (frame < fadeInEnd) {
    return (frame - start) / (fadeInEnd - start);
  }
  if (frame <= visibleEnd) return 1;
  return 1 - (frame - visibleEnd) / (fadeEnd - visibleEnd);
}

// Shared utility: get the nav color for a given frame
function getNavDynamicColor(frame: number): string {
  let activeOverlay = SCENE_OVERLAYS[0];
  for (let i = SCENE_OVERLAYS.length - 1; i >= 0; i--) {
    const { start } = getOverlayFrames(SCENE_OVERLAYS[i]);
    if (frame >= start) {
      activeOverlay = SCENE_OVERLAYS[i];
      break;
    }
  }
  return activeOverlay?.navColor || "#ffffff";
}

// ── Sparkle SVG icon ─────────────────────────────────────────
function Sparkle({
  size = 20,
  color = "#fff",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 0L13.5 8.5L22 10L13.5 11.5L12 20L10.5 11.5L2 10L10.5 8.5L12 0Z" />
    </svg>
  );
}

// ── Collapsible Info Box ───────────────────────────────────────
function CollapsibleInfoBox({
  children,
  left,
  right,
  top,
  bottom,
  width,
  forceHidden,
}: {
  children: React.ReactNode;
  left?: string | number;
  right?: string | number;
  top?: string | number;
  bottom?: string | number;
  width?: string | number;
  forceHidden?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const effectiveOpen = forceHidden ? false : isOpen;

  return (
    <div
      style={{
        position: "absolute",
        left,
        right,
        top,
        bottom,
        zIndex: 20,
      }}
    >
      <div
        style={{
          width,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(10px)",
          borderRadius: 8,
          padding: "clamp(12px,1.8vw,26px)",
          opacity: effectiveOpen ? 1 : 0,
          pointerEvents: effectiveOpen ? "auto" : "none",
          transform: effectiveOpen ? "scale(1)" : "scale(0.9)",
          transformOrigin: `${bottom !== undefined ? "bottom" : "top"} ${
            right !== undefined ? "right" : "left"
          }`,
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
        }}
      >
        <button
          onClick={() => setIsOpen(false)}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.4)",
            color: "#fff",
            fontSize: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
            backdropFilter: "blur(5px)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.3)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
          }
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>

      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center justify-center"
        style={{
          position: "absolute",
          top: bottom !== undefined ? "auto" : 0,
          bottom: bottom !== undefined ? 0 : "auto",
          left: right !== undefined ? "auto" : 0,
          right: right !== undefined ? 0 : "auto",
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.6)",
          color: "#fff",
          fontSize: 28,
          fontWeight: 300,
          display: effectiveOpen ? "none" : forceHidden ? "none" : "flex",
          cursor: "pointer",
          backdropFilter: "blur(10px)",
          zIndex: 30,
          pointerEvents: "auto",
        }}
        aria-label="Open information"
      >
        <span
          className="absolute inline-flex h-full w-full rounded-full bg-black opacity-60 animate-ping"
          style={{ animationDuration: "2s" }}
        ></span>
        <span style={{ position: "relative", zIndex: 10, lineHeight: 1 }}>
          +
        </span>
      </button>
    </div>
  );
}

// ── Settings Panel ────────────────────────────────────────────
function SettingsPanel({
  autoScroll,
  setAutoScroll,
  infoBoxMode,
  setInfoBoxMode,
  textMode,
  setTextMode,
  dynamicColor,
  currentPart,
}: {
  autoScroll: boolean;
  setAutoScroll: (val: boolean) => void;
  infoBoxMode: "all" | number[];
  setInfoBoxMode: (val: "all" | number[]) => void;
  textMode: "all" | number[];
  setTextMode: (val: "all" | number[]) => void;
  dynamicColor: string;
  currentPart: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const labelStyle: React.CSSProperties = {
    ...sans,
    fontSize: "clamp(10px,1vw,13px)",
    letterSpacing: "0.08em",
    color: "#fff",
    cursor: "pointer",
    userSelect: "none",
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  const sectionTitleStyle: React.CSSProperties = {
    ...sans,
    fontSize: "clamp(8px,0.7vw,10px)",
    letterSpacing: "0.15em",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 20,
  };

  const checkboxStyle: React.CSSProperties = {
    cursor: "pointer",
    accentColor: "#22d3ee",
    width: 16,
    height: 16,
    flexShrink: 0,
  };

  return (
    <>
      {/* Gear Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          top: "2.5vh",
          right: "3vw",
          zIndex: 60,
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.4s ease",
          transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
        }}
        aria-label="Settings"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={dynamicColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: "stroke 0.4s ease" }}
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {/* Overlay backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100dvh",
            background: "rgba(0,0,0,0.3)",
            zIndex: 55,
          }}
        />
      )}

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100dvh",
          width: "clamp(220px, 22vw, 300px)",
          background: "rgba(10,10,10,0.92)",
          backdropFilter: "blur(20px)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          zIndex: 58,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          padding: "clamp(60px, 8vh, 80px) clamp(20px, 2vw, 32px) 32px",
          overflowY: "auto",
          boxSizing: "border-box",
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        {/* Panel Title */}
        <div
          style={{
            ...sans,
            fontSize: "clamp(11px,1vw,14px)",
            letterSpacing: "0.2em",
            color: "#fff",
            marginBottom: 24,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Settings
        </div>

        {/* ─── Smooth Scroll ─── */}
        <label style={labelStyle}>
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            style={checkboxStyle}
          />
          Smooth Scroll
        </label>

        {/* ─── Hide Info Boxes ─── */}
        <div style={sectionTitleStyle}>Hide Info Boxes</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={
                infoBoxMode === "all" || infoBoxMode.includes(currentPart)
              }
              onChange={(e) => {
                if (e.target.checked) {
                  if (infoBoxMode !== "all") {
                    const newArr = [...infoBoxMode, currentPart];
                    if (newArr.length === 5) setInfoBoxMode("all");
                    else setInfoBoxMode(newArr);
                  }
                } else {
                  if (infoBoxMode === "all") {
                    setInfoBoxMode(
                      [1, 2, 3, 4, 5].filter((n) => n !== currentPart),
                    );
                  } else {
                    setInfoBoxMode(
                      infoBoxMode.filter((n) => n !== currentPart),
                    );
                  }
                }
              }}
              style={checkboxStyle}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span>This Scene</span>
              <span
                style={{
                  fontSize: "0.8em",
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                }}
              >
                (
                {["Hero", "Rooftop", "Balcony", "Hall", "Bedroom"][
                  currentPart - 1
                ] || "Scene"}
                )
              </span>
            </div>
          </label>
          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={infoBoxMode === "all"}
              onChange={(e) => setInfoBoxMode(e.target.checked ? "all" : [])}
              style={checkboxStyle}
            />
            All Scenes
          </label>
        </div>

        {/* ─── Hide Text ─── */}
        <div style={sectionTitleStyle}>Hide Text</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={textMode === "all" || textMode.includes(currentPart)}
              onChange={(e) => {
                if (e.target.checked) {
                  if (textMode !== "all") {
                    const newArr = [...textMode, currentPart];
                    if (newArr.length === 5) setTextMode("all");
                    else setTextMode(newArr);
                  }
                } else {
                  if (textMode === "all") {
                    setTextMode(
                      [1, 2, 3, 4, 5].filter((n) => n !== currentPart),
                    );
                  } else {
                    setTextMode(textMode.filter((n) => n !== currentPart));
                  }
                }
              }}
              style={checkboxStyle}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span>This Scene</span>
              <span
                style={{
                  fontSize: "0.8em",
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                }}
              >
                (
                {["Hero", "Rooftop", "Balcony", "Hall", "Bedroom"][
                  currentPart - 1
                ] || "Scene"}
                )
              </span>
            </div>
          </label>
          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={textMode === "all"}
              onChange={(e) => setTextMode(e.target.checked ? "all" : [])}
              style={checkboxStyle}
            />
            All Scenes
          </label>
        </div>

        {/* ─── Status Summary ─── */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              ...sans,
              fontSize: "clamp(9px,0.8vw,12px)",
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.5,
            }}
          >
            Hidden Info Boxes from:{" "}
            <span style={{ color: "#fff", fontWeight: 600 }}>
              {infoBoxMode === "all"
                ? "All Scenes"
                : infoBoxMode.length === 0
                  ? "None"
                  : infoBoxMode
                      .map(
                        (n) =>
                          ["Hero", "Rooftop", "Balcony", "Hall", "Bedroom"][
                            n - 1
                          ],
                      )
                      .join(", ")}
            </span>
          </div>
          <div
            style={{
              ...sans,
              fontSize: "clamp(9px,0.8vw,12px)",
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.5,
            }}
          >
            Hidden Text From:{" "}
            <span style={{ color: "#fff", fontWeight: 600 }}>
              {textMode === "all"
                ? "All Scenes"
                : textMode.length === 0
                  ? "None"
                  : textMode
                      .map(
                        (n) =>
                          ["Hero", "Rooftop", "Balcony", "Hall", "Bedroom"][
                            n - 1
                          ],
                      )
                      .join(", ")}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

// ── OVERLAY CONTENT COMPONENTS ───────────────────────────────

function OverlayPart2({ hideText, hideInfoBox }: OverlayProps) {
  return (
    <div style={overlayBase}>
      {/* Center title */}
      {!hideText && (
        <div
          style={{
            position: "absolute",
            top: "22%",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            width: "80%",
          }}
        >
          <h1
            style={{
              ...serif,
              fontSize: "clamp(24px,4.5vw,72px)",
              fontWeight: 400,
              lineHeight: 1.1,
              textShadow:
                "0 2px 4px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.7), 0 16px 48px rgba(0,0,0,0.7)",
            }}
          >
            ELEVATED COASTAL LIVING{" "}
          </h1>
          <p
            style={{
              ...serifIt,
              fontSize: "clamp(12px,1.6vw,24px)",
              marginTop: "1vh",
              opacity: 0.9,
              textShadow:
                "0 1px 2px rgba(0,0,0,0.9), 0 4px 12px rgba(0,0,0,0.7), 0 12px 24px rgba(0,0,0,0.6)",
            }}
          >
            An immersive rooftop retreat where architecture, ocean horizons, and
            contemporary luxury converge.{" "}
          </p>
        </div>
      )}

      {/* Right body text with drop cap */}
      <CollapsibleInfoBox
        left="3vw"
        top="45%"
        width="clamp(200px,30vw,420px)"
        forceHidden={hideInfoBox}
      >
        <p style={{ ...serifBody, lineHeight: 1.7 }}>
          <span
            style={{
              ...serif,
              fontSize: "clamp(32px,3.5vw,58px)",
              float: "left",
              lineHeight: 0.85,
              marginRight: 6,
              marginTop: 4,
            }}
          >
            P
          </span>
          erched above the waterfront, this panoramic rooftop sanctuary captures
          the essence of refined coastal living. Framed by sweeping marina
          views, sculpted landscapes, and warm architectural textures, the space
          is designed as a seamless extension of the residence below. Every
          element — from the intimate fire lounge to the layered greenery and
          open-air seating — invites residents into a tranquil experience that
          balances sophistication with serenity.
        </p>
        <p style={{ ...serifBody, lineHeight: 1.7, marginTop: "1.2vh" }}>
          Blending modern Mediterranean aesthetics with immersive spatial
          design, this rooftop environment serves as both a private escape and a
          social destination within the residential walkthrough journey.
        </p>
      </CollapsibleInfoBox>

      {/* Interactive Hotspots for Rooftop */}
      <GlassCard
        top="60%"
        left="45%"
        icon="🔥"
        title="Social Hearth"
        desc="A central fire-lounge designed for evening gatherings."
      />
      <GlassCard
        top="50%"
        left="82%"
        icon="🪑"
        title="Cocoon Chairs"
        desc="Suspended woven seating offering panoramic harbor views."
      />
      <GlassCard
        top="15%"
        left="40%"
        icon="⛱️"
        title="Tensile Shade"
        desc="Architectural fabric providing elegant sun protection."
      />
      <GlassCard
        top="75%"
        left="85%"
        icon="🌿"
        title="Coastal Flora"
        desc="Resilient sculptural plants perfectly suited for the Mediterranean."
      />
    </div>
  );
}

function OverlayPart1({ hideText, hideInfoBox }: OverlayProps) {
  return (
    <div style={overlayBase}>
      {!hideText && (
        <div
          style={{
            position: "absolute",
            top: "14%",
            left: "3vw",
            width: "55%",
          }}
        >
          <h1
            style={{
              ...serif,
              fontSize: "clamp(22px,4.2vw,68px)",
              fontWeight: 400,
              lineHeight: 1.05,
              textShadow:
                "0 2px 4px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.7), 0 16px 48px rgba(0,0,0,0.7)",
            }}
          >
            THE ART OF COASTAL RESIDENCE
          </h1>
          <p
            style={{
              ...serifIt,
              fontSize: "clamp(11px,1.4vw,20px)",
              marginTop: "1.2vh",
              opacity: 0.9,
              textShadow:
                "0 1px 2px rgba(0,0,0,0.9), 0 4px 12px rgba(0,0,0,0.7), 0 12px 24px rgba(0,0,0,0.6)",
            }}
          >
            Where Luxury Meets the Sea: Port d&apos;Andratx Revisited.
          </p>
        </div>
      )}

      {/* Right body text with drop cap */}
      <CollapsibleInfoBox
        right="3vw"
        top="35%"
        width="clamp(200px,30vw,400px)"
        forceHidden={hideInfoBox}
      >
        <p style={{ ...serifBody, lineHeight: 1.7 }}>
          <span
            style={{
              ...serif,
              fontSize: "clamp(32px,3.5vw,58px)",
              float: "left",
              lineHeight: 0.85,
              marginRight: 6,
              marginTop: 4,
            }}
          >
            T
          </span>
          he meticulously designed terraces and interiors of this exclusive
          harbor exemplify a unique fusion of modern amenity and the timeless
          allure of the Mediterranean. Our design philosophy prioritizes natural
          textures like rich wood and cast concrete, curated with resilient,
          sculptural flora such as Agave americana.
        </p>
        <p style={{ ...serifBody, lineHeight: 1.7, marginTop: "1.2vh" }}>
          The entire space is a curated social hearth, connecting residents
          directly to the iconic coastal vistas. Here, every element is an
          experience.
        </p>
      </CollapsibleInfoBox>

      {/* Interactive Hotspots for Exterior/Wide Shot */}
      <GlassCard
        top="35%"
        left="30%"
        icon="⛵"
        title="Port d'Andratx"
        desc="The iconic natural harbor, just moments away from the residence."
      />
      <GlassCard
        top="45%"
        left="55%"
        icon="🌅"
        title="Panoramic Rooftop"
        desc="An expansive private terrace offering sweeping Mediterranean views."
      />
      <GlassCard
        top="80%"
        left="35%"
        icon="🏗️"
        title="Sustainable Architecture"
        desc="Natural timber and cast concrete seamlessly blending with the coastal environment."
      />
      <GlassCard
        top="70%"
        left="80%"
        icon="🪴"
        title="Private Balconies"
        desc="Generous outdoor living spaces seamlessly integrated into every suite."
      />
    </div>
  );
}

function OverlayPart3({ hideText, hideInfoBox }: OverlayProps) {
  return (
    <div style={overlayBase}>
      {!hideText && (
        <div
          style={{
            position: "absolute",
            top: "14%",
            left: "3vw",
            width: "55%",
          }}
        >
          <h1
            style={{
              ...serif,
              fontSize: "clamp(22px,4vw,64px)",
              fontWeight: 400,
              lineHeight: 1.05,
              textShadow:
                "0 2px 4px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.7), 0 16px 48px rgba(0,0,0,0.7)",
            }}
          >
            PRIVATE SKYLINE TERRACE{" "}
          </h1>
          <p
            style={{
              ...serifIt,
              fontSize: "clamp(11px,1.3vw,18px)",
              marginTop: "1vh",
              opacity: 0.9,
              textShadow:
                "0 1px 2px rgba(0,0,0,0.9), 0 4px 12px rgba(0,0,0,0.7), 0 12px 24px rgba(0,0,0,0.6)",
            }}
          >
            An elevated balcony retreat crafted for quiet luxury, open-air
            living, and uninterrupted architectural elegance.{" "}
          </p>
        </div>
      )}

      {/* Glassmorphic feature cards */}
      <GlassCard
        top="33%"
        left="30vw"
        icon="☀"
        title="Lighting & Mood"
        desc={
          "Layered light that\nchanges everything.\n(Warm LED + String lights)"
        }
      />
      <GlassCard
        top="60%"
        left="45vw"
        icon="🛋"
        title="Furniture Curation"
        desc={
          "Pieces that fit your\nlife, not just the space.\n(Bespoke modular sofa)"
        }
      />
      <GlassCard
        top="55%"
        left="78vw"
        icon="✿"
        title="Bespoke Styling"
        desc={
          "Intentional details that\ntell your story. (Aged\nterracotta, resilient flora)"
        }
      />

      {/* Right body text */}
      <CollapsibleInfoBox
        left="3vw"
        bottom="14%"
        width="clamp(180px,26vw,360px)"
        forceHidden={hideInfoBox}
      >
        <p
          style={{
            ...serifBody,
            fontSize: "clamp(9px,0.85vw,13px)",
            lineHeight: 1.65,
          }}
        >
          <span
            style={{
              ...serif,
              fontSize: "clamp(28px,3vw,48px)",
              float: "left",
              lineHeight: 0.85,
              marginRight: 5,
              marginTop: 3,
            }}
          >
            S
          </span>
          uspended above the coastal cityscape, this contemporary balcony
          experience blends warm natural textures with refined modern detailing
          to create a seamless indoor-outdoor sanctuary. Framed by sculpted
          greenery, ambient lighting, and panoramic harbor-facing views, the
          terrace becomes a private extension of the residence — designed for
          relaxation, conversation, and elevated everyday living.
        </p>
        <p
          style={{
            ...serifBody,
            fontSize: "clamp(9px,0.85vw,13px)",
            lineHeight: 1.65,
            marginTop: "1vh",
          }}
        >
          From the handcrafted lounge seating to the soft Mediterranean-inspired
          landscape palette, every detail contributes to a calm and immersive
          residential atmosphere. As part of the walkthrough journey, the
          balcony reveals the building’s philosophy of integrating architecture,
          nature, and lifestyle into one cohesive living experience.
        </p>
      </CollapsibleInfoBox>
    </div>
  );
}

function OverlayPart4({ hideText, hideInfoBox }: OverlayProps) {
  return (
    <div style={overlayBase}>
      {!hideText && (
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            left: "4vw",
            width: "45%",
          }}
        >
          <h1
            style={{
              ...serif,
              fontSize: "clamp(32px,5.5vw,82px)",
              fontWeight: 400,
              lineHeight: 1.0,
              textShadow:
                "0 2px 4px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.7), 0 16px 48px rgba(0,0,0,0.7)",
            }}
          >
            THE GRAND <br />
            LIVING GALLERY
          </h1>
          <p
            style={{
              ...serifIt,
              fontSize: "clamp(12px,1.5vw,22px)",
              marginTop: "2vh",
              opacity: 0.9,
              textShadow:
                "0 1px 2px rgba(0,0,0,0.9), 0 4px 12px rgba(0,0,0,0.7), 0 12px 24px rgba(0,0,0,0.6)",
            }}
          >
            Where timeless interiors, warm natural textures, and modern serenity
            come together in perfect harmony.{" "}
          </p>
        </div>
      )}

      {/* Glass card pointing to hanging chairs */}
      <GlassCard
        top="45%"
        left="68vw"
        icon="✧"
        title="Suspended Comfort"
        desc={
          "Twin woven cocoon chairs\ncreate an intimate vignette\nagainst the warm timber slats."
        }
      />

      {/* Glass card near string lights */}
      <GlassCard
        top="18%"
        left="30vw"
        icon="☀"
        title="Ambient Canopy"
        desc={"Festoon lighting softens the\nraw cast concrete architecture."}
      />

      {/* Bottom right text block */}
      <CollapsibleInfoBox
        right="4vw"
        bottom="10%"
        width="clamp(220px,28vw,380px)"
        forceHidden={hideInfoBox}
      >
        <p
          style={{
            ...serifBody,
            fontSize: "clamp(10px,0.95vw,14px)",
            lineHeight: 1.7,
          }}
        >
          <span
            style={{
              ...serif,
              fontSize: "clamp(36px,4vw,54px)",
              float: "left",
              lineHeight: 0.85,
              marginRight: 6,
              marginTop: 4,
            }}
          >
            D
          </span>
          esigned as the emotional centerpiece of the residence, this expansive
          living hall combines architectural sophistication with an atmosphere
          of effortless comfort. Soft ambient lighting, natural wood detailing,
          and floor-to-ceiling drapery create a refined spatial rhythm that
          feels both intimate and monumental. Every surface, texture, and
          proportion has been carefully curated to evoke warmth, elegance, and
          calm.
        </p>
        <p
          style={{
            ...serifBody,
            fontSize: "clamp(9px,0.85vw,13px)",
            lineHeight: 1.65,
            marginTop: "1vh",
          }}
        >
          The open-plan composition encourages fluid movement between lounge,
          corridor, and exterior spaces, reinforcing the seamless connection
          between architecture and lifestyle. As part of the residential
          walkthrough, the hall introduces a sense of understated luxury — a
          space crafted not only for living, but for experiencing light, scale,
          and tranquility in their purest form.
        </p>
      </CollapsibleInfoBox>
    </div>
  );
}

function OverlayPart5({ hideText, hideInfoBox }: OverlayProps) {
  return (
    <div style={overlayBase}>
      {!hideText && (
        <div
          style={{
            position: "absolute",
            bottom: "12%",
            right: "4vw",
            width: "50%",
            textAlign: "right",
          }}
        >
          <h1
            style={{
              ...serif,
              fontSize: "clamp(32px,5.5vw,82px)",
              fontWeight: 400,
              lineHeight: 1.0,
              textShadow:
                "0 2px 4px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.7), 0 16px 48px rgba(0,0,0,0.7)",
            }}
          >
            THE MASTER <br /> RETREAT
          </h1>
          <p
            style={{
              ...serifIt,
              fontSize: "clamp(12px,1.5vw,22px)",
              marginTop: "2vh",
              opacity: 0.9,
              textShadow:
                "0 1px 2px rgba(0,0,0,0.9), 0 4px 12px rgba(0,0,0,0.7), 0 12px 24px rgba(0,0,0,0.6)",
            }}
          >
            A private sanctuary where warm timber textures, panoramic mountain
            views, and contemporary comfort exist in harmony.{" "}
          </p>{" "}
        </div>
      )}
      {/* Bottom left text block */}
      <CollapsibleInfoBox
        left="4vw"
        bottom="10%"
        width="clamp(220px,28vw,380px)"
        forceHidden={hideInfoBox}
      >
        <p
          style={{
            ...serifBody,
            fontSize: "clamp(10px,0.95vw,14px)",
            lineHeight: 1.7,
          }}
        >
          <span
            style={{
              ...serif,
              fontSize: "clamp(36px,4vw,54px)",
              float: "left",
              lineHeight: 0.85,
              marginRight: 6,
              marginTop: 4,
            }}
          >
            C
          </span>
          rafted as an intimate escape within the residence, this bedroom blends
          natural materials, ambient lighting, and minimalist elegance to create
          a deeply calming atmosphere. The expansive floor-to-ceiling glazing
          invites breathtaking alpine vistas into the space, transforming the
          room into a serene connection between architecture and nature.
        </p>
        <p
          style={{
            ...serifBody,
            fontSize: "clamp(9px,0.85vw,13px)",
            lineHeight: 1.65,
            marginTop: "1vh",
          }}
        >
          Rich wooden textures, soft layered fabrics, and carefully integrated
          lighting establish a warm and immersive environment designed for rest
          and reflection. Every element — from the handcrafted furnishings to
          the tranquil outdoor lounge — reinforces a sense of understated
          luxury. As part of the residential walkthrough, the bedroom embodies
          the project’s vision of elevated living rooted in comfort,
          tranquility, and timeless design.
        </p>
      </CollapsibleInfoBox>

      {/* Glass card pointing to mountain view */}
      <GlassCard
        top="35%"
        left="30vw"
        icon="⛰"
        title="Mountain Panorama"
        desc={
          "Floor-to-ceiling glazing\ninvites the majestic peaks\ndirectly into your sanctuary."
        }
      />

      {/* Glass card pointing to wooden slats */}
      <GlassCard
        top="25%"
        left="68vw"
        icon="🪵"
        title="Acoustic Slats"
        desc={
          "Vertical timber battens\nprovide warmth, texture, and\nsuperior acoustic comfort."
        }
      />
    </div>
  );
}

// ── Glass Card sub-component for Part 3 ──
function GlassCard({
  top,
  left,
  icon,
  title,
  desc,
}: {
  top: string;
  left: string;
  icon: string;
  title: string;
  desc: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered(!isHovered)} // Important for iPad/Touch support
      style={{
        position: "absolute",
        top,
        left,
        zIndex: 20,
        pointerEvents: "none",
      }}
    >
      {/* The Hotspot Point */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.4)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          boxShadow: "0 0 15px rgba(255,255,255,0.2)",
          position: "absolute",
          top: -18,
          left: -18,
          transition:
            "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease",
          transform: isHovered ? "scale(0.8)" : "scale(1)",
          opacity: isHovered ? 0 : 1,
          zIndex: 2,
          pointerEvents: "auto",
        }}
      >
        <span
          className="absolute inline-flex h-full w-full rounded-full bg-white opacity-40 animate-ping"
          style={{ animationDuration: "2s" }}
        ></span>
        <span
          style={{
            color: "#fff",
            fontSize: 20,
            fontWeight: 300,
            lineHeight: 1,
          }}
        >
          +
        </span>
      </div>

      {/* The Expanded Card */}
      <div
        style={{
          position: "absolute",
          top: -12,
          left: -12,
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: 16,
          padding: "clamp(12px,1.5vw,22px)",
          width: "clamp(180px,18vw,260px)",
          opacity: isHovered ? 1 : 0,
          transform: isHovered
            ? "translateY(0) scale(1)"
            : "translateY(10px) scale(0.95)",
          transition: "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
          pointerEvents: isHovered ? "auto" : "none",
          transformOrigin: "top left",
          boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ fontSize: "clamp(18px,1.8vw,28px)", marginBottom: 8 }}>
          {icon}
        </div>
        <div
          style={{
            ...sans,
            fontSize: "clamp(12px,1.1vw,16px)",
            fontWeight: 700,
            marginBottom: 6,
            color: "#fff",
            textShadow: "0 1px 4px rgba(0,0,0,0.5)",
          }}
        >
          {title}
        </div>
        <div
          style={{
            ...sans,
            fontSize: "clamp(9px,0.85vw,13px)",
            opacity: 0.95,
            whiteSpace: "pre-line",
            lineHeight: 1.6,
            color: "#fff",
            textShadow: "0 1px 4px rgba(0,0,0,0.5)",
          }}
        >
          {desc}
        </div>
      </div>
    </div>
  );
}

// ── Shared text styles ───────────────────────────────────────
const serif: React.CSSProperties = {
  fontFamily: "'Playfair Display', 'Georgia', serif",
  color: "#fff",
};
const serifIt: React.CSSProperties = { ...serif, fontStyle: "italic" };
const serifBody: React.CSSProperties = {
  ...serif,
  fontSize: "clamp(10px,0.95vw,14px)",
  fontWeight: 400,
};
const sans: React.CSSProperties = {
  fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
  color: "#fff",
  fontWeight: 400,
};
const overlayBase: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  color: "#fff",
};

// ══════════════════════════════════════════════════════════════
// ── SCENE_OVERLAYS — THE SINGLE SOURCE OF TRUTH ──────────────
// ══════════════════════════════════════════════════════════════
// Add, remove, or reorder overlays here. Edit frame numbers directly.
//
// Part 1: frames 0–191   → overlay visible 0..30, fades by 35
// Part 2: frames 192–383 → overlay visible 192..222, fades by 227
// Part 3: frames 384–575 → overlay visible 384..414, fades by 419
// Part 4: frames 576–767 → overlay visible 576..606, fades by 611
// ══════════════════════════════════════════════════════════════
const SCENE_OVERLAYS: SceneOverlay[] = [
  // Fully automatic timing based on part number
  { part: 1, component: OverlayPart1, navColor: "#000000" },
  {
    part: 2,
    component: OverlayPart2,
    navColor: "#ffffff",
    manualStartFrame: 140,
    manualVisibleEnd: 190,
    manualFadeEnd: 215,
  },
  {
    part: 3,
    component: OverlayPart3,
    navColor: "#ffffff",
    manualStartFrame: 380,
    manualVisibleEnd: 400,
    manualFadeEnd: 425,
  },
  {
    part: 4,
    component: OverlayPart4,
    navColor: "#ffffff",
    manualStartFrame: 490,
    manualVisibleEnd: 600,
    manualFadeEnd: 625,
  },
  {
    part: 5,
    component: OverlayPart5,
    navColor: "#ffffff",
    manualStartFrame: 690,
    manualVisibleEnd: 767,
    manualFadeEnd: 768,
  },
];

// ── Frame image array ────────────────────────────────────────
const photos = Array.from({ length: TOTAL }).map((_, i) => {
  const num = String(i).padStart(3, "0");
  return {
    id: i,
    getUrl: (width: number) => {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
      const w = width <= 480 ? 480 : width <= 768 ? 768 : 1200;
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_${w},f_auto,q_auto/v2/building/building/frame-${num}.webp`;
    },
  };
});

// ── GLOBAL NAVBAR ──────────────────────────────────────────────
function GlobalNavbar({ currentFrame }: { currentFrame: number }) {
  const [clickedFrame, setClickedFrame] = useState<number | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToFrame = (frame: number) => {
    // Instantly show the underline and color for the clicked tab
    setClickedFrame(frame);
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      setClickedFrame(null);
    }, 1200); // Allow time for smooth scroll to complete

    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = (frame / TOTAL) * maxScroll;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  const effectiveFrame = clickedFrame !== null ? clickedFrame : currentFrame;

  const dynamicColor = getNavDynamicColor(effectiveFrame);

  const btnStyle = {
    ...sans,
    fontWeight: "600",
    fontSize: "clamp(9px,1vw,18px)",
    letterSpacing: "0.18em",
    background: "none",
    border: "none",
    color: dynamicColor,
    cursor: "pointer",
    padding: "8px 12px",
    opacity: 0.9,
    transition: "color 0.4s ease, opacity 0.2s ease",
    position: "relative" as const,
  };

  const isActive = (start: number, end: number) => {
    return effectiveFrame >= start && effectiveFrame < end;
  };

  const renderUnderline = (active: boolean) => {
    return (
      <div
        style={{
          position: "absolute",
          bottom: 2,
          left: "50%",
          transform: active
            ? "translateX(-50%) scaleX(1)"
            : "translateX(-50%) scaleX(0)",
          width: "60%",
          height: 1,
          background: dynamicColor,
          transition: "transform 0.3s ease, background 0.1s ease",
          transformOrigin: "center",
        }}
      />
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "2.5vh",
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "4vw",
        zIndex: 50,
        pointerEvents: "auto",
      }}
    >
      <button
        onClick={() => scrollToFrame(0)}
        style={{ ...btnStyle, display: "flex", alignItems: "center", gap: 6 }}
      >
        <Sparkle size={16} color={dynamicColor} />
        Home
        {renderUnderline(isActive(0, 140))}
      </button>
      <button onClick={() => scrollToFrame(140)} style={btnStyle}>
        ROOFTOP
        {renderUnderline(isActive(140, 385))}
      </button>
      <button onClick={() => scrollToFrame(385)} style={btnStyle}>
        BALCONY
        {renderUnderline(isActive(385, 490))}
      </button>
      <button onClick={() => scrollToFrame(490)} style={btnStyle}>
        HALL
        {renderUnderline(isActive(490, 690))}
      </button>
      <button onClick={() => scrollToFrame(690)} style={btnStyle}>
        BEDROOM
        {renderUnderline(isActive(690, TOTAL + 1))}
      </button>
    </div>
  );
}

// ── GLOBAL BOTTOM BAR ──────────────────────────────────────────
function GlobalBottomBar() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "3vh",
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center",
        zIndex: 50,
        pointerEvents: "none",
        color: "#fff",
      }}
    >
      <div style={{ marginBottom: 8, opacity: 0.9 }}>▽</div>
      <div
        style={{
          ...sans,
          fontSize: "clamp(8px,0.8vw,11px)",
          letterSpacing: "0.2em",
          opacity: 0.8,
        }}
      >
        Home &nbsp;|&nbsp; Issue 04 &nbsp;|&nbsp; Spring 2026
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────
export default function ScrollPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cacheRef = useRef<(HTMLImageElement | null)[]>(
    new Array(TOTAL).fill(null),
  );
  const currentFrameRef = useRef(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const [infoBoxMode, setInfoBoxMode] = useState<"all" | number[]>([]);
  const [textMode, setTextMode] = useState<"all" | number[]>([]);

  // Determine the current active scene part
  const getCurrentPart = () => {
    let activePart = 1;
    for (let i = SCENE_OVERLAYS.length - 1; i >= 0; i--) {
      const { start } = getOverlayFrames(SCENE_OVERLAYS[i]);
      if (currentFrame >= start) {
        activePart = SCENE_OVERLAYS[i].part;
        break;
      }
    }
    return activePart;
  };
  const currentPart = getCurrentPart();

  // Scroll to top on refresh
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Lock scroll during loading
  useEffect(() => {
    document.body.style.overflow = loadedCount < TOTAL ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [loadedCount]);

  // Canvas + image loading + scroll handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw(currentFrameRef.current);
    }
    window.addEventListener("resize", resize);
    resize();

    function loadAllImages() {
      const CONCURRENCY = 20;
      let idx = 0;
      function loadNext() {
        if (idx >= TOTAL) return;
        const i = idx++;
        if (cacheRef.current[i]) {
          loadNext();
          return;
        }
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          cacheRef.current[i] = img;
          if (i === 0) draw(0);
          setLoadedCount((p) => p + 1);
          loadNext();
        };
        img.onerror = () => {
          console.error(`Failed frame ${i}`);
          setLoadedCount((p) => p + 1);
          loadNext();
        };
        img.src = photos[i].getUrl(window.innerWidth);
      }
      for (let i = 0; i < CONCURRENCY; i++) loadNext();
    }
    loadAllImages();

    function draw(i: number) {
      const img = cacheRef.current[i];
      if (!img) return;
      const cw = canvas!.width,
        ch = canvas!.height;
      const iw = img.naturalWidth,
        ih = img.naturalHeight;
      const s = Math.max(cw / iw, ch / ih);
      ctx!.drawImage(img, (cw - iw * s) / 2, (ch - ih * s) / 2, iw * s, ih * s);
    }

    let targetFrame = 0,
      smoothFrame = 0,
      lastDrawn = -1,
      rafId: number;
    function renderLoop() {
      smoothFrame += (targetFrame - smoothFrame) * 0.08;
      const f = Math.round(smoothFrame);
      if (f !== lastDrawn && cacheRef.current[f]) {
        draw(f);
        lastDrawn = f;
        currentFrameRef.current = f;
        setCurrentFrame(f);
      }
      rafId = requestAnimationFrame(renderLoop);
    }
    renderLoop();

    function onScroll() {
      targetFrame = Math.min(
        Math.floor(window.scrollY / PX_PER_FRAME),
        TOTAL - 1,
      );
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    function onContextMenu(e: MouseEvent) {
      e.preventDefault();
    }
    window.addEventListener("contextmenu", onContextMenu);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("contextmenu", onContextMenu);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* Google Fonts for editorial look */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Scroll Snapping & Touch Styles */}
      {autoScroll && (
        <style>{`
          html, body {
            scroll-snap-type: y mandatory;
            -webkit-touch-callout: none; /* iOS Safari */
            -webkit-user-select: none;   /* Safari */
            user-select: none;           /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
          }
        `}</style>
      )}
      {!autoScroll && (
        <style>{`
          html, body {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }
        `}</style>
      )}

      {/* Loading screen */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
          color: "#fff",
          transform:
            loadedCount < TOTAL ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 1s cubic-bezier(0.7, 0, 0.3, 1)",
          pointerEvents: loadedCount < TOTAL ? "auto" : "none",
        }}
      >
        <div
          style={{
            ...serif,
            fontSize: "clamp(24px,3vw,42px)",
            letterSpacing: "0.15em",
            marginBottom: "4vh",
            textTransform: "uppercase",
            opacity: 0.9,
          }}
        >
          Home
        </div>

        {/* Sleek progress line */}
        <div
          style={{
            width: "clamp(200px, 40vw, 400px)",
            height: 1,
            background: "rgba(255,255,255,0.2)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              background: "#fff",
              width: `${(loadedCount / TOTAL) * 100}%`,
              transition: "width 0.1s ease-out",
            }}
          />
        </div>

        <div
          style={{
            ...sans,
            marginTop: "2vh",
            fontSize: "clamp(10px,1vw,12px)",
            letterSpacing: "0.2em",
            opacity: 0.6,
          }}
        >
          {Math.round((loadedCount / TOTAL) * 100)}%
        </div>
      </div>

      {/* Scroll container */}
      <div
        className="hide-scrollbar"
        style={{
          height: `calc(${TOTAL * PX_PER_FRAME}px + 100dvh)`,
          background: "#000",
          position: "relative", // Ensure absolute snap points are relative to this container
        }}
      >
        {/* Invisible Snap Points */}
        {[0, 140, 385, 490, 690, TOTAL - 1].map((frame) => (
          <div
            key={frame}
            style={{
              position: "absolute",
              top: frame * PX_PER_FRAME,
              width: "100%",
              height: "10px",
              scrollSnapAlign: "start",
              pointerEvents: "none",
            }}
          />
        ))}

        <canvas
          ref={canvasRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100dvh",
          }}
        />

        <GlobalNavbar currentFrame={currentFrame} />
        <SettingsPanel
          autoScroll={autoScroll}
          setAutoScroll={setAutoScroll}
          infoBoxMode={infoBoxMode}
          setInfoBoxMode={setInfoBoxMode}
          textMode={textMode}
          setTextMode={setTextMode}
          dynamicColor={getNavDynamicColor(currentFrame)}
          currentPart={currentPart}
        />
        <GlobalBottomBar />

        {/* ── TEXT OVERLAYS ── */}
        {SCENE_OVERLAYS.map((overlay, index) => {
          const opacity = getOverlayOpacity(overlay, currentFrame);
          if (opacity <= 0) return null;
          const Component = overlay.component;

          const shouldHideText =
            textMode === "all" || textMode.includes(overlay.part);
          const shouldHideInfoBox =
            infoBoxMode === "all" || infoBoxMode.includes(overlay.part);

          return (
            <div
              key={index}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100dvh",
                opacity,
                pointerEvents: "none",
                zIndex: 10,
              }}
            >
              <Component
                hideText={shouldHideText}
                hideInfoBox={shouldHideInfoBox}
              />
            </div>
          );
        })}

        {/* Debug HUD */}
        {/* <div
          style={{
            position: "fixed",
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 99,
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            padding: "6px 16px",
            borderRadius: 6,
            fontFamily: "monospace",
            fontSize: 13,
            letterSpacing: "0.05em",
            pointerEvents: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <div>
            Part: {Math.floor(currentFrame / FRAMES_PER_PART) + 1} &nbsp;|&nbsp;
            Frame: {currentFrame}
          </div>
          {(() => {
            const currentPart = Math.floor(currentFrame / FRAMES_PER_PART) + 1;
            let overlay = SCENE_OVERLAYS.find((o) => {
              const { start, fadeEnd } = getOverlayFrames(o);
              return currentFrame >= start && currentFrame <= fadeEnd;
            });
            if (!overlay) {
              overlay = SCENE_OVERLAYS.find((o) => o.part === currentPart);
            }
            if (!overlay) return null;
            const { start, fadeInEnd, visibleEnd, fadeEnd } = getOverlayFrames(overlay);
            return (
              <div style={{ fontSize: 11, opacity: 0.8 }}>
                Overlay: {start} → Fades In {fadeInEnd} → Visible {visibleEnd} →
                Fades Out {fadeEnd}
              </div>
            );
          })()}
        </div> */}
      </div>
    </>
  );
}
