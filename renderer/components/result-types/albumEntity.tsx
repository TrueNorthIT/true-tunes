import { MediaItem } from '@svrooij/sonos/lib/musicservices/smapi-client';

export interface IAlbumEntity extends MediaItem {
    albumMetadata: {
        albumArtURI: string;
        artist: string;
        album: string;
    }
}

const AlbumEntity: React.FC<{entity: IAlbumEntity}> = (props) =>  {

    return (
        <div className="flex items-center space-x-4 m-2">
            <img
                src={props?.entity?.albumArtURI}
                alt={props?.entity?.title}
                className="w-16 h-16 rounded-sm"
            />
            <div>
                <h2 className="text-lg font-semibold">{props?.entity?.title}</h2>
                
            </div>
        </div>
    );
}

export default AlbumEntity; 