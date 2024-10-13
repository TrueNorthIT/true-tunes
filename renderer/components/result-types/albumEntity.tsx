import { MediaItem } from '@svrooij/sonos/lib/musicservices/smapi-client';

export interface IAlbumEntity extends MediaItem {
    artist: string;
}

const AlbumEntity: React.FC<{entity: IAlbumEntity}> = (props) =>  {

    return (
        <li className="relative">
          <div className="group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
            <img alt="" src={props?.entity?.albumArtURI} className="pointer-events-none object-cover group-hover:opacity-75" />
            <button type="button" className="absolute inset-0 focus:outline-none">
            </button>
          </div>
          <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-50">{props?.entity?.title}</p>
          <p className="pointer-events-none block text-sm font-medium text-gray-400">{props?.entity?.artist}</p>
        </li>
    );
}

export default AlbumEntity; 