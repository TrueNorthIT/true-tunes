import { createRef, useRef, useState, useCallback, useEffect } from "react";
import { useQueue } from "@providers/QueueProvider";
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
    useEffect(() => {
        setCurrentlyPlayingIndex(queue.currentTrackIndex - 1);
    }, [queue.currentTrackIndex]);
    
    const [isSmall, setIsSmall] = useState(false);
    const [hideALbumArt, setHideAlbumArt] = useState(false);

    const selectedTracks: number[] = [];

    // Get access to the breakpoint system
    const { registerBreakpoint } = useAsideBreakpoint();
    let breakpoint_400: Breakpoint = null;
    let breakpoint_200: Breakpoint = null;
    // Use breakpoint system to track screen size changes
    useEffect(() => {
        breakpoint_400 = registerBreakpoint(400, setIsSmall);
        breakpoint_200 = registerBreakpoint(300, setHideAlbumArt);
        return () => {
            breakpoint_400.unsubscribe();
            breakpoint_200.unsubscribe();
        }
    }, [registerBreakpoint]);

    // Set up refs for each track in the queue
    if (trackRefs.current.length !== queue.queue.length) {
        trackRefs.current = Array(queue.queue.length)
            .fill(null)
            .map((_, i) => trackRefs.current[i] || createRef());
    }

    const moveTrack = useCallback((fromIndex, toIndex) => {
        fromIndex += 1;
        if (toIndex === fromIndex) toIndex += 1;
        console.log(`We are moving track from ${fromIndex} to before ${toIndex+1}`);

        if (!selectedTracks.includes(fromIndex-1)) {
            selectedTracks.reverse();
            selectedTracks.push(fromIndex-1);
            selectedTracks.reverse();
        }

        console.log('Selected Tracks: ', selectedTracks);

        // Now we have to move the selected items as well. selectedTracks may not be contiguous, so we have to split it into an array of contiguous ranges
        let contiguousRanges = selectedTracks.reduce((acc: number[][], num: number, index: number) => {
            if (index === 0 || num !== selectedTracks[index - 1] + 1) acc.push([num]);
            else acc[acc.length - 1].push(num);            
            return acc;
        }, []);

        console.log('Contiguous Ranges: ', contiguousRanges);

        

        // Now we have to move the contiguous ranges
        contiguousRanges.forEach((range) => {
            // If the range is before the insertion point, we have to adjust the insertion point
            if (range[0] < fromIndex && range[range.length-1] < toIndex) toIndex -= range.length;
            // If the range is after the insertion point, we have to adjust the insertion point
            else if (range[0] > fromIndex && range[range.length-1] > toIndex) toIndex += range.length;

            queue.reorderTracksInQueue(range[0]+1, range.length, toIndex+1);
        });

    }, [queue, currentlyPlayingIndex]);


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
                        key={index}
                        index={index}
                        showImage={!hideALbumArt}
                        onSelectChange={(isSelected) => {
                            if (isSelected) selectedTracks.push(index);
                            else selectedTracks.splice(selectedTracks.indexOf(index), 1);
                        }}
                    />
                    <Seperator></Seperator>
                </DraggableTrack>
            ))}
        </div>
    );
}
