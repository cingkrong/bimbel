"use client";

import { useEffect } from "react";
import { trackMetaClientEvent } from "@/components/analytics/MetaPixelProvider";

export function TrackViewContent({
  contentName,
  value,
}: {
  contentName: string;
  value?: number;
}) {
  useEffect(() => {
    trackMetaClientEvent("ViewContent", {
      content_name: contentName,
      content_category: "Tryout & Bimbel Kedinasan",
      currency: "IDR",
      value: value || 99000,
    });
  }, [contentName, value]);

  return null;
}
