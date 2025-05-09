import type { Track } from "@svrooij/sonos/lib/models";
import type  { SonosGroupManager }  from "../../../main/SonosGroupManager";
import type { ArtistDetails } from "../../../main/MusicAPIService";

export const ipcService = {
    connect: (ipAddress?: string): Promise<boolean> => {
        return window.ipc.invoke('connect', ipAddress);
    },
    connectToServices: (): Promise<string> => {
        return window.ipc.invoke('connectToServices');
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

    getGenreInfo: (artistName: string, albumName: string): Promise<any> => {
        return window.ipc.invoke('get-genre-info', artistName, albumName);
    },

    getArtistDetails: (artistName: string): Promise<ArtistDetails> =>  {
        return window.ipc.invoke('getArtistDetails', artistName)
    }

};

// ipcService.ts

// assumes `window.ipc` is now exposed by contextBridge
export const sonos: SonosGroupManager = new Proxy({}, {
  get(_, method: string) {
    return (...args: any[]) => window.ipc.invoke(`sonos:${method}`, ...args);
  }
}) as SonosGroupManager;
