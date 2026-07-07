const CACHE_KEY = "buyerseller_translation_cache_v1";
const API_URL =
  import.meta.env.VITE_LIBRETRANSLATE_URL ||
  "https://libretranslate.de/translate";

const readCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
};

const writeCache = (cache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Translation cache is optional; the app must keep working without it.
  }
};

const getCacheKey = ({ cacheKey, source, target, text }) =>
  cacheKey || `${source}:${target}:${text}`;

export const getCachedTranslation = ({
  cacheKey = "",
  source = "en",
  target = "hi",
  text,
}) => {
  const cache = readCache();
  return cache[getCacheKey({ cacheKey, source, target, text })] || "";
};

export const saveCachedTranslation = ({
  cacheKey = "",
  source = "en",
  target = "hi",
  text,
  translatedText,
}) => {
  if (!translatedText) return;

  const cache = readCache();
  cache[getCacheKey({ cacheKey, source, target, text })] = translatedText;
  writeCache(cache);
};

export const translateWithLibre = async ({
  cacheKey = "",
  source = "en",
  target = "hi",
  text,
}) => {
  const cleanText = String(text || "").trim();
  if (!cleanText || source === target) return cleanText;

  const cached = getCachedTranslation({
    cacheKey,
    source,
    target,
    text: cleanText,
  });
  if (cached) return cached;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(cleanText)}`;
    const response = await fetch(url);

    if (!response.ok) return cleanText;

    const data = await response.json();
    // Google Translate returns an array of arrays where the first element is the translated text chunks
    let translatedText = "";
    if (data && data[0]) {
      data[0].forEach((chunk) => {
        if (chunk[0]) translatedText += chunk[0];
      });
    } else {
      translatedText = cleanText;
    }
    
    saveCachedTranslation({
      cacheKey,
      source,
      target,
      text: cleanText,
      translatedText,
    });

    return translatedText;
  } catch {
    return cleanText;
  }
};
