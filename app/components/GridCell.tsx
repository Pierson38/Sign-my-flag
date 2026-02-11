"use client";

import { CSSProperties } from "react";

interface Message {
  id: number;
  firstName: string;
  lastName: string;
  message: string;
  spanCols: number;
  color: string;
  imagePath: string | null;
}

interface GridCellProps {
  row: number;
  col: number;
  spanCols: number;
  status: "available" | "occupied" | "reserved";
  message?: Message;
  cellWidth: number;
  cellHeight: number;
  onClick: () => void;
  style: CSSProperties;
}

/**
 * Compute a font size so the full text fits within the cell.
 * Uses an area-based heuristic: fontSize ≈ sqrt(area / charCount * factor)
 */
function computeFitFontSize(
  text: string,
  width: number,
  height: number
): number {
  if (text.length === 0 || width <= 0 || height <= 0) return 8;

  const area = width * height;
  // Average char takes ~0.55 * fontSize in width and ~1.2 * fontSize in height.
  // So one char area ≈ 0.55 * 1.2 * fontSize² = 0.66 * fontSize²
  // We need chars * 0.66 * fontSize² ≤ area
  // fontSize ≤ sqrt(area / (chars * 0.66))
  // Add padding factor (0.85) to leave some breathing room
  const rawSize = Math.sqrt(area / (text.length * 0.75));

  // Clamp: minimum readable, maximum = cell height (single-line big text)
  return Math.max(5, Math.min(rawSize, height * 0.85));
}

export default function GridCell({
  spanCols,
  status,
  message,
  cellWidth,
  cellHeight,
  onClick,
  style,
}: GridCellProps) {
  if (status === "reserved") {
    return <div className="grid-cell reserved" style={style} />;
  }

  if (status === "occupied" && message) {
    const hasImage = !!message.imagePath;

    // Build the full display text: "Prenom — message"
    const displayText = `${message.message} — ${message.firstName}`;

    const totalWidth = cellWidth * spanCols;
    const fontSize = computeFitFontSize(displayText, totalWidth, cellHeight);

    return (
      <div
        className="grid-cell occupied"
        onClick={onClick}
        title={`${message.firstName} ${message.lastName}: ${message.message}`}
        style={{
          ...style,
          ...(hasImage
            ? {
                backgroundImage: `url(/api/uploads/${message.imagePath})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}),
        }}
      >
        <span
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: 1.15,
            color: message.color || "#1a1a1a",
            fontWeight: 700,
            textShadow:
              "0 0 3px rgba(255,255,255,0.9), 0 0 6px rgba(255,255,255,0.6)",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            padding: "1px 2px",
            width: "100%",
            maxHeight: "100%",
            overflow: "hidden",
          }}
        >
          {displayText}
        </span>
      </div>
    );
  }

  return (
    <div className="grid-cell available" onClick={onClick} style={style} />
  );
}
