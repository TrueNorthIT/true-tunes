import { useEffect, useRef } from "react";

export function useScrollToCurrentTrack(
    currentlyPlayingIndex,
    trackRefs,
    queueContainerRef,
    queue,
    isSmall
) {
    const isProgrammaticScrollRef = useRef(false);

    useEffect(() => {
        if (queue.followingQueue && trackRefs.current[currentlyPlayingIndex] && queueContainerRef.current) {
            const trackElement = trackRefs.current[currentlyPlayingIndex].current;
            const container = queueContainerRef.current;

            isProgrammaticScrollRef.current = true;

            const targetScrollTop = trackElement.offsetTop - (container.clientHeight + (isSmall ? 850 : 100)) / 2;

            container.scrollTo({
                top: targetScrollTop,
                behavior: "smooth",
            });

            setTimeout(() => {
                isProgrammaticScrollRef.current = false;
            }, 500);
        }
    }, [queue.followingQueue, currentlyPlayingIndex]);

    return isProgrammaticScrollRef;
}
