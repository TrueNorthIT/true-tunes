import type { Track } from '@svrooij/sonos/lib/models';
import type { MediaItem } from '@svrooij/sonos/lib/musicservices/smapi-client';
import { useEffect, useState } from 'react';
import ImageWithFallback from '@components/ImageWithFallback';
import missing_album_art from '@public/images/missing_album_art.png';
import { useContextMenuManager } from '@providers/ContextMenuProvider';
import { useSonosActions } from '@components/providers/SonosContext';
import React from 'react';
import { CSS } from "@dnd-kit/utilities";
import type { UniqueIdentifier } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
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
        explicit?: boolean
    }
}

export interface TrackEntityProps {
    entity: ITrackEntity,
    playing: boolean,
    index?: number,
    small: boolean,
    showImage?: boolean,
    isSelected?: boolean,
    isSearchResult?: boolean,
    providedRef?: React.RefObject<HTMLDivElement>,
    onSelectChange?: (isSelected: boolean) => void
}

const TrackEntity: React.FC<TrackEntityProps> = (props) => {
    const player = useSonosActions();

    const { handleContextMenu } = useContextMenuManager();
    const [menuOpened, setMenuOpened] = useState(false);
    const [track, setTrack] = useState<Track>();
    const [showAlbumArt, setShowAlbumArt] = useState(true);

    const formatDuration = (seconds: number) => {
        if (!seconds) return undefined;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (props.showImage !== null) setShowAlbumArt(props.showImage);
        else setShowAlbumArt(true);
    }, [props.showImage]);

    useEffect(() => {
        if (props.entity === undefined) {
            setTrack({
                'Album': '',
                'Artist': '',
                'Title': '',
                'AlbumArtUri': '',
            });
            return;
        }

        if (Object.hasOwnProperty.call(props.entity, 'trackMetadata')) {
            const iTrack = props.entity as ITrackEntity;
            setTrack({
                'Album': iTrack.trackMetadata.album,
                'Artist': iTrack.trackMetadata.artist,
                'Title': iTrack.title,
                'AlbumArtUri': iTrack.trackMetadata.albumArtURI,
                'TrackUri': iTrack.id
            });
        } else {
            setTrack(props.entity as Track);
        }
    }, [props.entity]);

    const searchContextMenuOptions = [
        {
            label: 'Play Now', onClick: async () => {
                console.log('Play Now clicked ', track?.TrackUri);
                await player.playNext(track?.TrackUri);
                player.next();

            }
        },
        { label: 'Add to Queue', onClick: () => player.addToQueue(track?.TrackUri) },
        { label: 'Show Details', onClick: () => console.log('Show Details clicked') },
    ];

    const contextMenuOptions = [
        {
            label: 'Play Now', onClick: () => {
                console.log('Play Now clicked ', track?.TrackUri);
                console.log("jumpin")
                player.jumpToPointInQueue(props.index)
            }
        },
        { label: 'Remove from Queue', onClick: () => player.removeFromQueue(props.index + 1) },
        { label: 'Show Details', onClick: () => console.log('Show Details clicked') },
    ];

    const launchContextMenu = (e) => {
        e.preventDefault();
        setMenuOpened(true);
        handleContextMenu(e, props.isSearchResult ? searchContextMenuOptions : contextMenuOptions, () => setMenuOpened(false));
    }

    const handleCheckboxChange = (e) => {
        const isChecked = e.target.checked;
        props.onSelectChange?.(isChecked); // Notify parent of selection change
    };

    return (
        <div
            className={
                " flex items-center group track-entity w-full hover:bg-gray-800 cursor-pointer p-2 overflow-hidden relative active:bg-gray-900 pr-10" // Add `pr-10`
                + (menuOpened ? " bg-gray-800" : "")
                + (props.small ? " p-0" : " p-2")
            }
            onContextMenu={launchContextMenu}
        >



            {showAlbumArt && (
                <div className={"relative w-16 h-16 " + (props.small ? "w-8 h-8" : " ")}>
                    <ImageWithFallback
                        src={track?.AlbumArtUri}
                        fallback={missing_album_art}
                        alt={track?.Title}
                        width={100}
                        height={100}
                        className={"w-full h-full max-w-16 max-h-16 rounded-lg " + (props.small ? "min-w-8 min-h-8 " : "min-w-16 min-h-16 ")}
                    />
                    {props.playing && (
                        <div className="absolute inset-0 bg-gray-800 bg-opacity-80 flex items-center justify-center rounded-lg">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-white"
                                fill="white"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                            </svg>
                        </div>
                    )}
                </div>
            )}

            <div className='parent relative ml-4'>
                <h2 className="text-lg font-semibold">
                    <span>{track?.Title}</span>
                    {
                        props.entity?.tags?.explicit ? <span className="text-white text-xs ml-4 bg-red-800 px-2 pb-2 border-x-red-700 br-r-4" title="Explicit Content">
                            Explicit
                        </span>
                            : null
                    }

                </h2>
                <div className='flex max-h-6'>
                    <h3 className='text-gray-400' title={`${track?.Artist} - ${track?.Album}`}>
                        {track?.Artist} &nbsp;-&nbsp; <b className='font-semibold'>{track?.Album}</b>
                    </h3>
                </div>
                {(props.playing && !showAlbumArt) && (
                    <div className="absolute inset-0 bg-gray-400 bg-opacity-30 flex items-center rounded-lg">
                    </div>
                )}
            </div>

            <span className='ml-auto'>{formatDuration(props.entity.trackMetadata?.duration)}</span>
            <input
                type="checkbox"
                checked={props.isSelected}
                onChange={handleCheckboxChange}
                className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 checked:opacity-100 transition-opacity"
                style={{ zIndex: 10 }}
            />


        </div>
    );
};

export function DraggableTrack({ id, index, entity, isSelected, playing, small, showImage, onSelect }: TrackEntityProps & { id: UniqueIdentifier, onSelect: (index: number, e: React.MouseEvent) => void }) {
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
            />
        </div>

    );
}




export default React.memo(TrackEntity);
