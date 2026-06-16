"use client";

import { useState } from "react";
import { Play } from "lucide-react";

import { cn } from "@/lib/utils";

const DEMO_VIDEO_ID = "jyIjnUqIFNY";

type DemoVideoProps = {
  className?: string;
};

export function DemoVideo({ className }: DemoVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl"
      />
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card elevation-featured ring-1 ring-primary/10">
        <div className="relative aspect-video">
          {isPlaying ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${DEMO_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`}
              title="App Pulse Check demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              className="group absolute inset-0 flex flex-col items-center justify-center"
              aria-label="Play App Pulse Check demo video"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://img.youtube.com/vi/${DEMO_VIDEO_ID}/hqdefault.jpg`}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/35" />
              <div className="relative flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-white/20 transition-transform group-hover:scale-105 sm:size-[4.5rem]">
                <Play className="size-7 fill-current pl-0.5 sm:size-8" />
              </div>
              <span className="relative mt-4 text-sm font-semibold text-white drop-shadow-sm">
                Watch the demo
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
