"use client";
import { useEffect, useRef, useState } from "react";

export default function InstallIosButton() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  // Cerrar al hacer clic fuera o presionar ESC
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (popRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  // Cerrar automáticamente tras 15 s
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => setOpen(false), 15000);
    return () => clearTimeout(id);
  }, [open]);

  return (
    <div className="relative inline-block">
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className="rounded-full px-4 py-2 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-[#D4B26A] border border-zinc-700/60 transition"
      >
        ▼ Install App iOS/Apple
      </button>

      {open && (
        <div
          ref={popRef}
          className="absolute bottom-full right-0 mb-3 w-[min(92vw,360px)] rounded-2xl border border-zinc-700/60 bg-black/95 backdrop-blur p-4 shadow-2xl text-[#D4B26A] text-center"
        >
          {/* Flecha inferior */}
          <svg
            className="absolute -bottom-2 right-6"
            width="22"
            height="12"
            viewBox="0 0 22 12"
          >
            <path d="M11 12 L22 0 H0 Z" fill="rgba(0,0,0,0.95)" />
            <path
              d="M11 12 L22 0 H0 Z"
              fill="none"
              stroke="rgb(63,63,70)"
              strokeOpacity="0.6"
            />
          </svg>

          <img
            src="/public-ios-hint.png"
            srcSet="/public-ios-hint.png 360w, /public-ios-hint@2x.png 720w, /public-ios-hint@3x.png 1080w"
            sizes="(max-width: 420px) 92vw, 360px"
            alt="Instrucciones para instalar SommelierPro AI en iPhone o iPad"
            className="w-[min(92vw,360px)] h-auto select-none rounded-2xl mx-auto"
          />
        </div>
      )}
    </div>
  );
}
