import ImageWithFallback from '@components/ImageWithFallback';
import type { MediaItem } from '@svrooij/sonos/lib/musicservices/smapi-client';
import React from 'react';

export interface IArtistEntity extends MediaItem {

}

interface Props {
  entity: TN_Artist;
  onSelect?: () => void; // Optional onClick handler
}

const ArtistEntity: React.FC<Props> = (props) => {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent event bubbling
    props?.onSelect?.(); // Safely call the onClick handler if it exists
  };

  return (
    <li className="relative hover:underline underline-offset-2 list-none ">
        <div className="group aspect-square rounded-full aspect-w-10 block w-full overflow-hidden bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
            <ImageWithFallback alt="" src={props.entity.artURI} className="w-full h-full pointer-events-none object-cover group-hover:opacity-75" />
            <button type="button" className="absolute inset-0 focus:outline-none" onClick={handleClick}>
            </button>
        </div>
        <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-50 text-center">{props.entity.name}</p>
    </li>
);

 
}

export default ArtistEntity; 