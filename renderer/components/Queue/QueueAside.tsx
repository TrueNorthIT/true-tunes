import { Breakpoint, useAsideBreakpoint } from "@providers/AsideBreakpointContext";
import { QueueProvider } from "@providers/QueueProvider";
import NowPlayingCard from "@components/Queue/nowPlayingCard";
import QueueHeader from "@components/Queue/QueueHeader";
import Queue from "@components/Queue/queue";
import { useEffect, useState } from "react";

export default function QueueAside() {
    const { width: sidebarWidth, sidebarHeight, asideRef, nowPlayingCardRef, registerBreakpoint} = useAsideBreakpoint();

    const [isSmall, setIsSmall] = useState(false);
    let breakpoint: Breakpoint = null;
    useEffect(() => {
        breakpoint = registerBreakpoint(400, setIsSmall);
        return () => breakpoint.unsubscribe();
    }, [registerBreakpoint]);

    return (
        <aside
            ref={asideRef}
            style={{ width: `${sidebarWidth}px`, height: `${sidebarHeight}px` }}
            className={"relative flex-shrink-0 px-4 py-6 h-full" + (isSmall ? " px-2" : "")}
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

