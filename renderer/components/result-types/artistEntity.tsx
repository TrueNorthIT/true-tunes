import { MediaItem } from '@svrooij/sonos/lib/musicservices/smapi-client';

export interface IArtistEntity extends MediaItem {

}

const ArtistEntity: React.FC<{ entity: IArtistEntity }> = (props) => {

    return (
        <li className="relative hover:underline underline-offset-2">
        <div className="group block w-full overflow-hidden rounded-full focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 bg-gray-200 focus-within:ring-offset-gray-100">
          <img alt="" src={props?.entity?.albumArtURI} className="pointer-events-none object-cover group-hover:opacity-75 rounded-full aspect-square" />
          <button type="button" className="absolute inset-0 focus:outline-none">
          </button>
        </div>
        <p className="pointer-events-none mt-2 block text-center truncate text-sm font-medium text-gray-50">{props?.entity?.title}</p>
      </li>
    );
}

export default ArtistEntity; 