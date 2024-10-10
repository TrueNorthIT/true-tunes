import { MediaItem } from '@svrooij/sonos/lib/musicservices/smapi-client';

export interface ITrackEntity extends MediaItem {
    trackMetadata: {
        albumArtURI: string;
        artist: string;
        album: string;
    }
}

const TrackEntity: React.FC<{entity: ITrackEntity}> = (props) =>  {

    return (
        <div className="flex items-center space-x-4 m-2">
            <img
                src={props?.entity?.trackMetadata?.albumArtURI}
                alt={props?.entity?.title}
                className="w-16 h-16 rounded-sm"
            />
            <div>
                <h2 className="text-lg font-semibold">{props?.entity?.title}</h2>
                <div className='flex'>
                    <h3 className='text-gray-400'>{props?.entity?.trackMetadata?.artist}</h3>
                     <em className='text-gray-400'>&nbsp;-&nbsp;</em>
                     <h3 className='text-gray-400 font-semibold'>{props?.entity?.trackMetadata?.album}</h3>
                </div>
                
            </div>
        </div>
    );
}

export default TrackEntity; 