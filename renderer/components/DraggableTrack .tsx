import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';

type DraggableTrackProps = {
    index: number;
    moveTrack: (fromIndex: number, toIndex: number) => void;
    trackRef: React.RefObject<HTMLDivElement>;
    children: React.ReactNode;
};

export default function DraggableTrack({ index, moveTrack, trackRef, children }: DraggableTrackProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        activeIndex
    } = useSortable({ id: index.toString() });


    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: activeIndex === index ? 0.5 : 1,
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
        {...attributes}
        {...listeners}
    >
        {children}
    </div>
    );
}
