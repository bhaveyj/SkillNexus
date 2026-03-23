"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground/50 tracking-wide">
              Track your progress and
            </p>
            <h1
              className="text-5xl md:text-[5.5rem] font-extrabold leading-none tracking-tight"
              style={{
                background: "linear-gradient(135deg, #f0ebff 0%, #c4b5fd 40%, #a78bfa 70%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Masterclasses
            </h1>
          </div>
        }
      >
        <img
          src="/image.png"
          alt="SkillNexus dashboard"
          height={720}
          width={1400}
          className="mx-auto rounded-xl object-cover h-full object-left-top"
          draggable={false}
        />
      </ContainerScroll>
      <div className="section-divider"/>
    </div>
  );
}