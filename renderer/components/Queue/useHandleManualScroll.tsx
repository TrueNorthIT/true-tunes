import { useEffect } from "react";

export function useHandleManualScroll(queueContainerRef, queue, isProgrammaticScrollRef) {
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
}
