import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { isRealApiMode } from "@/lib/env";
import { mockApi } from "@/lib/mockApi";

export default async function HomePage() {
  // In real mode, get first brand from backend; in mock mode, use default
  if (isRealApiMode()) {
    const brands = await api.listBrands();
    if (brands.length > 0) {
      redirect(`/brands/${brands[0].id}/today`);
    }
    // No brands exist - redirect to create brand page
    redirect("/brands/new");
  }

  redirect(`/brands/${mockApi.DEFAULT_BRAND_ID}/today`);
}
