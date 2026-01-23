import { TodayBoardClient } from "./TodayBoardClient";
import { getTodayBoardServer } from "@/lib/api/server";
import { adaptTodayBoard } from "@/lib/todayAdapter";

interface TodayPageProps {
  params: Promise<{ brandId: string }>;
}

export default async function TodayPage({ params }: TodayPageProps) {
  const { brandId } = await params;

  // Fetch TodayBoard from backend API (server-side)
  const backendBoard = await getTodayBoardServer(brandId);

  // Adapt backend DTO to UI types
  const uiBoard = adaptTodayBoard(backendBoard);

  return (
    <TodayBoardClient
      brandId={brandId}
      board={uiBoard}
    />
  );
}
