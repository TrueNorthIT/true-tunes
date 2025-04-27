import React, { createContext, useContext, useMemo, useReducer, useEffect, useState } from 'react';
import { BrowseResponse, Track } from '@svrooij/sonos/lib/models';
import { SonosState } from '@svrooij/sonos/lib/models/sonos-state';
import { MediaList } from '@svrooij/sonos/lib/musicservices/smapi-client';
import { SonosSearchTypes } from '../../enums/SonosSearchType';
import { Services } from '../../enums/Services';
import { ipcService, sonos } from './ipcService';

interface SonosStateType {
    playbackState?: Partial<SonosState>;
    connectionStatus: string;
    queue: Track[];
}

interface fullFatSearchResult {
    track: MediaList;
    album: MediaList;
    artist: MediaList;
}

type SonosAction =
    | { type: 'SET_PLAYBACK_STATE'; payload: SonosStateType['playbackState'] }
    | { type: 'SET_CONNECTION_STATUS'; payload: string }
    | { type: 'SET_VOLUME'; payload: number }
    | { type: 'UPDATE_REL_TIME'; payload: string }
    | { type: 'SET_QUEUE'; payload: BrowseResponse };

interface SonosActions {
    connect: (groupName?: string) => Promise<string>;
    connectToServices: () => Promise<string>;
    togglePlayback: () => void;
    toggleMute: () => void;
    seek: (time: string) => void;
    next: () => void;
    previous: () => void;
    getPlaybackState: () => Promise<SonosState>;
    getVolume: () => Promise<number>;
    setVolume: (volume: number) => void;
    jumpToPointInQueue: (index: number) => void;
    getConnectionStatus: () => Promise<string>;
    listenToTrackMetadata: () => void;
    listenToMuteEvent: () => void;
    listenToVolumeEvent: () => void;
    listenToPlayPauseEvent: () => void;
    search: (searchTerm: string, searchType: SonosSearchTypes, service: Services, resultCount: number) => Promise<MediaList>;
    fullFatSearch: (searchTerm: string, service: Services) => Promise<fullFatSearchResult>;
    playSongNow: (uri: string) => void;
    getQueue: () => Promise<Track[]>;
    reorderTracksInQueue: (startingIndex: number, numberOfTracks: number, insertBefore: number) => void;
    addToQueue: (uri: string, index?: number) => Promise<void>;
    playNext: (uri: string) => Promise<void>;
    getMetadata: (itemId: string) => Promise<MediaList>;
    removeFromQueue: (index: number) => void;
    removeRangeFromQueue: (index: number, count: number) => void;
}

const initialState: SonosStateType = {
    playbackState: null,
    connectionStatus: 'Disconnected',
    queue: []
};

function sonosReducer(state: SonosStateType, action: SonosAction): SonosStateType {
    switch (action.type) {
        case 'SET_PLAYBACK_STATE':
            return { ...state, playbackState: action.payload };
        case 'SET_CONNECTION_STATUS':
            return { ...state, connectionStatus: action.payload };
        case 'SET_VOLUME':
            return state.playbackState
                ? { ...state, playbackState: { ...state.playbackState, volume: action.payload } }
                : state;
        case 'UPDATE_REL_TIME':
            return state.playbackState
                ? {
                    ...state,
                    playbackState: {
                        ...state.playbackState,
                        positionInfo: {
                            ...state.playbackState.positionInfo,
                            RelTime: action.payload,
                        },
                    },
                }
                : state;
        case 'SET_QUEUE':
            return typeof action.payload.Result === 'string' ? state : { ...state, queue: action.payload.Result };
        default:
            return state;
    }
}

interface SonosQueue {
    queue: Track[];
    currentTrackIndex: number;
}

