import { redirect } from "next/navigation";
import { mockApi } from "@/lib/mockApi";

export default function HomePage() {
  redirect(`/brands/${mockApi.DEFAULT_BRAND_ID}/today`);
}
