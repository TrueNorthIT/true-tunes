import { createRef, useRef, useState, useCallback, useEffect } from "react";
import { useQueue } from "@providers/QueueProvider";
import { useCurrentTrack } from "@components/Queue/useCurrentTrack";
import { useScrollToCurrentTrack } from "@components/Queue/useScrollToCurrentTrack";
import { useHandleManualScroll } from "@components/Queue/useHandleManualScroll";
import { Breakpoint, useAsideBreakpoint } from "@providers/AsideBreakpointContext"; // Import the breakpoint context
import TrackEntity from "@components/result-types/trackEntity";
import DraggableTrack from "@components/DraggableTrack ";
import Seperator from "@components/Seperator";

export default function Queue() {
    const queue = useQueue();
    const trackRefs = useRef([]); // Array to store refs for each track
    const queueContainerRef = useRef<HTMLDivElement>(null); // Ref for the div containing the tracks

    const [currentlyPlayingIndex, setCurrentlyPlayingIndex] = useState(queue.currentTrackIndex);
    const [isSmall, setIsSmall] = useState(false);

    // Get access to the breakpoint system
    const { registerBreakpoint } = useAsideBreakpoint();

    let breakpoint: Breakpoint = null;

    // Set up refs for each track in the queue
    if (trackRefs.current.length !== queue.queue.length) {
        trackRefs.current = Array(queue.queue.length)
            .fill(null)
            .map((_, i) => trackRefs.current[i] || createRef());
    }

    const moveTrack = useCallback((fromIndex, toIndex) => {
        const updatedQueue = [...queue.queue];
        const [movedTrack] = updatedQueue.splice(fromIndex, 1);
        updatedQueue.splice(toIndex, 0, movedTrack);

        if (fromIndex === currentlyPlayingIndex) {
            setCurrentlyPlayingIndex(toIndex);
        }

        if (toIndex === currentlyPlayingIndex) {
            setCurrentlyPlayingIndex(fromIndex);
        }

        // Update the queue with the rearranged tracks
        queue.setQueue(updatedQueue);
    }, [queue, currentlyPlayingIndex]);

    // Handle key events for track navigation
    useCurrentTrack(queue, setCurrentlyPlayingIndex);

    // Handle scrolling to the current track
    const isProgrammaticScrollRef = useScrollToCurrentTrack(
        currentlyPlayingIndex,
        trackRefs,
        queueContainerRef,
        queue,
        isSmall
    );

    // Handle manual scroll input
    useHandleManualScroll(queueContainerRef, queue, isProgrammaticScrollRef);

    // Use breakpoint system to track screen size changes
    useEffect(() => {
        breakpoint = registerBreakpoint(400, setIsSmall);
        return () => breakpoint.unsubscribe();
    }, [registerBreakpoint]);

    return (
        <div ref={queueContainerRef} className="overflow-y-auto h-full slick-scrollbar">
            {queue.queue.map((track, index) => (
                <DraggableTrack
                    key={index}
                    index={index}
                    moveTrack={moveTrack}
                    trackRef={trackRefs.current[index]}
                >
                    <TrackEntity
                        entity={track}
                        playing={currentlyPlayingIndex === index}
                        small={isSmall}
                    />
                    <Seperator></Seperator>
                </DraggableTrack>
            ))}
        </div>
    );
}
