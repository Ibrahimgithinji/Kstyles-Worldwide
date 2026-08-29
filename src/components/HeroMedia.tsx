"use client";
import { useEffect, useRef } from "react";

export default function HeroMedia({ hasVideo }: { hasVideo: boolean }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const box = boxRef.current;
      const media = mediaRef.current;
      if (!box || !media) return;
      const rect = box.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const total = rect.height + vh;
      const scrolled = vh - rect.top;
      const p = Math.max(0, Math.min(1, scrolled / total));
      const scale = 1 + p * 0.28;
      const shift = p * 20;
      media.style.transform = `scale(${scale.toFixed(3)}) translateY(-${shift.toFixed(2)}%)`;
      media.style.transformOrigin = "50% 18%";
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" ref={boxRef}>
      {hasVideo ? (
        <video
          ref={mediaRef as any}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="h-full w-full object-cover object-[50%_18%] will-change-transform"
        >
          <source src="/videos/brand.mp4" type="video/mp4" />
        </video>
      ) : (
        <img
          ref={mediaRef}
          src="/images/hero.jpg"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-[50%_18%] will-change-transform"
        />
      )}
    </div>
  );
}
