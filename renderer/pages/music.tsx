'use client'

import { useRef, useState } from "react";
import NowPlayingCard from "../components/nowPlayingCard";
import { useSonosContext } from "../components/providers/SonosContext";
import Queue from "../components/queue";
import SearchBar from "../components/SearchBar";


export default function Music() {
  
  const [sidebarWidth, setSidebarWidth] = useState(640); // 40rem in pixels
  const asideRef = useRef(null);
  const mainRef = useRef(null);
  const isResizing = useRef(false);

  const handleMouseDown = () => {
    isResizing.current = true;
  };

  const handleMouseMove = (e) => {
    if (isResizing.current) {
      const newWidth = e.clientX - asideRef.current.offsetLeft;
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
  };


  return (
    <div
      className="flex"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Sidebar */}
      <aside
        ref={asideRef}
        style={{ width: `${sidebarWidth}px` }}
        className="relative flex-shrink-0 border-r border-gray-200 px-4 py-6 sm:px-6 lg:px-8"
      >
        <div>
          <NowPlayingCard />
        </div>
        <div className="overflow-y-auto h-[calc(100vh-16rem)] mt-4 slick-scrollbar">
          <Queue />
        </div>
        {/* Resizer Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 right-0 h-full w-2 cursor-col-resize bg-gray-300"
        ></div>
      </aside>

      {/* Main Content */}
      <main
        ref={mainRef}
        className="flex-grow px-4 py-10 sm:px-6 lg:px-8 lg:py-6"
      >
        <SearchBar />
      </main>
    </div>
  );
}