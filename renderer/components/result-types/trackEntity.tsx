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
        <div
          className="relative flex items-center space-x-3 rounded-lg border border-gray-950 bg-gray-950 px-6 lg:py-3 sm:py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
        >
          <div className="flex-shrink">
            <img alt="" src={props?.entity?.trackMetadata?.albumArtURI} className="lg:h-14 lg:w-14 md:h-10 md:w-10 sm:h-10 sm:w-10 rounded-sm" />
          </div>
          <div className="min-w-0 flex-1">
            <a href="#" className="focus:outline-none">
              <span aria-hidden="true" className="absolute inset-0" />
              <p className=" truncate text-sm font-medium text-gray-50">{props?.entity?.title}</p>
              <p className="truncate text-sm text-gray-300 hover:underline underline-offset-2">{props?.entity?.trackMetadata?.artist}</p>
            </a>
          </div>
        </div>
    );
}

export default TrackEntity; 