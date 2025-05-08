"use client";

import { createRef, useRef, useState, useCallback, useEffect } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { DragOverlay, useDndMonitor, useDndContext } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useQueue } from "@providers/QueueProvider";
import { useScrollToCurrentTrack } from "@components/Queue/useScrollToCurrentTrack";
import { useHandleManualScroll } from "@components/Queue/useHandleManualScroll";
import { useAsideBreakpoint } from "@providers/AsideBreakpointContext";
import type { TrackEntityProps } from "@components/result-types/trackEntity";
import TrackEntity from "@components/result-types/trackEntity";
import Seperator from "@components/Seperator";
import { CSS } from "@dnd-kit/utilities";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import React from "react";
import { useSonosActions } from "@components/providers/SonosContext";
import type { Track } from "@svrooij/sonos/lib/models";
export default function Queue() {
    const queue = useQueue();
    const actions = useSonosActions();
    const trackRefs = useRef([]);
    const queueContainerRef = useRef<HTMLDivElement>(null);

    const [currentlyPlayingIndex, setCurrentlyPlayingIndex] = useState(queue.currentTrackIndex);
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
            const activeRect = active.rect.current.translated;

            if (!activeRect) {
                setOverId(null);
                return;
            }

            const activeLeft = activeRect.left;
            const activeRight = activeRect.right;
            const isWithinXLeft = activeLeft <= overRect.right
            const isWithinXRight = activeRight <= overRect.right;


            if (active.id.toString().startsWith("search") && (isWithinXLeft || isWithinXRight)) {
                setOverId(over.id);
            } else {
                setOverId(null);
            }
        },

        onDragEnd(event) {

            const { active, over } = event;
            if (active.id.toString().startsWith("search") && !overId) return
            setOverId(null);
            if (!over || active.id === over.id) {
                return;
            }

            console.log("We got a dropper!: ", active.id, over.id)

            if (active.id.toString().startsWith("search")) {
                const overRect = over.rect;
                const activeRect = active.rect.current.translated;

                const isWithinXLeft = overRect.left <= activeRect.right
                const isWithinXRight = overRect.right <= activeRect.right;

                if (!(isWithinXLeft || isWithinXRight)) return

                // Optimistic update
                const newQueue = [...optimisticQueue];
                const newTrack = active.data.current;
                const newTrackIndex = parseInt(over.id.toString());
                const newTrackUri = active.data.current.trackMetadata?.trackUri || active.data.current.uri;
                const newTrackObj = {
                    ...newTrack,
                    id: newTrackUri,
                    trackMetadata: {
                        ...newTrack.trackMetadata,
                        trackUri: newTrackUri,
                    },
                };

                newQueue.splice(newTrackIndex, 0, newTrackObj as Track);

                setOptimisticQueue(newQueue);
                actions.addToQueue(active.data.current.id, Number.parseInt(over.id.toString()) + 1);

            }

            else {

                const oldIndex = parseInt(active.id.toString());
                const newIndex = parseInt(over.id.toString());
                moveTracks(oldIndex, newIndex);

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



    const isProgrammaticScrollRef = useScrollToCurrentTrack(
        currentlyPlayingIndex,
        trackRefs,
        queueContainerRef,
        queue,
        isSmall
    );



    useHandleManualScroll(queueContainerRef, queue, isProgrammaticScrollRef);


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

                {items.map((id) => {
                    const index = parseInt(id);
                    const track = optimisticQueue[index];

                    const isOver = overId === id;

                    return (
                        <React.Fragment key={id}>
                            {isOver && (
                                <div className="bg-gray-600">
                                    <TrackEntity
                                        entity={active.data.current}
                                        playing={false}
                                        small={false}
                                        index={index}
                                        showImage={!hideAlbumArt}
                                        isSelected={false}
                                    />
                                    <Seperator />

                                </div>
                            )}

                            <SortableTrack
                                ref={trackRefs.current[index]}
                                id={id}
                                index={index}
                                entity={track}
                                isSelected={selectedTracks.includes(index)}
                                playing={currentlyPlayingIndex === index}
                                small={isSmall}
                                showImage={!hideAlbumArt}
                                onSelect={handleTrackSelect}
                            />
                        </React.Fragment>
                    );
                })}

                <DragOverlay modifiers={[snapCenterToCursor]} >
                    {
                        !overId ? <div className="p-2 bg-neutral-800 rounded" style={{ width: queueContainerRef.current?.clientWidth }}>
                            <TrackEntity
                                entity={active?.data?.current}
                                playing={false}
                                small={false}
                                index={-1}
                                showImage={true}
                                isSelected={false}
                            />
                        </div> : <></>
                    }

                </DragOverlay>

            </SortableContext>
        </div>

    );
}

// ---

const SortableTrack = React.forwardRef<HTMLDivElement, TrackEntityProps & { id: UniqueIdentifier, onSelect: (index: number, e: React.MouseEvent) => void }>(
    ({ id, index, entity, isSelected, playing, small, showImage, onSelect }, ref) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging,
        } = useSortable({ id, data: entity });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0 : 1,
        };

        const combinedRef = useCallback((node: HTMLDivElement | null) => {
            setNodeRef(node);
            if (ref && typeof ref === 'object') {
                ref.current = node;
            }
        }, [setNodeRef, ref]);

        return (
            <div
                ref={combinedRef}
                style={style}
                className="grow"
                onClick={(e) => onSelect(index, e)}
                {...attributes}
                {...listeners}
            >
                <TrackEntity
                    entity={entity}
                    playing={playing}
                    small={small}
                    index={index}
                    showImage={showImage}
                    isSelected={isSelected}
                />
                <Seperator />
            </div>
        );
    }
);
SortableTrack.displayName = 'SortableTrack';