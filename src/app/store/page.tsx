import { notFound } from "next/navigation";
import { SHOP_ENABLED } from "@/lib/siteFeatures";
import Storefront from "./Storefront";

export default function StorePage() {
  if (!SHOP_ENABLED) notFound();
  return <Storefront />;
}
