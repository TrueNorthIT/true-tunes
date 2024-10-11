import { createRef, useEffect, useRef, useState, useCallback } from "react";
import TrackEntity from "./result-types/trackEntity";
import { useQueue } from "./providers/QueueProvider";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ITEM_TYPE = "TRACK";

type DragItem = {
    index: number;
};


function DraggableTrack({ track, index, moveTrack, currentlyPlayingIndex, isSmall, trackRef }) {
    const [, ref] = useDrag({
        type: ITEM_TYPE,
        item: { index },
    });

    const [, drop] = useDrop({
        accept: ITEM_TYPE,
        hover: (draggedItem: DragItem) => {
            if (draggedItem.index !== index) {
                moveTrack(draggedItem.index, index);
                draggedItem.index = index; // Update dragged item's index
            }
        },
    });

    // Combine drag and drop refs with the track ref
    const combinedRef = (node) => {
        ref(node);
        drop(node);
        if (trackRef) {
            trackRef.current = node;
        }
    };

    return (
        <div ref={combinedRef}>
            <TrackEntity entity={track} playing={currentlyPlayingIndex === index} small={isSmall} />
        </div>
    );
}

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

    const moveTrack = useCallback((fromIndex, toIndex) => {
        const updatedQueue = [...queue.queue];
        const [movedTrack] = updatedQueue.splice(fromIndex, 1);
        updatedQueue.splice(toIndex, 0, movedTrack);

        if (fromIndex === currentlyPlayingIndex) {
            setCurrentlyPlayingIndex(toIndex);
        }

        // Update the queue with the rearranged tracks
        queue.setQueue(updatedQueue);
    }, [queue]);

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

    useEffect(() => {
        if (queue.followingQueue && trackRefs.current[currentlyPlayingIndex] && queueContainerRef.current) {
            const trackElement = trackRefs.current[currentlyPlayingIndex].current;
            const container = queueContainerRef.current;

            isProgrammaticScrollRef.current = true;

            const targetScrollTop = trackElement.offsetTop - (container.clientHeight + (isSmall ? 600 : 100)) / 2;

            container.scrollTo({
                top: targetScrollTop,
                behavior: "smooth",
            });

            setTimeout(() => {
                isProgrammaticScrollRef.current = false;
            }, 500);
        }
    }, [queue.followingQueue, currentlyPlayingIndex]);

    const handleManualScroll = () => {
        if (isProgrammaticScrollRef.current) {
            return;
        }
        if (queue.followingQueue) {
            queue.setFollowingQueue(false);
        }
    };

    useEffect(() => {
        const container = queueContainerRef.current;
        if (!container) return;

        container.addEventListener("wheel", handleManualScroll);
        container.addEventListener("touchmove", handleManualScroll);

        return () => {
            container.removeEventListener("wheel", handleManualScroll);
            container.removeEventListener("touchmove", handleManualScroll);
        };
    }, [queue.followingQueue]);

    useEffect(() => {
        const updateScreenSize = () => {
            if (queueContainerRef.current) {
                setIsSmall(queueContainerRef.current.clientWidth <= 392);
            }
        };

        updateScreenSize();
    }, [queueContainerRef.current?.clientWidth]);

    return (
        <div ref={queueContainerRef} className="overflow-y-auto h-full slick-scrollbar">
            {queue.queue.map((track, index) => (
                <DraggableTrack
                    key={index}
                    index={index}
                    track={track}
                    moveTrack={moveTrack}
                    currentlyPlayingIndex={currentlyPlayingIndex}
                    isSmall={isSmall}
                    trackRef={trackRefs.current[index]}
                />
            ))}
        </div>
    );
}
