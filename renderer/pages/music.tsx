'use client'

import { useEffect, useRef, useState } from "react";
import NowPlayingCard from "../components/nowPlayingCard";
import { useSonosContext } from "../components/providers/SonosContext";
import Queue from "../components/queue";
import SearchBar from "../components/SearchBar";


export default function Music() {

  const sonosState = useSonosContext();


  const [sidebarWidth, setSidebarWidth] = useState(640); // 40rem in pixels
  const [sidebarHeight, setSidebarHeight] = useState(0); 

  const asideRef = useRef(null);
  const mainRef = useRef(null);
  const isResizing = useRef(false);
  const nowPlayingCard = useRef(null);


  const handleMouseDown = () => {
    isResizing.current = true;
  };

  const handleMouseMove = (e) => {
    if (isResizing.current) {
      const newWidth = e.clientX - asideRef.current.offsetLeft;
      setSidebarWidth(newWidth);
      setSidebarHeight(mainRef.current.clientHeight - (nowPlayingCard.current.clientHeight + 80));
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
  };

  useEffect(() => {

    setSidebarHeight(mainRef.current.clientHeight - (nowPlayingCard.current.clientHeight + 80));

    window.onresize = () => {
      setSidebarHeight(mainRef.current.clientHeight - (nowPlayingCard.current.clientHeight + 80));
    };

    return () => {
      window.onresize = null;
    };


  }, []);





  return (
    <div
      className="flex h-screen overflow-y-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Sidebar */}
      <aside
        ref={asideRef}
        style={{ width: `${sidebarWidth}px`, height: `${sidebarHeight}px` }}
        className="relative flex-shrink-0  px-4 py-6 sm:px-6 lg:px-8 h-full"
      >
        <div ref={nowPlayingCard}>
          <NowPlayingCard />
        </div>
        <div className={"overflow-y-auto mt-4 slick-scrollbar h-full"}>
          <Queue />
        </div>
        {/* Resizer Handle */}
      </aside>

      {/* Main Content */}
      <main
        ref={mainRef}
        className="flex-grow px-4 py-10 sm:px-6 lg:px-8 lg:py-6 relative"
      >
        <div
          onMouseDown={handleMouseDown}
          className="absolute left-0 right-0  top-0 h-full w-2 cursor-col-resize bg-gray-300"
        ></div>
        
            <pre>{JSON.stringify(sonosState, null, 2)}</pre> {/* Pretty print the JSON */}
            
        <SearchBar />
      </main>
    </div>
  );
}