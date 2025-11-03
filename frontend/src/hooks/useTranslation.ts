import { useState } from "react";
import api from "@tpfinal/api";

type Result = {
  loading: boolean;
  error: string | null;
  translated: string | null;
  sourceLang: string | null;
  translate: (opts: { text: string; postId: string; force?: boolean }) => Promise<void>;
  clear: () => void;
};

function getBrowserLang() {
  const nav = (typeof navigator !== "undefined" ? navigator : null) as any;
  const lang = nav?.language || (nav?.languages && nav.languages[0]) || "en";
  return lang.slice(0, 2).toUpperCase();
}

function cacheKey(postId: string, targetLang: string) {
  return `trcache:${postId}:${targetLang}`;
}

export default function useTranslation(): Result {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translated, setTranslated] = useState<string | null>(null);
  const [sourceLang, setSourceLang] = useState<string | null>(null);

  async function translate({
    text,
    postId,
    force = false,
  }: {
    text: string;
    postId: string;
    force?: boolean;
  }) {
    setError(null);
    setTranslated(null);
    setSourceLang(null);

    if (!text) {
      setError("No text provided");
      return;
    }

    const targetLang = getBrowserLang();
    const key = cacheKey(postId, targetLang);

    // try cache first
    if (!force) {
      const cached = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setTranslated(parsed.translatedText);
          setSourceLang(parsed.detectedSourceLang || null);
          return;
        } catch {
        }
      }
    }

    setLoading(true);
    try {
      const { data } = await api.post("/translate", { text, targetLang });

      const translatedText = data.translatedText || data.translated || null;
      const detectedSourceLang = data.detectedSourceLang || null;

      setTranslated(translatedText);
      setSourceLang(detectedSourceLang);

      // save to cache
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify({ translatedText, detectedSourceLang }));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Translation failed");
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    setTranslated(null);
    setSourceLang(null);
    setError(null);
  }

  return { loading, error, translated, sourceLang, translate, clear };
}
