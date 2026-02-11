"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import GridCell from "./GridCell";
import MessageForm from "./MessageForm";
import ZoomControls from "./ZoomControls";
import {
  computeGridInfo,
  cellKey,
  isCellReserved,
  computeActualSpan,
} from "@/lib/grid";
import { Lang, t } from "@/lib/i18n";

interface Message {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  gridRow: number;
  gridCol: number;
  spanCols: number;
  color: string;
  size: string;
  imagePath: string | null;
}

const FLAG_ASPECT = 5 / 3; // width / height

interface FlagProps {
  lang: Lang;
}

export default function Flag({ lang }: FlagProps) {
  const tr = t(lang);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [viewingMessage, setViewingMessage] = useState<Message | null>(null);
  const [baseWidth, setBaseWidth] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const lastPinchDist = useRef<number | null>(null);

  const fetchMessages = useCallback(async () => {
    const res = await fetch("/api/messages");
    const data = await res.json();
    setMessages(data);
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Measure wrapper and compute base flag size (fit to wrapper at zoom=1)
  useEffect(() => {
    const measure = () => {
      if (!wrapperRef.current) return;
      const w = wrapperRef.current.clientWidth;
      const h = wrapperRef.current.clientHeight;
      // Fit by width or height, whichever is constraining
      const widthFromW = w;
      const widthFromH = h * FLAG_ASPECT;
      setBaseWidth(Math.min(widthFromW, widthFromH));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const baseHeight = baseWidth / FLAG_ASPECT;
  const flagWidth = baseWidth * zoom;
  const flagHeight = baseHeight * zoom;

  const gridInfo = computeGridInfo(
    messages.map((m) => ({
      gridRow: m.gridRow,
      gridCol: m.gridCol,
      spanCols: m.spanCols,
    }))
  );

  const { rows, cols, level } = gridInfo;

  // Cell dimensions in pixels (for auto-fit font sizing)
  const cellWidth = flagWidth / cols;
  const cellHeight = flagHeight / rows;

  // Map from origin cell key → message
  const messageMap = new Map<string, Message>();
  for (const msg of messages) {
    messageMap.set(cellKey(msg.gridRow, msg.gridCol), msg);
  }

  // Cells absorbed by spanning messages
  const absorbedCells = new Set<string>();
  for (const msg of messages) {
    for (let i = 1; i < (msg.spanCols || 1); i++) {
      absorbedCells.add(cellKey(msg.gridRow, msg.gridCol + i));
    }
  }

  const handleCellClick = (row: number, col: number) => {
    const key = cellKey(row, col);
    const msg = messageMap.get(key);
    if (msg) {
      setViewingMessage(msg);
      return;
    }
    if (
      !gridInfo.reservedCells.has(key) &&
      !gridInfo.occupiedCells.has(key)
    ) {
      setSelectedCell({ row, col });
    }
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 4));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleZoomReset = () => setZoom(1);

  // Desktop: Ctrl+wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom((z) => {
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        return Math.min(Math.max(z + delta, 0.5), 4);
      });
    }
  }, []);

  // Mobile: pinch-to-zoom
  const getTouchDist = (touches: React.TouchList) => {
    if (touches.length < 2) return null;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      lastPinchDist.current = getTouchDist(e.touches);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastPinchDist.current !== null) {
      const dist = getTouchDist(e.touches);
      if (dist !== null) {
        const scale = dist / lastPinchDist.current;
        setZoom((z) => Math.min(Math.max(z * scale, 0.5), 4));
        lastPinchDist.current = dist;
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastPinchDist.current = null;
  }, []);

  // Max available span for selected cell
  const maxSpanForSelected = selectedCell
    ? computeActualSpan(
        4,
        selectedCell.row,
        selectedCell.col,
        cols,
        gridInfo.reservedCells,
        gridInfo.occupiedCells
      )
    : 1;

  // Generate cells
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = cellKey(r, c);
      if (absorbedCells.has(key)) continue;

      const reserved = isCellReserved(r, c, rows, cols);
      const msg = messageMap.get(key);
      const spanCols = msg?.spanCols || 1;

      let status: "available" | "occupied" | "reserved" = "available";
      if (reserved) status = "reserved";
      else if (msg) status = "occupied";

      cells.push(
        <GridCell
          key={key}
          row={r}
          col={c}
          spanCols={spanCols}
          status={status}
          message={msg}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
          onClick={() => handleCellClick(r, c)}
          style={{
            gridColumn: `${c + 1} / span ${spanCols}`,
            gridRow: `${r + 1}`,
          }}
        />
      );
    }
  }

  return (
    <div className="w-full h-full relative">
      {/* Scrollable flag wrapper */}
      <div
        ref={wrapperRef}
        className="flag-scroll-wrapper"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {baseWidth > 0 && (
          <div
            className="flag-container"
            style={{ width: flagWidth, height: flagHeight }}
          >
            <img
              src="/california-flag.png"
              alt="Drapeau de Californie"
              draggable={false}
            />
            <div
              className="grid-overlay"
              style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
              }}
            >
              {cells}
            </div>
          </div>
        )}
      </div>

      {/* Floating controls */}
      <div className="flag-controls">
        <span className="text-xs bg-white/80 backdrop-blur rounded-lg px-2 py-1 shadow-sm text-gray-600">
          {messages.length}{" "}
          {messages.length !== 1 ? tr.signaturesPlural : tr.signatures} |{" "}
          {gridInfo.availableCells.length}{" "}
          {gridInfo.availableCells.length !== 1 ? tr.placesPlural : tr.places}
        </span>
        <ZoomControls
          zoom={zoom}
          lang={lang}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleZoomReset}
        />
      </div>

      {/* Message form modal */}
      {selectedCell && (
        <MessageForm
          gridRow={selectedCell.row}
          gridCol={selectedCell.col}
          maxSpan={maxSpanForSelected}
          lang={lang}
          onClose={() => setSelectedCell(null)}
          onSuccess={() => {
            setSelectedCell(null);
            fetchMessages();
          }}
        />
      )}

      {/* View message modal */}
      {viewingMessage && (
        <div className="modal-overlay" onClick={() => setViewingMessage(null)}>
          <div
            className="bg-white rounded-xl shadow-2xl p-5 w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-lg font-bold mb-2"
              style={{ color: viewingMessage.color || "#1a1a1a" }}
            >
              {viewingMessage.firstName} {viewingMessage.lastName}
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap text-sm">
              {viewingMessage.message}
            </p>
            {viewingMessage.imagePath && (
              <img
                src={`/api/uploads/${viewingMessage.imagePath}`}
                alt="Image jointe"
                className="mt-3 rounded-lg w-full object-contain max-h-60"
              />
            )}
            <button
              onClick={() => setViewingMessage(null)}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
            >
              {tr.viewClose}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
