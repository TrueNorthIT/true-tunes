import { Track } from "@svrooij/sonos/lib/models";
import { SonosState } from "@svrooij/sonos/lib/models/sonos-state";
import { MediaList } from "@svrooij/sonos/lib/musicservices/smapi-client";


export const ipcService = {
    connect: (groupName: string): Promise<string> => {
        return window.ipc.invoke('connect', groupName);
    },
    connectToServices: (): Promise<string> => {
        return window.ipc.invoke('connectToServices');
    },
    togglePlayback: (): void => {
        window.ipc.invoke('togglePlayback');
    },
    toggleMute: (): void => {
        window.ipc.invoke('toggleMute');
    },
    seek: (time: string) => {
        window.ipc.invoke('seek', time);
    },
    next: (): void => {
        window.ipc.invoke('next');
    },
    previous: (): void => {
        window.ipc.invoke('previous');
    },
    getPlaybackState: (): Promise<SonosState> => {
        return window.ipc.invoke<SonosState>('getPlaybackState');
    },
    getVolume: (): Promise<number> => {
        return window.ipc.invoke<number>('getVolume');
    },
    setVolume: (volume: number): void => {
        window.ipc.invoke('setVolume', volume);
    },
    jumpToPointInQueue: (index: number): void => {
        window.ipc.invoke('jumpToPointInQueue', index);
    },
    getConnectionStatus: (): Promise<string> => {
        return window.ipc.invoke<string>('getConnectionStatus');
    },
    listenToTrackMetadata: (callback: (metadata: Track) => void): void => {
        window.ipc.on('trackMetadata', (metadata) => {
            callback(metadata);
        });
    },
    listenToMuteEvent: (callback: (mute: boolean) => void): void => {
        window.ipc.on('mute', (mute) => {
            callback(mute as boolean);
        });
    },
    listenToVolumeEvent: (callback: (volume: number) => void): void => {
        window.ipc.on('volume', (volume) => {
            callback(volume as number);
        });
    },
    listenToPlayPauseEvent: (callback: () => void): void => {
        window.ipc.on('playbackState', () => {
            callback();
        });
    },
    search: (searchTerm: string, searchType: string, service: number, resultCount: number): Promise<MediaList> => {
        return window.ipc.invoke<MediaList>('search', searchTerm, searchType, service, resultCount);
    }
    

};
