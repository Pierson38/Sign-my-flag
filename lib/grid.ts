// Grid system for the California flag
// The flag is divided into a grid. Some cells are "reserved" (bear, text, star, red stripe).
// When all available cells are taken, the grid subdivides (resolution x2).
// Messages can span multiple columns based on message length.

export const BASE_COLS = 16;
export const BASE_ROWS = 10;

// Reserved zones — multiple tight boxes to follow the actual flag elements.
// Coordinates are percentages of the image (0-1).
// The bear is split into 3 zones to approximate its silhouette and free up
// cells between the star, above the bear, and between grass/text.
const RESERVED_ZONES = [
  // Star (upper-left)
  { name: "star", x1: 0.07, y1: 0.05, x2: 0.17, y2: 0.20 },

  // Bear — upper back (narrower, the hump area)
  { name: "bear-back", x1: 0.27, y1: 0.20, x2: 0.77, y2: 0.34 },
  // Bear — main body + head (wider, includes head/snout on the left)
  { name: "bear-body", x1: 0.21, y1: 0.34, x2: 0.77, y2: 0.52 },
  // Bear — legs and lower body
  { name: "bear-legs", x1: 0.21, y1: 0.52, x2: 0.77, y2: 0.59 },

  // Grass patch under the bear
  { name: "grass", x1: 0.17, y1: 0.57, x2: 0.82, y2: 0.67 },

  // Text "CALIFORNIA REPUBLIC"
  { name: "text", x1: 0.14, y1: 0.69, x2: 0.86, y2: 0.80 },

  // Red stripe at the bottom
  { name: "stripe", x1: 0.0, y1: 0.84, x2: 1.0, y2: 1.0 },
];

export interface MessageWithSpan {
  gridRow: number;
  gridCol: number;
  spanCols: number;
}

export interface GridInfo {
  level: number;
  cols: number;
  rows: number;
  reservedCells: Set<string>;
  occupiedCells: Set<string>;
  availableCells: string[];
}

/** Create a cell key from row and column */
export function cellKey(row: number, col: number): string {
  return `${row}-${col}`;
}

/** Parse a cell key back to row and column */
export function parseKey(key: string): { row: number; col: number } {
  const [row, col] = key.split("-").map(Number);
  return { row, col };
}

/** Check if a cell is in a reserved zone */
export function isCellReserved(
  row: number,
  col: number,
  totalRows: number,
  totalCols: number
): boolean {
  const cx = (col + 0.5) / totalCols;
  const cy = (row + 0.5) / totalRows;

  for (const zone of RESERVED_ZONES) {
    if (cx >= zone.x1 && cx <= zone.x2 && cy >= zone.y1 && cy <= zone.y2) {
      return true;
    }
  }
  return false;
}

/** Get all reserved cells for a given grid size */
export function getReservedCells(rows: number, cols: number): Set<string> {
  const reserved = new Set<string>();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (isCellReserved(r, c, rows, cols)) {
        reserved.add(cellKey(r, c));
      }
    }
  }
  return reserved;
}

/**
 * Calculate desired span based on message length.
 * Short messages → 1 cell, longer → up to 4 cells.
 */
export function computeDesiredSpan(messageLength: number): number {
  if (messageLength <= 20) return 1;
  if (messageLength <= 50) return 2;
  if (messageLength <= 100) return 3;
  return 4;
}

/**
 * Calculate the actual span for a message at a given position,
 * capped by grid bounds + available cells to the right.
 */
export function computeActualSpan(
  desiredSpan: number,
  row: number,
  col: number,
  cols: number,
  reservedCells: Set<string>,
  occupiedCells: Set<string>
): number {
  let span = Math.min(desiredSpan, cols - col); // don't exceed grid width
  // Shrink span if any cell to the right is reserved or occupied
  for (let i = 0; i < span; i++) {
    const key = cellKey(row, col + i);
    if (reservedCells.has(key) || occupiedCells.has(key)) {
      span = i; // stop before this cell
      break;
    }
  }
  return Math.max(span, 1); // minimum 1
}

/** Calculate the current grid level based on total occupied cell count */
export function computeGridLevel(occupiedCellCount: number): number {
  let level = 1;
  let cols = BASE_COLS;
  let rows = BASE_ROWS;

  while (true) {
    const reserved = getReservedCells(rows, cols);
    const totalCells = rows * cols;
    const availableCount = totalCells - reserved.size;

    if (occupiedCellCount < availableCount) {
      return level;
    }

    level++;
    cols *= 2;
    rows *= 2;

    if (level > 5) return 5;
  }
}

/** Get grid dimensions for a given level */
export function getGridDimensions(level: number): {
  rows: number;
  cols: number;
} {
  const factor = Math.pow(2, level - 1);
  return {
    rows: BASE_ROWS * factor,
    cols: BASE_COLS * factor,
  };
}

/**
 * Compute full grid info given messages with their spans.
 */
export function computeGridInfo(messages: MessageWithSpan[]): GridInfo {
  // Total occupied cells = sum of all spans
  const totalOccupied = messages.reduce(
    (sum, m) => sum + (m.spanCols || 1),
    0
  );

  const level = computeGridLevel(totalOccupied);
  const { rows, cols } = getGridDimensions(level);
  const reservedCells = getReservedCells(rows, cols);

  // Mark all cells covered by each message (origin + span) as occupied
  const occupiedCells = new Set<string>();
  for (const msg of messages) {
    const span = msg.spanCols || 1;
    for (let i = 0; i < span; i++) {
      occupiedCells.add(cellKey(msg.gridRow, msg.gridCol + i));
    }
  }

  const availableCells: string[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = cellKey(r, c);
      if (!reservedCells.has(key) && !occupiedCells.has(key)) {
        availableCells.push(key);
      }
    }
  }

  return {
    level,
    cols,
    rows,
    reservedCells,
    occupiedCells,
    availableCells,
  };
}
