import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeGridInfo } from "@/lib/grid";

export async function GET() {
  const messages = await prisma.message.findMany({
    select: { gridRow: true, gridCol: true, spanCols: true },
  });

  const gridInfo = computeGridInfo(messages);

  return NextResponse.json({
    level: gridInfo.level,
    cols: gridInfo.cols,
    rows: gridInfo.rows,
    reservedCells: Array.from(gridInfo.reservedCells),
    occupiedCells: Array.from(gridInfo.occupiedCells),
    availableCount: gridInfo.availableCells.length,
  });
}
