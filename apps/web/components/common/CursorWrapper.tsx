"use client";
import React from "react";

interface CursorWrapperProps {
  children?: React.ReactNode;
}
const CursorWrapper = ({ children }: CursorWrapperProps) => {
  const handleMove = (event: React.MouseEvent | React.TouchEvent) => {
    let clientX, clientY;

    if ("touches" in event) {
      // Touch event
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      // Mouse event
      clientX = event.clientX;
      clientY = event.clientY;
    }

    document.documentElement.style.setProperty(
      "--x",
      `${clientX + window.screenX}px`
    );
    document.documentElement.style.setProperty(
      "--y",
      `${clientY + window.screenY}px`
    );
  };

  return (
    <div
      id="cursor-wrapper"
      onMouseMove={handleMove} // Handle mouse movement
      onTouchMove={handleMove} // Handle touch movement
      className="fixed top-0 left-0 right-0 bottom-0 max-w-screen min-h-full max-h-screen bg-transparent pointer-events-auto"
    >
      <div
        id="cursor"
        className={`absolute pointer-events-none bg-transparent border-2 border-indigo-700 rounded-full w-12 h-12 transition-transform transform-gpu z-1001 will-change-transform -translate-1/2 top-[var(--y)] left-[var(--x)]`}
      />
      <div className="h-full overflow-y-auto scrollbar-none">{children}</div>
    </div>
  );
};

export default CursorWrapper;
