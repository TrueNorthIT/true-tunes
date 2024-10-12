import { Track } from '@svrooij/sonos/lib/models';
import { MediaItem } from '@svrooij/sonos/lib/musicservices/smapi-client';
import { useEffect, useState } from 'react';
import ImageWithFallback from '@components/ImageWithFallback';
import missing_album_art from '@public/images/missing_album_art.png';
import { useContextMenuManager } from '@providers/ContextMenuProvider';
import { title } from 'process';

export interface ITrackEntity extends MediaItem {
    trackMetadata: {
        albumArtURI: string;
        artist: string;
        album: string;
    }
}

const TrackEntity: React.FC<{ entity: ITrackEntity | Track, playing: boolean, small: boolean, showImage?: boolean }> = (props) => {

    const { handleContextMenu } = useContextMenuManager(); // Access the context menu handler from the provider
    const [menuOpened, setMenuOpened] = useState(false);
    const [track, setTrack] = useState<Track>();
    const [showAlbumArt, setShowAlbumArt] = useState(true);

    useEffect(() => {
        console.log('Show Image: ', props.showImage);
        if (props.showImage !== null)    setShowAlbumArt(props.showImage);
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
            });
        } else {
            setTrack(props.entity as Track);
        }
    }, [props.entity]);

    const contextMenuOptions = [
        { label: 'Play Now', onClick: () => console.log('Play clicked') },
        { label: 'Remove from Queue', onClick: () => console.log('Add to Queue clicked') },
        { label: 'Show Details', onClick: () => console.log('Show Details clicked') },
    ];

    const launchContextMenu = (e) => {
        e.preventDefault();
        setMenuOpened(true);
        handleContextMenu(e, contextMenuOptions, () => setMenuOpened(false));
    }

    return (
        <div
            className={
                "flex items-center space-x-4 m-2 hover:bg-gray-800 cursor-pointer p-2 overflow-hidden relative active:bg-gray-900"
                + (menuOpened ? " bg-gray-800" : "")
                + (props.small ? " p-0" : " p-2")
            }
            onContextMenu={launchContextMenu}>
            {
                (showAlbumArt) ?

                    <div className={"relative w-16 h-16 " + (props.small ? "w-8 h-8" : " ")}>
                        <ImageWithFallback
                            src={track?.AlbumArtUri}
                            fallback={missing_album_art}
                            alt={track?.Title}
                            width={100}
                            height={100}
                            className={"w-full h-full max-w-16 max-h-16 rounded-lg " + (props.small ? "min-w-8 min-h-8 " : "min-w-16 min-h-16 ")}
                            objectFit="cover"
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
                    : <></>
            }


            <div className='parent relative'>
                <h2 className="text-lg font-semibold">{track?.Title}</h2>
                <div className='flex max-h-6'>
                    <h3 className='text-gray-400' title={`${track?.Artist} - ${track?.Album}`}>
                        {track?.Artist} &nbsp;-&nbsp; <b className='font-semibold'>{track?.Album}</b>
                    </h3>
                </div>
                {(props.playing && !showAlbumArt)  && (
                <div className="absolute inset-0 bg-gray-400 bg-opacity-30 flex items-center rounded-lg">
                </div>
            )}
            </div>
        </div>

    );
};

export default TrackEntity;
