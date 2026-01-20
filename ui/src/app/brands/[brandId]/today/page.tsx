import { TodayBoardClient } from "./TodayBoardClient";
import { realApi } from "@/lib/api/client";
import { adaptTodayBoard } from "@/lib/todayAdapter";

interface TodayPageProps {
  params: Promise<{ brandId: string }>;
}

export default async function TodayPage({ params }: TodayPageProps) {
  const { brandId } = await params;

  // Fetch TodayBoard from real backend API
  // Phase 1: Single GET call, no polling, no regenerate
  const backendBoard = await realApi.getTodayBoard(brandId);

  // Adapt backend DTO to UI types
  const uiBoard = adaptTodayBoard(backendBoard);

  return (
    <TodayBoardClient
      brandId={brandId}
      board={uiBoard}
    />
  );
}
