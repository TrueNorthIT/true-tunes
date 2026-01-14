"use client";

import { createRef, useRef, useState, useCallback, useEffect } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { DragOverlay, useDndMonitor, useDndContext } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
import { TN_Track } from "@models/Track";
import { TN_Album } from "@models/Album";
export default function Queue() {
  const queue = useQueue();
  const actions = useSonosActions();
  const trackRefs = useRef([]);
  const queueContainerRef = useRef<HTMLDivElement>(null);

  const [currentlyPlayingIndex, setCurrentlyPlayingIndex] = useState(
    queue.currentTrackIndex
  );
  const [isSmall, setIsSmall] = useState(false);
  const [hideAlbumArt, setHideAlbumArt] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<number[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );

  const { registerBreakpoint } = useAsideBreakpoint();

  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const { active } = useDndContext();
  useDndMonitor({
    onDragOver(event) {
      console.log("Drag over event: ", event);
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
      const isWithinXLeft = activeLeft <= overRect.right;
      const isWithinXRight = activeRight <= overRect.right;

      console.log(
        "Active Rect Left: ",
        activeLeft,
        " Active Rect Right: ",
        activeRight,
        " Over Rect Left: ",
        overRect.left,
        " Over Rect Right: ",
        overRect.right,
        " Is Within X Left: ",
        isWithinXLeft,
        " Is Within X Right: ",
        isWithinXRight
      );
      console.log("Active ID: ", active.id, " Over ID: ", over.id);

      if (
        active.id.toString().startsWith("search") &&
        (isWithinXLeft || isWithinXRight)
      ) {
        console.log("We got an over!: ", active.id, over.id);
        setOverId(over.id);
      } else {
        setOverId(null);
      }
    },

    onDragEnd(event) {
      const { active, over } = event;
      if (
        active.id.toString().startsWith("search") &&
        !overId &&
        queue.queue.length > 0
      )
        return;
      setOverId(null);
      if ((!over || active.id === over.id) && queue.queue.length > 0) {
        return;
      }
      if (
        queue.queue.length === 0 &&
        active.id.toString().startsWith("search")
      ) {
        queue.addToQueue(active.data.current as TN_Track | TN_Album, 0);
        return;
      }

      console.log("We got a dropper!: ", active.id, over.id);

      if (active.id.toString().startsWith("search")) {
        const overRect = over.rect;
        const activeRect = active.rect.current.translated;

        const isWithinXLeft = overRect.left <= activeRect.right;
        const isWithinXRight = overRect.right <= activeRect.right;

        if (!(isWithinXLeft || isWithinXRight)) return;

        queue.addToQueue(
          active.data.current as TN_Track | TN_Album,
          Number.parseInt(over.id.toString()) + 1
        );
      } else {
        const oldIndex = parseInt(active.id.toString());
        const newIndex = parseInt(over.id.toString());
        queue.reorderTracksInQueue(oldIndex + 1, 1, newIndex);
        // moveTracks(oldIndex, newIndex);
      }
    },
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

  const items = queue.queue.map((_, i) => i.toString());
  if (trackRefs.current.length !== queue.queue.length) {
    trackRefs.current = Array(queue.queue.length)
      .fill(null)
      .map((_, i) => trackRefs.current[i] || createRef());
  }

  const handleTrackSelect = (index: number, e: React.MouseEvent) => {
    const isSelected = selectedTracks.includes(index);

    if (e.shiftKey && lastSelectedIndex !== null) {
      const [start, end] = [lastSelectedIndex, index].sort((a, b) => a - b);
      const range = Array.from(
        { length: end - start + 1 },
        (_, i) => start + i
      );
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
    <div
      ref={queueContainerRef}
      className="overflow-y-auto h-full slick-scrollbar"
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((id) => {
          const index = parseInt(id);
          const track = queue.queue[index];

          const isOver = overId === id;

          return (
            <React.Fragment key={id}>
              {isOver && (
                <div className="bg-gray-600">
                  <TrackEntity
                    entity={active.data.current as TN_Track}
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

        <DragOverlay modifiers={[snapCenterToCursor]}>
          {!overId ? (
            <div
              className="p-2 bg-neutral-800 rounded"
              style={{ width: queueContainerRef.current?.clientWidth }}
            >
              <TrackEntity
                entity={active?.data?.current as TN_Track}
                playing={false}
                small={false}
                index={-1}
                showImage={true}
                isSelected={false}
              />
            </div>
          ) : (
            <></>
          )}
        </DragOverlay>
      </SortableContext>
    </div>
  );
}

// ---

const SortableTrack = React.forwardRef<
  HTMLDivElement,
  TrackEntityProps & {
    id: UniqueIdentifier;
    onSelect: (index: number, e: React.MouseEvent) => void;
  }
>(
  (
    { id, index, entity, isSelected, playing, small, showImage, onSelect },
    ref
  ) => {
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

    const combinedRef = useCallback(
      (node: HTMLDivElement | null) => {
        setNodeRef(node);
        if (ref && typeof ref === "object") {
          ref.current = node;
        }
      },
      [setNodeRef, ref]
    );

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
SortableTrack.displayName = "SortableTrack";
