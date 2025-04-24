import { MediaItem } from '@svrooij/sonos/lib/musicservices/smapi-client';

export interface IArtistEntity extends MediaItem {

}

const ArtistEntity: React.FC<{ entity: IArtistEntity }> = (props) => {

    return (
<li className="relative hover:underline underline-offset-2 list-none">
  <div className="group aspect-square w-32 rounded-full overflow-hidden bg-gray-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
    <img
      alt=""
      src={props?.entity?.albumArtURI}
      className="w-full h-full object-cover group-hover:opacity-75"
    />
    <button type="button" className="absolute inset-0 focus:outline-none" />
  </div>
  <p className="pointer-events-none mt-2 block text-center truncate text-sm font-medium text-gray-50">
    {props?.entity?.title}
  </p>
</li>

    );
}

export default ArtistEntity; 