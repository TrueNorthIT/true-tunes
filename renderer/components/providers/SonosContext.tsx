import { Track } from '@svrooij/sonos/lib/models';
import { SonosState } from '@svrooij/sonos/lib/models/sonos-state';
import { act, createContext, useContext, useMemo, useReducer, useRef } from 'react'



interface SonosActions {
    connect: (groupName: string) => Promise<string>;
    connectToServices: () => Promise<string>;
    togglePlayback: () => void;
    next: () => void;
    previous: () => void;
    getPlaybackState: () => Promise<SonosState>;
    getVolume: () => Promise<number>;
    setVolume: (volume: number) => void;
    jumpToPointInQueue: (index: number) => void;
    getConnectionStatus: () => Promise<string>;
    listenToTrackMetadata: (callback: (metadata: Track) => void) => void;
}


export type PlayerAPI = SonosActions

const actions = {
    connect: (groupName: string) => {
        return window.ipc.invoke<string>('connect', groupName)
    },
    connectToServices: () => {
        return window.ipc.invoke<string>('connectToServices')
    },
    togglePlayback: () => {
        window.ipc.invoke('togglePlayback')
    },
    next: () => {
        window.ipc.invoke('next')
    },
    previous: () => {
        window.ipc.invoke('previous')
    },
    getPlaybackState: () => {
        return window.ipc.invoke<SonosState>('getPlaybackState')
    },
    getVolume: () => {
        return window.ipc.invoke<number>('getVolume')
    },
    setVolume: (volume: number) => {
        window.ipc.invoke('setVolume', volume)
    },
    jumpToPointInQueue: (index: number) => {
        window.ipc.invoke('jumpToPointInQueue', index)
    },
    getConnectionStatus: () => {
        return window.ipc.invoke<string>('getConnectionStatus')
    },
    listenToTrackMetadata: (callback: (metadata: Track) => void) => {
        window.ipc.on('trackMetadata', ( metadata) => {
            callback(metadata)
        })
    }
}

const AudioPlayerContext = createContext<PlayerAPI>(actions);


export function AudioProvider({ children }: { children: React.ReactNode }) {

    return (
    <>
        <AudioPlayerContext.Provider value={actions}>
            {children}
        </AudioPlayerContext.Provider>
    </>
    )
}


export function useSonosContext() {
    let player = useContext(AudioPlayerContext)
    return player
}
