"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type AnalyticsPageViewProps = {
  measurementId: string;
};

function PageViewTracker({ measurementId }: AnalyticsPageViewProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const queryString = searchParams.toString();
    const pagePath = queryString ? `${pathname}?${queryString}` : pathname;

    window.gtag?.("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
      send_to: measurementId
    });
  }, [measurementId, pathname, searchParams]);

  return null;
}

export function AnalyticsPageView(props: AnalyticsPageViewProps) {
  return (
    <Suspense fallback={null}>
      <PageViewTracker {...props} />
    </Suspense>
  );
}
