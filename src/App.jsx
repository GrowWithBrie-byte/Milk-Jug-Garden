import React, { useState, useEffect } from "react";

// ── UTILS ──
const TODAY = "2026-03-31";
const todayMs = new Date(TODAY).getTime();
export const daysSince = (d) =>
  Math.max(0, Math.floor((todayMs - new Date(d).getTime()) / 86400000));

export const qtToCups = (qt) => qt * 4;

// ── SOIL VOLUMES ──
const soilVolumes = [
  { plant: "Tomato", volumeQt: 2 },
  { plant: "Basil", volumeQt: 1 },
  { plant: "Marigold", volumeQt: 0.5 },
];

export const SoilConverter = () => (
  <div
    style={{
      padding: "15px",
      backgroundColor: "#f9f9f9",
      borderRadius: "8px",
      marginTop: "10px",
    }}
  >
    <h3 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>🌱 Soil Volume Reference</h3>
    {soilVolumes.map((s) => (
      <div key={s.plant} style={{ fontSize: "12px", lineHeight: 1.5, marginBottom: "5px" }}>
        {s.plant}: {s.volumeQt} qt ({qtToCups(s.volumeQt)} cups)
      </div>
    ))}
  </div>
);

// ── CONTAINERS & TRANSPLANT MAP ──
export const CONTAINER_TYPES = [
  "Milk Jug",
  "5-Gal Bucket",
  "Plastic Pot",
  "Fabric Bag",
  "Coffee Can",
  "Yogurt Container",
];

export const TRANSPLANT_MAP = {
  "Yogurt Container": { next: "Milk Jug", nextVol: "1 gal", daysMin: 14, daysMax: 21 },
  "Coffee Can": { next: "Plastic Pot", nextVol: "1–2 gal", daysMin: 21, daysMax: 35 },
  "Milk Jug": { next: "5-Gal Bucket", nextVol: "5 gal", daysMin: 28, daysMax: 45 },
  "Plastic Pot": { next: "5-Gal Bucket", nextVol: "5 gal", daysMin: 28, daysMax: 45 },
  "5-Gal Bucket": { next: "10-Gal Fabric Bag", nextVol: "10 gal", daysMin: 60, daysMax: 90 },
  "Fabric Bag": { next: "In-Ground/Raised Bed", nextVol: "N/A", daysMin: 60, daysMax: 90 },
};

// ── VISUAL SIGNS ──
export const VISUAL_SIGNS = [
  { id: "roots", label: "Roots poking out of drainage holes", icon: "🌿" },
  { id: "droop", label: "Plant wilts quickly after watering", icon: "😓" },
  { id: "slow", label: "Growth has slowed or stalled", icon: "🐌" },
  { id: "leaves4", label: "Has 4+ true leaves (seedlings)", icon: "🍃" },
  { id: "heavy", label: "Plant looks top-heavy for its pot", icon: "⚖️" },
  { id: "dry", label: "Soil dries out extremely fast", icon: "🏜️" },
];

// ── EMOJI PRESETS ──
export const EMOJI_PRESETS = {
  "🍅": { name: "Tomatoes", container: "Milk Jug", waterEvery: 2 },
  "🫑": { name: "Peppers", container: "Milk Jug", waterEvery: 2 },
  "🥬": { name: "Lettuce", container: "Milk Jug", waterEvery: 2 },
  "🌿": { name: "Basil", container: "Yogurt Container", waterEvery: 2 },
  "🍓": { name: "Strawberries", container: "Fabric Bag", waterEvery: 1 },
  "🌸": { name: "Flowers", container: "Plastic Pot", waterEvery: 2 },
  "🥒": { name: "Cucumbers", container: "5-Gal Bucket", waterEvery: 2 },
  "🌱": { name: "Herbs", container: "Coffee Can", waterEvery: 2 },
  "🪴": { name: "", container: "Milk Jug", waterEvery: 2 },
};

// ── PLANT GUIDES EXAMPLE ──
export const PLANT_GUIDES = [
  {
    name: "Tomatoes",
    emoji: "🍅",
    container: "5-Gal Bucket",
    water: "Every 1-2 days",
    waterBase: 1.5,
    sun: "Full sun",
    tip: "Cut the top off a milk jug and plant deep — tomatoes love it!",
  },
  {
    name: "Lettuce",
    emoji: "🥬",
    container: "Milk Jug",
    water: "Every 2 days",
    waterBase: 2,
    sun: "Part shade",
    tip: "Milk jugs are perfect! Cut the side for a window box effect.",
  },
  {
    name: "Basil",
    emoji: "🌿",
    container: "Yogurt Container",
    water: "Every 2-3 days",
    waterBase: 2.5,
    sun: "Full sun",
    tip: "Loves warmth. Keep near a sunny window in a 32oz container.",
  },
];

// ── MAIN APP ──
export default function GardenApp() {
  const [selectedPlant, setSelectedPlant] = useState(null);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>🥛 Milk Jug Garden Helper</h2>

      <SoilConverter />

      <div style={{ marginTop: "20px" }}>
        <h3>Select a Plant:</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          {PLANT_GUIDES.map((p) => (
            <button
              key={p.name}
              style={{
                padding: "5px 10px",
                borderRadius: "6px",
                cursor: "pointer",
                backgroundColor: selectedPlant === p.name ? "#aed581" : "#f0f0f0",
              }}
              onClick={() => setSelectedPlant(p.name)}
            >
              {p.emoji} {p.name}
            </button>
          ))}
        </div>
      </div>

      {selectedPlant && (
        <div style={{ marginTop: "20px", fontSize: "14px" }}>
          <h3>Plant Info:</h3>
          <p>{PLANT_GUIDES.find((p) => p.name === selectedPlant).tip}</p>
        </div>
      )}
    </div>
  );
}
