import React from 'react';
import { useEffect, useState } from 'react';
import type { Track } from '@svrooij/sonos/lib/models';
import ImageWithFallback from '@components/ImageWithFallback';
import missing_album_art from '@public/images/missing_album_art.png';
import type { ITrackEntity } from '@components/result-types/trackEntity';


const SearchTrack: React.FC<{
    entity: ITrackEntity | Track,
    small: boolean,
    showImage?: boolean,
    onArtistClick?: (artist: string) => void,
    onAlbumClick?: (album: string) => void,
}> = (props) => {

    const [menuOpened, setMenuOpened] = useState(false);
    const [track, setTrack] = useState<Track>();
    const [showAlbumArt, setShowAlbumArt] = useState(true);



    useEffect(() => {
        console.log('Show Image: ', props.showImage);
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





    return (
        <div
            className={
                " flex items-center group track-entity w-full hover:bg-gray-800 cursor-pointer p-2 overflow-hidden relative active:bg-gray-900 pr-10" // Add `pr-10`
                + (menuOpened ? " bg-gray-800" : "")
                + (props.small ? " p-0" : " p-2")
            }
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
                </div>
            )}

            <div className='parent relative ml-4'>
                <h2 className="text-lg font-semibold">{track?.Title}</h2>
                <div className='flex max-h-6'>
                    <h3 className='text-gray-400' title={`${track?.Artist} - ${track?.Album}`}>
                        <a className='hover:underline hover:cursor-pointer' onClick={() => props.onArtistClick?.(track?.Artist)}>{track?.Artist}</a> &nbsp;-&nbsp; <b className='font-semibold hover:underline hover:cursor-pointer' onClick={() => props.onAlbumClick?.(track.Album)}>{track?.Album}</b>
                    </h3>
                </div>
            </div>

        </div>
    );
};


export default SearchTrack;
