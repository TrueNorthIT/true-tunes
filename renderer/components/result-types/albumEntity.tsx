import React from 'react';
import { CSS } from "@dnd-kit/utilities";
import type { UniqueIdentifier} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import ImageWithFallback from '@components/ImageWithFallback';
import type { MediaItem } from '@svrooij/sonos/lib/musicservices/smapi-client';
import { useRouter } from 'next/navigation';
export interface IAlbumEntity extends MediaItem {
    artist: string;
    artistId: string;
}

export interface AlbumEntityProps {
    entity: IAlbumEntity;
    onSelect?: () => void; // Optional onClick handler
}


const AlbumEntity: React.FC<AlbumEntityProps> = (props) => {

    const handleClick = (event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent event bubbling
        props?.onSelect?.(); // Safely call the onClick handler if it exists
    };



    return (
        <li className="relative hover:underline underline-offset-2 list-none">
            <div className="group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                <ImageWithFallback alt="" src={props?.entity?.albumArtURI} className="w-full h-full pointer-events-none object-cover group-hover:opacity-75" />
                <button type="button" className="absolute inset-0 focus:outline-none" onClick={handleClick}>
                </button>
            </div>
            <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-50">{props?.entity?.title}</p>
            <p className="pointer-events-none block text-sm font-medium text-gray-400">{props?.entity?.artist}</p>
        </li>
    );
}

export function DraggableAlbum({ id, entity }: AlbumEntityProps & { id: UniqueIdentifier }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id, data: {
            ...entity,
            id: entity.id,
            Title: entity.title,
            Artist: entity.artist,
            AlbumArtUri: entity.albumArtURI,
            Album: entity.title

        }
    });

    const router = useRouter();

    const style = {
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0 : 1,
        zIndex: isDragging ? 1000 : 1,
    };

    return (


        <div
            ref={setNodeRef}
            style={style}
            className="grow"
            {...attributes}
            {...listeners}
        >
            <AlbumEntity
                key={entity.id}
                entity={entity}
                onSelect={() => router.push(`/music/view/album/${entity.id}`)}
            />


        </div>

    );
}

export default AlbumEntity;