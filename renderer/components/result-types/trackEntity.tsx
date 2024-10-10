import { Track } from '@svrooij/sonos/lib/models';
import { MediaItem } from '@svrooij/sonos/lib/musicservices/smapi-client';
import { useEffect, useState } from 'react';

export interface ITrackEntity extends MediaItem {
    trackMetadata: {
        albumArtURI: string;
        artist: string;
        album: string;
    }
}

const TrackEntity: React.FC<{entity: ITrackEntity | Track}> = (props) =>  {

    const [track, setTrack] = useState<Track>();    

    useEffect(() => {

        if (props.entity === undefined) {
            setTrack({
                'Album': '',
                'Artist': '',
                'Title': '',
                'AlbumArtUri': '',
            })
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
        }else {
            setTrack(props.entity as Track);
        }
    }, [props.entity]);




    return (
        <div className="flex items-center space-x-4 m-2">
            <img
                src={track?.AlbumArtUri}
                alt={track?.Title}
                className="w-16 h-16 rounded-sm"
            />
            <div>
                <h2 className="text-lg font-semibold">{track?.Title}</h2>
                <div className='flex'>
                    <h3 className='text-gray-400'>{track?.Artist}</h3>
                    <em className='text-gray-400'>&nbsp;-&nbsp;</em>
                    <h3 className='text-gray-400 font-semibold'>{track?.Album}</h3>
                </div>
                
            </div>
        </div>
    );
}

export default TrackEntity; 