import { MediaItem } from '@svrooij/sonos/lib/musicservices/smapi-client';

export interface IArtistEntity extends MediaItem {

}

const ArtistEntity: React.FC<{ entity: IArtistEntity }> = (props) => {

    return (
        <li
            className="col-span-1 flex flex-col divide-y rounded-lg border bg-gray-950 border-gray-300 text-center shadow focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
        >
            <a href="#" className="focus:outline-none">
                <div className="flex flex-1 flex-col p-8">

                    <img alt="" src={props?.entity?.albumArtURI} className="mx-auto flex-shrink-0 rounded-full aspect-square" />
                    <h3 className="mt-6 text-sm font-medium text-gray-50">{props?.entity?.title}</h3>
                    <dl className="mt-1 flex flex-grow flex-col justify-between"></dl>

                </div>
            </a>
        </li>
    );
}

export default ArtistEntity; 