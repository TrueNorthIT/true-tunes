/* eslint-disable react/prop-types */
import clsx from 'clsx';
import React from 'react';
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { TN_Track } from '../../models/Track';
import type { UniqueIdentifier } from '@dnd-kit/core';
import ImageWithFallback from '@components/ImageWithFallback';
import missing_album_art from '@public/images/missing_album_art.png';
import { useSonosActions } from '@components/providers/SonosContext';
import { useContextMenuManager } from '@providers/ContextMenuProvider';
import type { MediaItem } from '@svrooij/sonos/lib/musicservices/smapi-client';
export interface ITrackEntity extends MediaItem {
    trackMetadata: {
        albumArtURI: string;
        artist: string;
        album: string;
        trackNumber?: number;
        duration?: number;
        albumId?: string;
        artistId?: string;
    }
    tags?: {
        explicit?: 0 | 1;
    }
}

export interface TrackEntityProps {
    entity: TN_Track,
    playing: boolean,
    index?: number,
    small: boolean,
    showImage?: boolean,
    isSelected?: boolean,
    isSearchResult?: boolean,
    providedRef?: React.RefObject<HTMLDivElement>,
    onSelectChange?: (isSelected: boolean) => void
}

const TrackEntity: React.FC<TrackEntityProps> = React.memo(({
    entity,
    index,
    showImage,
    playing = false,
    small = false,
    isSearchResult = false,
    isSelected = false,
    onSelectChange,
}) => {
    const player = useSonosActions();
    const router = useRouter();
    const { handleContextMenu } = useContextMenuManager();

    const contextOptions = useMemo(() => {
        const playNow = async () => {
            if (isSearchResult) {
                await player.playNext(entity.id);
                player.next();
                const playBackState = await player.getPlaybackState();
                if (playBackState.transportState !== "PLAYING") player.togglePlayback();
            } else {
                player.jumpToPointInQueue(index);
            }
        };

        return [
            { label: 'Play Now', onClick: playNow },
            {
                label: isSearchResult ? 'Add to Queue' : 'Remove from Queue',
                onClick: () => isSearchResult ? player.addToQueue(entity.id) : player.removeFromQueue(index + 1),
            },
            { label: 'Go to Album', onClick: async () => router.push(`/music/view/album/${entity.album.id}`) },
            {
                label: 'Go to Artist',
                onClick: async () => router.push(`/music/view/artist/${entity.artist.id}`),
            },
            {
                label: 'See Lyrics',
                onClick: async () => router.push(`/music/lyrics/${entity.artist.name}/${entity.title}`),
            }


        ];
    }, [player, entity, index, isSearchResult, router]);

    const onContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        handleContextMenu(e, contextOptions, () => { });
    }, [handleContextMenu, contextOptions]);

    const checkboxHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onSelectChange?.(e.target.checked);
    }, [onSelectChange]);

    return (
        <div
            onContextMenu={onContextMenu}
            className={clsx(
                'flex items-center w-full cursor-pointer p-2 overflow-hidden relative pr-10 group',
                {
                    'hover:bg-gray-800 active:bg-gray-900': true,
                    'bg-gray-800': false,
                    'p-0': small,
                }
            )}
        >
            {showImage && (
                <div className={clsx('relative', small ? 'w-8 h-8' : 'w-16 h-16')}>
                    <ImageWithFallback
                        src={entity.artURI}
                        fallback={missing_album_art}
                        alt={entity.title}
                        width={small ? 40 : 100}
                        height={small ? 40 : 100}
                        className={clsx('rounded-lg object-cover', small ? 'min-w-8 min-h-8' : 'min-w-16 min-h-16')}
                    />
                    {playing && (
                        <div className="absolute inset-0 bg-gray-800 bg-opacity-80 flex items-center justify-center rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="white" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                            </svg>
                        </div>
                    )}
                </div>
            )}

            <div className="relative ml-4 flex-1 w-0">
                <h2 className="text-lg font-semibold flex items-center overflow-hidden text-nowrap mr-4" title={entity.title}>
                    <span className="overflow-ellipsis overflow-hidden" >{entity.title}</span>
                    {entity.explicit && (
                        <span
                            className="ml-2 text-xs font-medium bg-red-800 px-2 py-0.5 rounded"
                            title="Explicit Content"
                        >
                            Explicit
                        </span>
                    )}
                </h2>
                <p className="text-gray-400 truncate" title={`${entity.artist.name} - ${entity.album.name}`}>
                    {entity.artist.name} – <strong>{entity.album.name}</strong>
                </p>
            </div>

            <span className="ml-auto mr-4 font-mono text-sm">
                {entity.duration}
            </span>

            <input
                type="checkbox"
                checked={isSelected}
                onChange={checkboxHandler}
                className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 checked:opacity-100"
            />
        </div>
    );
});
TrackEntity.displayName = 'TrackEntity';
export function DraggableTrack({ id, index, entity, isSelected, playing, small, showImage, isSearchResult, onSelect }: TrackEntityProps & { id: UniqueIdentifier, onSelect: (index: number, e: React.MouseEvent) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({ id, data: entity });

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
                isSearchResult={isSearchResult}
            />
        </div>

    );
}




export default React.memo(TrackEntity);
