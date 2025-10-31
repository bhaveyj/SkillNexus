import React from "react";

export function LoaderTwo() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-primary animate-spin"></div>
        <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-t-4 border-b-4 border-primary/30"></div>
      </div>
    </div>
  );
}
