import { createRef, useRef, useState, useCallback, useEffect } from "react";
import { useQueue } from "@providers/QueueProvider";
import { useScrollToCurrentTrack } from "@components/Queue/useScrollToCurrentTrack";
import { useHandleManualScroll } from "@components/Queue/useHandleManualScroll";
import { Breakpoint, useAsideBreakpoint } from "@providers/AsideBreakpointContext";
import TrackEntity from "@components/result-types/trackEntity";
import Seperator from "@components/Seperator";
import {
    closestCenter,
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DragOverlay } from "@dnd-kit/core";
import DraggableTrack from "@components/DraggableTrack ";

export default function Queue() {
    const queue = useQueue();
    const trackRefs = useRef([]);
    const queueContainerRef = useRef<HTMLDivElement>(null);

    const [currentlyPlayingIndex, setCurrentlyPlayingIndex] = useState(queue.currentTrackIndex);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isSmall, setIsSmall] = useState(false);
    const [hideALbumArt, setHideAlbumArt] = useState(false);

    const selectedTracks = useRef<number[]>([]);


    // Breakpoint management
    const { registerBreakpoint } = useAsideBreakpoint();
    useEffect(() => {
        const bp400 = registerBreakpoint(400, setIsSmall);
        const bp200 = registerBreakpoint(300, setHideAlbumArt);
        return () => {
            bp400.unsubscribe();
            bp200.unsubscribe();
        };
    }, [registerBreakpoint]);



    // Sync current track index
    useEffect(() => {
        setCurrentlyPlayingIndex(queue.currentTrackIndex - 1);
    }, [queue.currentTrackIndex]);

    // Scroll to current track
    const isProgrammaticScrollRef = useScrollToCurrentTrack(
        currentlyPlayingIndex,
        trackRefs,
        queueContainerRef,
        queue,
        isSmall
    );

    // Manual scroll handling
    useHandleManualScroll(queueContainerRef, queue, isProgrammaticScrollRef);

    const [optimisticQueue, setOptimisticQueue] = useState(queue.queue);

    useEffect(() => {
        // Whenever the queue changes from source (e.g. Sonos), update local state
        setOptimisticQueue(queue.queue);
    }, [queue.queue]);

    const items = optimisticQueue.map((_, i) => i.toString());

        // Setup track refs
        if (trackRefs.current.length !== optimisticQueue.length) {
            trackRefs.current = Array(queue.queue.length)
                .fill(null)
                .map((_, i) => trackRefs.current[i] || createRef());
        }


    // DnD setup
    const sensors = useSensors(useSensor(PointerSensor));

    const moveTrack = useCallback((fromIndex: number, toIndex: number) => {
        const oldQueue = [...optimisticQueue];

        // Create updated queue
        let updatedQueue = [...oldQueue];
        const [movedTrack] = updatedQueue.splice(fromIndex, 1);
        updatedQueue.splice(toIndex, 0, movedTrack);

        // Optimistically update the UI
        setOptimisticQueue(updatedQueue);

        // Real reorder attempt
        queue.reorderTracksInQueue(fromIndex + 1, 1, toIndex + 1)


    }, [queue, optimisticQueue]);

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over || active.id === over.id) return;

        const fromIndex = parseInt(active.id);
        const toIndex = parseInt(over.id);

        moveTrack(fromIndex, toIndex);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
                <div ref={queueContainerRef} className="overflow-y-auto h-full slick-scrollbar">
                    {items.map((id) => {
                        const index = parseInt(id);
                        const track = optimisticQueue[index];

                        return (
                            <DraggableTrack
                                key={id}
                                index={index}
                                moveTrack={moveTrack}
                                trackRef={trackRefs.current[index]}
                            >
                                <TrackEntity
                                    entity={track}
                                    playing={currentlyPlayingIndex === index}
                                    small={isSmall}
                                    index={index}
                                    showImage={!hideALbumArt}
                                    onSelectChange={(isSelected) => {
                                        if (isSelected) {
                                            selectedTracks.current.push(index);
                                        } else {
                                            selectedTracks.current = selectedTracks.current.filter((i) => i !== index);
                                        }
                                    }}
                                />
                                <Seperator />
                            </DraggableTrack>
                        );
                    })}
                </div>
            </SortableContext>

            <DragOverlay>
                {activeId !== null ? (
                    <div className="opacity-50">
                        <TrackEntity entity={queue.queue[parseInt(activeId)]} small={isSmall} playing={false} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
