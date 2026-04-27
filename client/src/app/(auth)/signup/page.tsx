"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignupPage() {
  const router = useRouter();
  useEffect(() => {
    // Redirect to login page — signup is handled via flip card there
    router.replace("/login?mode=signup");
  }, [router]);
  return null;
}
