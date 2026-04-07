"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

// Redirect /guide/[topic] → /guide#[topic]
export default function GuideTopicRedirect() {
  const router = useRouter();
  const params = useParams();
  const topic = params.topic as string;

  useEffect(() => {
    router.replace(`/guide#${topic}`);
  }, [router, topic]);

  return null;
}
