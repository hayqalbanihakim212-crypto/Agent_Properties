import { useState, useCallback, useRef, useEffect } from "react";

export const getPropertyUrl = (id) =>
  `${window.location.origin}/properti/${id}`;

// Di luar hook: tidak bergantung pada state/props
async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

export default function useShare(item) {
  const [shareStatus, setShareStatus] = useState(""); // "", "copied", "error"
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const showStatus = useCallback((s) => {
    setShareStatus(s);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShareStatus(""), 2000);
  }, []);

  const handleShare = useCallback(
    async (e) => {
      e?.stopPropagation(); // klik tombol tidak ikut membuka detail
      const url = getPropertyUrl(item.id);
      const text = `${item.title}\nRp ${Number(item.price).toLocaleString("id-ID")}\n${item.location}`;

      if (navigator.share) {
        try {
          await navigator.share({ title: item.title, text, url });
          return;
        } catch (err) {
          if (err.name === "AbortError") return;
        }
      }

      try {
        await copyText(`${text}\n${url}`);
        showStatus("copied");
      } catch {
        showStatus("error");
      }
    },
    [item, showStatus],
  );

  return { handleShare, shareStatus };
}
