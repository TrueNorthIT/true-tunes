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
          className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-gray-950 px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
        >
          <div className="flex-shrink-0">
            <img alt="" src={props?.entity?.trackMetadata?.albumArtURI} className="h-14 w-14 rounded-sm" />
          </div>
          <div className="min-w-0 flex-1">
            <a href="#" className="focus:outline-none">
              <span aria-hidden="true" className="absolute inset-0" />
              <p className="text-sm font-medium text-gray-50">{props?.entity?.title}</p>
              <p className="truncate text-sm text-gray-300">{props?.entity?.trackMetadata?.artist}</p>
            </a>
          </div>
        </div>
    );
}

export default TrackEntity; 