const SonosQueueContext = createContext<SonosQueue | undefined>(undefined);
const SonosStateContext = createContext<SonosStateType | undefined>(undefined);
const SonosActionsContext = createContext<SonosActions | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(sonosReducer, initialState);
    const [optimisticRelTime, setOptimisticRelTime] = useState<number | null>(null);

    const actions: SonosActions = useMemo(() => createActions(dispatch, setOptimisticRelTime), [dispatch]);

    const queue = useMemo(() => state.queue, [state.queue]);
    const currentTrackIndex = useMemo(() => {
        if (state.playbackState?.positionInfo) {
            return state.playbackState.positionInfo.Track ;
        }
        return 0;
    }, [state.playbackState?.positionInfo]);


    const sonosQueueState = useMemo(() => ({ queue, currentTrackIndex }), [queue, currentTrackIndex]);

    useEffect(() => {
        const fetchInitialState = async () => {
            try {
                await actions.getPlaybackState();
                await actions.getQueue();
            } catch (error) {
                console.error('Error fetching initial state:', error);
            }
        };

        actions.connect().then(async () => {
            await actions.connectToServices();
            fetchInitialState();
            actions.listenToTrackMetadata();
            actions.listenToMuteEvent();
            actions.listenToVolumeEvent();
            actions.listenToPlayPauseEvent();
        });
    }, [actions]);

    useEffect(() => {
        if (state.playbackState?.transportState === 'PLAYING' && optimisticRelTime !== null) {
            const interval = setInterval(() => {
                setOptimisticRelTime((prev) => (prev !== null ? prev + 1 : prev));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [state.playbackState?.transportState, optimisticRelTime]);

    useEffect(() => {
        if (state.playbackState?.transportState === 'PLAYING') {
            const syncInterval = setInterval(async () => {
                const playbackState = await actions.getPlaybackState();
                const newRelTimeInSeconds = convertRelTimeToSeconds(playbackState.positionInfo.RelTime);
                setOptimisticRelTime(newRelTimeInSeconds);
            }, 5000);
            return () => clearInterval(syncInterval);
        }
    }, [state.playbackState?.transportState, actions]);

    useEffect(() => {
        document.title =
            `TrueTunes : ${state.playbackState?.positionInfo.TrackMetaData.Title} - ${state.playbackState?.positionInfo.TrackMetaData.Artist}` ||
            'TrueTunes';
    }, [state.playbackState?.mediaInfo]);

    useEffect(() => {
        if (optimisticRelTime !== null && state.playbackState) {
            const relTimeString = convertSecondsToRelTime(optimisticRelTime);
            dispatch({ type: 'UPDATE_REL_TIME', payload: relTimeString });
        }
    }, [optimisticRelTime]);

    return (
        <SonosStateContext.Provider value={state}>
            <SonosActionsContext.Provider value={actions}>
                <SonosQueueContext.Provider value={sonosQueueState}>
                    {children}
                </SonosQueueContext.Provider>
            </SonosActionsContext.Provider>
        </SonosStateContext.Provider>
    );
}

export function useSonosQueue() {
    const context = useContext(SonosQueueContext);
    if (!context) throw new Error('useSonosQueue must be used within an AudioProvider');
    return context;
}

export function useSonosState() {
    const context = useContext(SonosStateContext);
    if (!context) throw new Error('useSonosState must be used within an AudioProvider');
    return context;
}

export function useSonosActions() {
    const context = useContext(SonosActionsContext);
    if (!context) throw new Error('useSonosActions must be used within an AudioProvider');
    return context;
}

function createActions(dispatch: React.Dispatch<SonosAction>, setOptimisticRelTime: React.Dispatch<React.SetStateAction<number | null>>): SonosActions {
    async function refreshPlaybackStateAndQueue() {
        const playbackState = await sonos.GetPlaybackState();
        dispatch({ type: 'SET_PLAYBACK_STATE', payload: playbackState });
        const newRelTimeInSeconds = convertRelTimeToSeconds(playbackState.positionInfo.RelTime);
        setOptimisticRelTime(newRelTimeInSeconds);

        const queue = await sonos.GetQueue();
        if (typeof queue.Result !== 'string') {
            dispatch({ type: 'SET_QUEUE', payload: queue });
        }
    }

    async function refreshPlaybackState() {
        const playbackState = await sonos.GetPlaybackState();
        dispatch({ type: 'SET_PLAYBACK_STATE', payload: playbackState });
        const newRelTimeInSeconds = convertRelTimeToSeconds(playbackState.positionInfo.RelTime);
        setOptimisticRelTime(newRelTimeInSeconds);
    }

    return {
        connect: async (groupName) => {
            const result = await ipcService.connect(groupName || '');
            dispatch({ type: 'SET_CONNECTION_STATUS', payload: result });
            return result;
        },
        connectToServices: async () => {
            const result = await ipcService.connectToServices();
            dispatch({ type: 'SET_CONNECTION_STATUS', payload: result });
            return result;
        },
        seek: (time) => { sonos.SeekToPosition(time); },
        togglePlayback: () => { sonos.TogglePlayback(); },
        toggleMute: () => { sonos.ToggleMute(); },
        next: () => { sonos.Next(); },
        previous: () => { sonos.Previous(); },
        getPlaybackState: async () => {
            const playbackState = await sonos.GetPlaybackState();
            dispatch({ type: 'SET_PLAYBACK_STATE', payload: playbackState });
            const newRelTimeInSeconds = convertRelTimeToSeconds(playbackState.positionInfo.RelTime);
            setOptimisticRelTime(newRelTimeInSeconds);
            return playbackState;
        },
        getVolume: async () => {
            const volume = await sonos.GetVolume();
            dispatch({ type: 'SET_VOLUME', payload: volume });
            return volume;
        },
        setVolume: (volume) => {
            sonos.SetVolume(volume);
            dispatch({ type: 'SET_VOLUME', payload: volume });
        },
        jumpToPointInQueue: (index) => { sonos.JumpToPointInQueue(index + 1); },
        getQueue: async () => {
            const queue = await sonos.GetQueue();
            if (typeof queue.Result !== 'string') {
                dispatch({ type: 'SET_QUEUE', payload: queue });
                return queue.Result;
            }
            return [];
        },
        getConnectionStatus: async () => {
            const status = await sonos.GetConnectionStatus();
            dispatch({ type: 'SET_CONNECTION_STATUS', payload: status !== null && status.length > 0 ? 'Connected' : 'Disconnected' });
            return status !== null && status.length > 0 ? 'Connected' : 'Disconnected';
        },
        listenToTrackMetadata: () => {
            ipcService.listenToTrackMetadata(async () => {
                await refreshPlaybackStateAndQueue();
            });
        },
        listenToMuteEvent: () => {
            ipcService.listenToMuteEvent(async () => {
                await refreshPlaybackState();
            });
        },
        listenToVolumeEvent: () => {
            ipcService.listenToVolumeEvent(async () => {
                await refreshPlaybackState();
            });
        },
        listenToPlayPauseEvent: () => {
            ipcService.listenToPlayPauseEvent(async () => {
                await refreshPlaybackState();
            });
        },
        search: async (term, type, service, count) => {
            return await sonos.Search(term, type, service, count);
        },
        fullFatSearch: async (term, service) => {
            return {
                track: await sonos.Search(term, SonosSearchTypes.Track, service, 12),
                album: await sonos.Search(term, SonosSearchTypes.Album, service, 12),
                artist: await sonos.Search(term, SonosSearchTypes.Artist, service, 20)
            };
        },
        playSongNow: (uri) => { sonos.PlaySongNow(uri); },
        reorderTracksInQueue: (start, count, insertBefore) => { sonos.ReorderTracksInQueue(start, count, insertBefore); },
        addToQueue: async (uri, index) => { await sonos.AddToQueue(uri, index); },
        playNext: async (uri) => {
            const playbackState = await sonos.GetPlaybackState();
            await sonos.AddToQueue(uri, playbackState.positionInfo.Track + 1);
        },
        getMetadata: async (itemId) => { return await sonos.GetMetadata(Services.Spotify, itemId); },
        removeFromQueue: (index) => { sonos.RemoveTrackRangeFromQueue(index, 1); },
        removeRangeFromQueue: (index, count) => { sonos.RemoveTrackRangeFromQueue(index, count); }
    };
}


function convertRelTimeToSeconds(relTime: string): number {
    const parts = relTime.split(':').map(Number);
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

function convertSecondsToRelTime(seconds: number): string {
    const date = new Date(seconds * 1000);
    return date.toISOString().substr(12, 7);
}
