import { redirect } from "next/navigation";
import { DEFAULT_BRAND_ID } from "@/demo/brands";

export default function HomePage() {
  redirect(`/brands/${DEFAULT_BRAND_ID}/today`);
}
