"use client";

import { useEffect, useState } from "react";
import { CONFIG, getApiUrl } from "@/lib/config";
import { getToken } from "@/lib/auth";

export function DynamicFavicon() {
  const [faviconUrl, setFaviconUrl] = useState("https://framerusercontent.com/images/OmiFNAsUnVnklI6y2SA9EWiDJBk.png?width=915&height=273");

  useEffect(() => {
    // Try to get favicon from localStorage first (app setting - not auth data)
    const savedFavicon = localStorage.getItem("APP_FAVICON_URL");
    if (savedFavicon) {
      setFaviconUrl(savedFavicon);
    }

    // Also try to fetch from API if token exists
    const fetchFavicon = async () => {
      try {
        const token = getToken(); // sessionStorage se token lo
        if (!token) return;
        
        const res = await fetch(getApiUrl(CONFIG.API.ADMIN_SETTINGS), {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.APP_FAVICON_URL) {
            setFaviconUrl(data.APP_FAVICON_URL);
            localStorage.setItem("APP_FAVICON_URL", data.APP_FAVICON_URL); // favicon cache - ok
          }
        }
      } catch {
        // Ignore errors, use default
      }
    };

    fetchFavicon();

    // Listen for storage changes (when admin updates settings)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "APP_FAVICON_URL" && e.newValue) {
        setFaviconUrl(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <>
      <link rel="icon" href={faviconUrl} type="image/png" />
      <link rel="shortcut icon" href={faviconUrl} type="image/png" />
    </>
  );
}
