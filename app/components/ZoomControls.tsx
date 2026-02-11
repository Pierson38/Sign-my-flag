"use client";

import { Lang, t } from "@/lib/i18n";

interface ZoomControlsProps {
  zoom: number;
  lang: Lang;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export default function ZoomControls({
  zoom,
  lang,
  onZoomIn,
  onZoomOut,
  onReset,
}: ZoomControlsProps) {
  const tr = t(lang);

  return (
    <div className="flex items-center gap-1 bg-white/80 backdrop-blur rounded-lg shadow-sm p-1">
      <button
        onClick={onZoomOut}
        className="w-8 h-8 flex items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 transition-colors text-base font-bold"
        title={tr.zoomOut}
      >
        -
      </button>
      <button
        onClick={onReset}
        className="px-2 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors text-xs font-medium rounded-md"
        title={tr.zoomReset}
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        onClick={onZoomIn}
        className="w-8 h-8 flex items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 transition-colors text-base font-bold"
        title={tr.zoomIn}
      >
        +
      </button>
    </div>
  );
}
