"use client";
import React, { useRef } from "react";
import Queue from "@components/Queue/queue";
import { useEffect, useState } from "react";
import QueueHeader from "@components/Queue/QueueHeader";
import { QueueProvider } from "@providers/QueueProvider";
import NowPlayingCard from "@components/Queue/nowPlayingCard";
import { useAsideBreakpoint } from "@providers/AsideBreakpointContext";

export default function QueueAside() {
    const { width: sidebarWidth, sidebarHeight, asideRef, nowPlayingCardRef, registerBreakpoint } = useAsideBreakpoint();

    const [isSmall, setIsSmall] = useState(false);

    const breakpointRef = useRef(null); // 👈 Create a ref

    useEffect(() => {
        breakpointRef.current = registerBreakpoint(400, setIsSmall);

        return () => {
            if (breakpointRef.current) {
                breakpointRef.current.unsubscribe();
            }
        };
    }, [registerBreakpoint]);

    return (
        <aside
            ref={asideRef}
            style={{ width: `${sidebarWidth}px`, height: `${sidebarHeight}px` }}
            className={"relative flex-shrink-0 pl-4 py-6 h-full" + (isSmall ? " pl-2" : "")}
        >
            <QueueProvider>
                <div ref={nowPlayingCardRef} >
                    <NowPlayingCard />
                    <QueueHeader />
                </div>
                <div className={"overflow-y-auto mt-4 slick-scrollbar h-full"}>
                    <Queue />
                </div>
            </QueueProvider>
        </aside>
    );
}

