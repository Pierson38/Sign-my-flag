import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  computeGridInfo,
  computeDesiredSpan,
  computeActualSpan,
  cellKey,
} from "@/lib/grid";

export async function GET() {
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    firstName,
    lastName,
    email,
    message,
    gridRow,
    gridCol,
    color,
    size,
    imagePath,
  } = body;

  // Validate required fields
  if (
    !firstName ||
    !lastName ||
    !email ||
    !message ||
    gridRow == null ||
    gridCol == null
  ) {
    return NextResponse.json(
      { error: "Tous les champs sont requis." },
      { status: 400 }
    );
  }

  // Get current grid state
  const allMessages = await prisma.message.findMany({
    select: { gridRow: true, gridCol: true, spanCols: true },
  });

  const gridInfo = computeGridInfo(allMessages);

  // Check origin cell is available
  const key = cellKey(gridRow, gridCol);
  if (gridInfo.reservedCells.has(key)) {
    return NextResponse.json(
      { error: "Cette zone est reservee." },
      { status: 400 }
    );
  }
  if (gridInfo.occupiedCells.has(key)) {
    return NextResponse.json(
      { error: "Cette cellule est deja prise." },
      { status: 409 }
    );
  }

  // Calculate span based on message length, capped to available space
  const desiredSpan = computeDesiredSpan(message.length);
  const spanCols = computeActualSpan(
    desiredSpan,
    gridRow,
    gridCol,
    gridInfo.cols,
    gridInfo.reservedCells,
    gridInfo.occupiedCells
  );

  const newMessage = await prisma.message.create({
    data: {
      firstName,
      lastName,
      email,
      message,
      gridRow,
      gridCol,
      spanCols,
      color: color || "#1a1a1a",
      size: size || "medium",
      imagePath: imagePath || null,
    },
  });

  return NextResponse.json(newMessage, { status: 201 });
}
