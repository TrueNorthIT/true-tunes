"use client";

import { createRef, useRef, useState, useCallback, useEffect } from "react";
import { DndContext, closestCenter, DragOverlay, useDraggable, useDndMonitor, UniqueIdentifier, useDndContext } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useQueue } from "@providers/QueueProvider";
import { useScrollToCurrentTrack } from "@components/Queue/useScrollToCurrentTrack";
import { useHandleManualScroll } from "@components/Queue/useHandleManualScroll";
import { useAsideBreakpoint } from "@providers/AsideBreakpointContext";
import TrackEntity from "@components/result-types/trackEntity";
import Seperator from "@components/Seperator";
import { CSS } from "@dnd-kit/utilities";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { createPortal } from 'react-dom';
import React from "react";
import { useSonosActions } from "@components/providers/SonosContext";
export default function Queue() {
    const queue = useQueue();
    const actions = useSonosActions();
    const trackRefs = useRef([]);
    const queueContainerRef = useRef<HTMLDivElement>(null);

    const [currentlyPlayingIndex, setCurrentlyPlayingIndex] = useState(queue.currentTrackIndex);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isSmall, setIsSmall] = useState(false);
    const [hideAlbumArt, setHideAlbumArt] = useState(false);
    const [selectedTracks, setSelectedTracks] = useState<number[]>([]);
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

    const { registerBreakpoint } = useAsideBreakpoint();

    const [optimisticQueue, setOptimisticQueue] = useState(queue.queue);


    const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
    const { active } = useDndContext();
    useDndMonitor({
        onDragOver(event) {
            const { active, over } = event;
            if (!over) {
                setOverId(null);
                return;
            }

            const overRect = over.rect;
            const activeRect = active.rect.current.translated; // Live moving rect!

            if (!activeRect) {
                setOverId(null);
                return;
            }

            const activeLeft = activeRect.left;

            const isWithinX =
                activeLeft >= overRect.left &&
                activeLeft <= overRect.left + overRect.width;



            if (active.id.toString().startsWith("search") && isWithinX) {
                setOverId(over.id);
            } else {
                setOverId(null);
            }
        },



        onDragStart(event: any) {
            setActiveId(event.active.id);

        },

        onDragEnd(event: any) {
            setOverId(null);

            const { active, over } = event;
            if (!over || active.id === over.id) {
                setActiveId(null);
                return;
            }

            if (active.id.toString().startsWith("search")) {
                const overRect = over.rect;
                const activeRect = active.rect.current.translated; // Live moving rect!


                const activeLeft = activeRect.left;

                const isWithinX =
                    activeLeft >= overRect.left &&
                    activeLeft <= overRect.left + overRect.width;

                if (!isWithinX) return
                    

                // Optimistic update
                const newQueue = [...optimisticQueue];
                const newTrack = active.data.current;
                const newTrackId = active.data.current.id;
                const newTrackIndex = parseInt(over.id);
                const newTrackUri = active.data.current.trackMetadata?.trackUri || active.data.current.uri;
                const newTrackObj = {
                    ...newTrack,
                    id: newTrackUri,
                    trackMetadata: {
                        ...newTrack.trackMetadata,
                        trackUri: newTrackUri,
                    },
                };
                newQueue.splice(newTrackIndex, 0, newTrackObj);
                setOptimisticQueue(newQueue);

                actions.addToQueue(active.data.current.id, Number.parseInt(over.id)+1);
            }
            else {


                const oldIndex = parseInt(active.id);
                const newIndex = parseInt(over.id);

                moveTracks(oldIndex, newIndex);
                setActiveId(null);
            }
        }
    });




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

    useEffect(() => {
        setOptimisticQueue(queue.queue);
    }, [queue.queue]);

    const items = optimisticQueue.map((_, i) => i.toString());

    if (trackRefs.current.length !== optimisticQueue.length) {
        trackRefs.current = Array(queue.queue.length)
            .fill(null)
            .map((_, i) => trackRefs.current[i] || createRef());
    }

    const moveTracks = useCallback((from: number, to: number) => {
        const updated = arrayMove(optimisticQueue, from, to);
        setOptimisticQueue(updated);

        // backend reorder
        queue.reorderTracksInQueue(from + 1, 1, to + 1);
    }, [optimisticQueue, queue]);

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

        <div ref={queueContainerRef} className="overflow-y-auto h-full slick-scrollbar">
            <SortableContext
                items={items}
                strategy={verticalListSortingStrategy}
            >

                {items.map((id, idx) => {
                    const index = parseInt(id);
                    const track = optimisticQueue[index];

                    const isOver = overId === id;

                    return (
                        <React.Fragment key={id}>
                            {isOver && (
                                <>
                                    <TrackEntity
                                        entity={active.data.current}
                                        playing={false}
                                        small={false}
                                        index={index}
                                        showImage={!hideAlbumArt}
                                        isSelected={false}
                                    />
                                    <Seperator />

                                </>
                            )}

                            <SortableTrack
                                id={id}
                                index={index}
                                track={track}
                                selected={selectedTracks.includes(index)}
                                playing={currentlyPlayingIndex === index}
                                small={isSmall}
                                hideAlbumArt={hideAlbumArt}
                                onSelect={handleTrackSelect}
                            />
                        </React.Fragment>
                    );
                })}

            </SortableContext>
        </div>

    );
}

// ---

export function SortableTrack({ id, index, track, selected, playing, small, hideAlbumArt, onSelect }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
    };


    return (
        <>

            {isDragging && (

                <DragOverlay>
                    <div className="p-2 bg-neutral-800 rounded">
                        <TrackEntity
                            entity={track}
                            playing={playing}
                            small={small}
                            index={index}
                            showImage={!hideAlbumArt}
                            isSelected={selected}
                        />
                    </div>
                </DragOverlay>
            )}

            <div
                ref={setNodeRef}
                style={style}
                className="grow"
                onClick={(e) => onSelect(index, e)}
                {...attributes}
                {...listeners}
            >
                <TrackEntity
                    entity={track}
                    playing={playing}
                    small={small}
                    index={index}
                    showImage={!hideAlbumArt}
                    isSelected={selected}
                />
                <Seperator />
            </div>
        </>
    );
}

export function DraggableTrack({ id, index, track, selected, playing, small, hideAlbumArt, onSelect }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({ id, data: track });

    const style = {
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0 : 1,
        zIndex: isDragging ? 1000 : 1,
    };

    return (
        <>
        {isDragging &&     createPortal(
            <DragOverlay modifiers={[snapCenterToCursor]}>
                <div className="p-2 bg-neutral-800 rounded">
                    <TrackEntity
                        entity={track}
                        playing={playing}
                        small={small}
                        index={index}
                        showImage={!hideAlbumArt}
                        isSelected={selected}
                    />
                </div>
            </DragOverlay>,
            document.body)}
        

        
        <div
            ref={setNodeRef}
            style={style}
            className="grow"
            onClick={(e) => onSelect(index, e)}
            {...attributes}
            {...listeners}
        >
            <TrackEntity
                entity={track}
                playing={playing}
                small={small}
                index={index}
                showImage={!hideAlbumArt}
                isSelected={selected}
            />
            {/* <Seperator /> */}
        </div>
        </>

    );
}