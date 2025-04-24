import { MediaItem } from '@svrooij/sonos/lib/musicservices/smapi-client';

export interface IAlbumEntity extends MediaItem {
    artist: string;
    artistId: string;
}

interface Props {
    entity: IAlbumEntity;
    onSelect?: () => void; // Optional onClick handler
}


const AlbumEntity: React.FC<Props> = (props) =>  {

    const handleClick = (event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent event bubbling
        props?.onSelect?.(); // Safely call the onClick handler if it exists
    };

    return (
        <li className="relative hover:underline underline-offset-2 list-none">
          <div className="group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
            <img alt="" src={props?.entity?.albumArtURI} className="pointer-events-none object-cover group-hover:opacity-75" />
            <button type="button" className="absolute inset-0 focus:outline-none" onClick={handleClick}>
            </button>
          </div>
          <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-50">{props?.entity?.title}</p>
          <p className="pointer-events-none block text-sm font-medium text-gray-400">{props?.entity?.artist}</p>
        </li>
    );
}

export default AlbumEntity;