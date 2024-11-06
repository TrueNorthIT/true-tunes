import { useDrag, useDrop } from "react-dnd";

const ITEM_TYPE = "TRACK";

type DragItem = {
    index: number;
};

type DraggableTrackProps = {
    index: number;
    moveTrack: (fromIndex: number, toIndex: number) => void;
    trackRef: React.RefObject<HTMLDivElement>;
    children: React.ReactNode;
};

export default function DraggableTrack({ index, moveTrack, trackRef, children }: DraggableTrackProps) {
    const [{ isDragging }, ref] = useDrag({
        type: ITEM_TYPE,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: ITEM_TYPE,
        drop: (draggedItem: DragItem) => {
            if (draggedItem.index !== index) {
                moveTrack(draggedItem.index, index);
            }
        },
    });

    // Combine drag and drop refs with the track ref
    const combinedRef = (node: HTMLDivElement | null) => {
        ref(node);
        drop(node);
        if (trackRef) {
            //@ts-ignore
            trackRef.current = node;
        }
    };

    return (
        <div ref={combinedRef} style={{ opacity: isDragging ? 0.5 : 1 }}>
            {children}
        </div>
    );
}
