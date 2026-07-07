import { useCallback, useMemo, useState, useRef } from "react";
import { LanguageContext } from "./languageContextCore";
import {
  getCachedTranslation,
  saveCachedTranslation,
  translateWithLibre,
} from "./translateApi";

const LANGUAGE_KEY = "buyerseller_selected_language";

const getInitialLanguage = () => {
  const stored = localStorage.getItem(LANGUAGE_KEY);
  return stored === "hi" ? "hi" : "en";
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getInitialLanguage);
  const [translations, setTranslations] = useState({});
  const pendingTextsRef = useRef(new Set());

  const setLanguage = useCallback((nextLanguage) => {
    const normalized = nextLanguage === "hi" ? "hi" : "en";
    localStorage.setItem(LANGUAGE_KEY, normalized);
    setLanguageState(normalized);
  }, []);

  const queueTranslation = useCallback(
    (text) => {
      const cleanText = String(text || "").trim();
      if (!cleanText || language !== "hi") return;
      if (translations[cleanText] || pendingTextsRef.current.has(cleanText)) return;

      pendingTextsRef.current.add(cleanText);

      setTimeout(() => {
        const cached = getCachedTranslation({
          source: "en",
          target: "hi",
          text: cleanText,
        });

        if (cached) {
          setTranslations((prev) => ({ ...prev, [cleanText]: cached }));
          pendingTextsRef.current.delete(cleanText);
          return;
        }

        translateWithLibre({
          source: "en",
          target: "hi",
          text: cleanText,
        })
          .then((translatedText) => {
            if (translatedText && translatedText !== cleanText) {
              saveCachedTranslation({
                source: "en",
                target: "hi",
                text: cleanText,
                translatedText,
              });
              setTranslations((prev) => ({ ...prev, [cleanText]: translatedText }));
            }
          })
          .finally(() => {
            pendingTextsRef.current.delete(cleanText);
          });
      }, 0);
    },
    [language, translations],
  );

  const translate = useCallback(
    (text) => {
      const cleanText = String(text || "");
      if (language === "en" || !cleanText.trim()) return cleanText;

      const cached =
        translations[cleanText] ||
        getCachedTranslation({
          source: "en",
          target: "hi",
          text: cleanText,
        });

      if (cached) return cached;

      queueTranslation(cleanText);
      return cleanText;
    },
    [language, queueTranslation, translations],
  );

  const translateDynamicText = useCallback(
    async (text, cacheKey) => {
      const cleanText = String(text || "");
      if (language === "en" || !cleanText.trim()) return cleanText;

      const cached = getCachedTranslation({
        cacheKey,
        source: "en",
        target: "hi",
        text: cleanText,
      });

      if (cached) return cached;

      return translateWithLibre({
        cacheKey,
        source: "en",
        target: "hi",
        text: cleanText,
      });
    },
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      translate,
      translateDynamicText,
    }),
    [language, setLanguage, translate, translateDynamicText],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
