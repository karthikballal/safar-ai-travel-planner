"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackClientEvent } from "@/lib/analytics";

export default function AnalyticsBootstrap() {
  const pathname = usePathname();

  useEffect(() => {
    trackClientEvent("page_view", {
      page_path: pathname,
    });
  }, [pathname]);

  return null;
}
