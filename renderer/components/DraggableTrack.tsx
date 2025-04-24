import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

type DraggableTrackProps = {
    index: number;
    moveTrack: (fromIndices: number[], toIndex: number) => void;
    trackRef: React.RefObject<HTMLDivElement>;
    children: React.ReactNode;
    onGrabHandle?: (setActivatorNodeRef: (el: HTMLElement | null) => void, listeners: any, attributes: any) => React.ReactNode;
};

export default function DraggableTrack({
    index,
    trackRef,
    children,
    onGrabHandle,
}: DraggableTrackProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
    } = useSortable({ id: index.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const combinedRef = (node: HTMLElement | null) => {
        setNodeRef(node);
        if (trackRef) {
            //@ts-ignore
            trackRef.current = node;
        }
    };

    return (
        <div
            ref={combinedRef}
            style={style}
            className="flex items-center" // side-by-side layout
        >
            {onGrabHandle && onGrabHandle(setActivatorNodeRef, listeners, attributes)}
            {children}
        </div>
    );
}
