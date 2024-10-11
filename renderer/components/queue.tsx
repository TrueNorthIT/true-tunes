import { useSonosContext } from "./providers/SonosContext";
import Image, { StaticImageData } from "next/image";
import { createRef, useEffect, useRef, useState } from "react";

import truenorth_logo from "../public/images/truenorth_logo.png";
import TrackEntity from "./result-types/trackEntity";
import { Track } from "@svrooij/sonos/lib/models";
import { useQueue } from "./providers/QueueProvider";

export default function Queue() {
    const queue = useQueue();
    const trackRefs = useRef([]); // Array to store refs for each track
    const queueContainerRef = useRef<HTMLDivElement>(null); // Ref for the div containing the tracks

    const [currentlyPlayingIndex, setCurrentlyPlayingIndex] = useState(queue.currentTrackIndex);
    const isProgrammaticScrollRef = useRef(false); // Track programmatic scrolls
    const [isSmall, setIsSmall] = useState(false);

    // Set up refs for each track in the queue
    if (trackRefs.current.length !== queue.queue.length) {
        trackRefs.current = Array(queue.queue.length)
            .fill(null)
            .map((_, i) => trackRefs.current[i] || createRef());
    }

    // Update currently playing track index based on arrow key presses
    useEffect(() => {
        const onKeyPress = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                setCurrentlyPlayingIndex((prev) => Math.max(prev - 1, 0)); // Prevent negative index
            } else if (e.key === "ArrowRight") {
                setCurrentlyPlayingIndex((prev) => Math.min(prev + 1, queue.queue.length - 1)); // Prevent overflow
            }
        };

        window.addEventListener("keydown", onKeyPress);

        return () => {
            window.removeEventListener("keydown", onKeyPress);
        };
    }, [queue.queue.length]);

    // Scroll to the currently playing track when queue.followingQueue is true
    useEffect(() => {
        if (queue.followingQueue && trackRefs.current[currentlyPlayingIndex] && queueContainerRef.current) {
            const trackElement = trackRefs.current[currentlyPlayingIndex].current;
            const container = queueContainerRef.current;

            // Mark this scroll as programmatic
            isProgrammaticScrollRef.current = true;

            // debugger;
            // Scroll only the div container, not the entire viewport
            const targetScrollTop = trackElement.offsetTop  - (container.clientHeight + (isSmall ? 600 : 100)) / 2; // Center the track in view

            container.scrollTo({
                top: targetScrollTop,
                behavior: "smooth",
            });

            // Allow manual scroll detection again after a brief delay
            setTimeout(() => {
                isProgrammaticScrollRef.current = false;
            }, 500); // Reset after scroll finishes
        }
    }, [queue.followingQueue, currentlyPlayingIndex]);

    // Handle manual scrolling from mouse wheel or touch events
    const handleManualScroll = () => {
        if (isProgrammaticScrollRef.current) {
            // Ignore the event if it was a programmatic scroll
            return;
        }

        // If it's a manual scroll, set followingQueue to false
        if (queue.followingQueue) {
            queue.setFollowingQueue(false); // Disable followingQueue after manual scroll
        }
    };

    // Listen for manual scroll events: mouse wheel and touchmove
    useEffect(() => {
        const container = queueContainerRef.current;
        if (!container) return;

        // Attach event listeners for wheel (mouse scroll) and touchmove (touch devices)
        container.addEventListener('wheel', handleManualScroll);
        container.addEventListener('touchmove', handleManualScroll);

        return () => {
            // Cleanup event listeners
            container.removeEventListener('wheel', handleManualScroll);
            container.removeEventListener('touchmove', handleManualScroll);
        };
    }, [queue.followingQueue]);

    
    useEffect(() => {
        const updateScreenSize = () => {
            if (queueContainerRef.current) {
                setIsSmall(queueContainerRef.current.clientWidth <= 392);
            }
        };

        // Call the function once on mount
        updateScreenSize();


    }, [queueContainerRef.current?.clientWidth]);

    return (
        <div
            ref={queueContainerRef}
            className="overflow-y-auto h-full slick-scrollbar"
        >
            {queue.queue.map((track, index) => (
                <div
                    key={index}
                    ref={trackRefs.current[index]} // Assign ref to each track
                >
                    <TrackEntity
                        entity={track}
                        playing={currentlyPlayingIndex === index}
                        small={isSmall}
                    />
                </div>
            ))}
        </div>
    );
}
