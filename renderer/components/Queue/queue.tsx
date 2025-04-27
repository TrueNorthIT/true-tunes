"use client";

import { createRef, useRef, useState, useCallback, useEffect } from "react";
import { useQueue } from "@providers/QueueProvider";
import { useScrollToCurrentTrack } from "@components/Queue/useScrollToCurrentTrack";
import { useHandleManualScroll } from "@components/Queue/useHandleManualScroll";
import { useAsideBreakpoint } from "@providers/AsideBreakpointContext";
import TrackEntity from "@components/result-types/trackEntity";
import Seperator from "@components/Seperator";
import {
    closestCenter,
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DraggableTrack from "@components/DraggableTrack";

export default function Queue() {
    const queue = useQueue();
    const trackRefs = useRef([]);
    const queueContainerRef = useRef<HTMLDivElement>(null);

    const [currentlyPlayingIndex, setCurrentlyPlayingIndex] = useState(queue.currentTrackIndex);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isSmall, setIsSmall] = useState(false);
    const [hideALbumArt, setHideAlbumArt] = useState(false);
    const [selectedTracks, setSelectedTracks] = useState<number[]>([]);
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

    const { registerBreakpoint } = useAsideBreakpoint();
    useEffect(() => {
        const bp400 = registerBreakpoint(400, setIsSmall);
        const bp200 = registerBreakpoint(300, setHideAlbumArt);
        return () => {
            bp400.unsubscribe();
            bp200.unsubscribe();
        };
    }, [registerBreakpoint]);

    useEffect(() => {
        setCurrentlyPlayingIndex(queue.currentTrackIndex - 1);
    }, [queue.currentTrackIndex]);

    const isProgrammaticScrollRef = useScrollToCurrentTrack(
        currentlyPlayingIndex,
        trackRefs,
        queueContainerRef,
        queue,
        isSmall
    );

    useHandleManualScroll(queueContainerRef, queue, isProgrammaticScrollRef);

    const [optimisticQueue, setOptimisticQueue] = useState(queue.queue);

    useEffect(() => {
        setOptimisticQueue(queue.queue);
    }, [queue.queue]);

    const items = optimisticQueue.map((_, i) => i.toString());

    if (trackRefs.current.length !== optimisticQueue.length) {
        trackRefs.current = Array(queue.queue.length)
            .fill(null)
            .map((_, i) => trackRefs.current[i] || createRef());
    }

    const sensors = useSensors(useSensor(PointerSensor));
    const moveTracks = useCallback((fromIndices: number[], toIndex: number) => {
        console.log("Move Tracks", fromIndices, toIndex);

        const sortedFrom = [...fromIndices].sort((a, b) => a - b);
        const movingTracks = sortedFrom.map(i => optimisticQueue[i]);

        const withoutTracks = optimisticQueue.filter((_, i) => !sortedFrom.includes(i));

        const isMovingDown = sortedFrom[0] < toIndex;
        const numRemovedBeforeTarget = sortedFrom.filter(i => i < toIndex).length;

        let insertAt = toIndex - numRemovedBeforeTarget;
        if (isMovingDown) {
            insertAt += 1;
        }

        const updatedQueue = [
            ...withoutTracks.slice(0, insertAt),
            ...movingTracks,
            ...withoutTracks.slice(insertAt),
        ];

        console.log("Insert at", insertAt, "from", sortedFrom, "to", toIndex);

        setOptimisticQueue(updatedQueue);

        // Backend reorder: one block move
        queue.reorderTracksInQueue(sortedFrom[0] + 1, sortedFrom.length, insertAt + 1);
    }, [optimisticQueue, queue]);





    const handleDragStart = (event) => {
        const draggedIndex = parseInt(event.active.id);
        setActiveId(event.active.id);

        // Ensure the dragged track is selected
        setSelectedTracks((prev) =>
            prev.includes(draggedIndex) ? prev : [draggedIndex]
        );
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over || active.id === over.id) return;

        const toIndex = parseInt(over.id);
        const fromIndices = [...selectedTracks].sort((a, b) => a - b);

        moveTracks(fromIndices, toIndex);
        setSelectedTracks([])
    };

    const handleTrackSelect = (index: number, e: React.MouseEvent) => {
        const isSelected = selectedTracks.includes(index);

        if (e.shiftKey && lastSelectedIndex !== null) {
            const [start, end] = [lastSelectedIndex, index].sort((a, b) => a - b);
            const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
            setSelectedTracks((prev) => Array.from(new Set([...prev, ...range])));
        } else if (e.ctrlKey || e.metaKey) {
            setSelectedTracks((prev) =>
                isSelected ? prev.filter((i) => i !== index) : [...prev, index]
            );
        } else {
            setSelectedTracks([index]);
        }

        setLastSelectedIndex(index);
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
                        const isDraggingThis = activeId !== null && selectedTracks.includes(index);

                        if (isDraggingThis) return (
                            <div key={id} className="h-[72px] opacity-0 pointer-events-none" />
                        );

                        return (
                            <DraggableTrack
                                key={id}
                                index={index}
                                moveTrack={moveTracks}
                                trackRef={trackRefs.current[index]}
                                onGrabHandle={(setActivatorNodeRef, listeners, attributes) => (
                                    <div
                                        ref={setActivatorNodeRef}
                                        {...listeners}
                                        {...attributes}
                                        className="mr-3 p-1 text-gray-400 cursor-grab hover:text-white active:cursor-grabbing"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M7 4h2v2H7V4zm4 0h2v2h-2V4zM7 9h2v2H7V9zm4 0h2v2h-2V9zM7 14h2v2H7v-2zm4 0h2v2h-2v-2z" />
                                        </svg>
                                    </div>
                                )}
                            >
                                <div onClick={(e) => handleTrackSelect(index, e)} className="grow">
                                    <TrackEntity
                                        entity={track}
                                        playing={currentlyPlayingIndex === index}
                                        small={isSmall}
                                        index={index}
                                        showImage={!hideALbumArt}
                                        isSelected={selectedTracks.includes(index)}
                                    />
                                    <Seperator />
                                </div>
                            </DraggableTrack>
                        );
                    })}
                </div>
            </SortableContext>

            <DragOverlay>
                {activeId !== null ? (
                    <div className="opacity-50 space-y-1">
                        {selectedTracks.map((i) => (
                            <TrackEntity
                                key={i}
                                entity={queue.queue[i]}
                                small={isSmall}
                                playing={false}
                            />
                        ))}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
