import React, { createContext, useContext, useMemo, useReducer, useEffect, useState, act } from 'react';
import { Track } from '@svrooij/sonos/lib/models';
import { ipcService } from './ipcService';
import { SonosState } from '@svrooij/sonos/lib/models/sonos-state';

interface SonosStateType {
    playbackState: {
        mediaInfo: {
            NrTracks: number;
            MediaDuration: string;
            CurrentURI: string;
            PlayMedium: string;
            RecordMedium: string;
            WriteStatus: string;
        };
        muted: boolean;
        positionInfo: {
            Track: number;
            TrackDuration: string;
            TrackMetaData: Track; // Use Track type to hold metadata
            TrackURI: string;
            RelTime: string;  // Position in track (optimistic)
            AbsTime: string;
            RelCount: number;
            AbsCount: number;
        };
        transportState: string;
        volume: number;
    } | null;
    connectionStatus: string;

}

const initialState: SonosStateType = {
    playbackState: null,
    connectionStatus: '',
};

type SonosAction =
    | { type: 'SET_PLAYBACK_STATE'; payload: SonosStateType['playbackState'] }
    | { type: 'SET_CONNECTION_STATUS'; payload: string }
    | { type: 'SET_VOLUME'; payload: number }
    | { type: 'SET_TRACK_METADATA'; payload: Track }
    | { type: 'UPDATE_REL_TIME'; payload: string };

function sonosReducer(state: SonosStateType, action: SonosAction): SonosStateType {
    switch (action.type) {
        case 'SET_PLAYBACK_STATE':
            return { ...state, playbackState: action.payload };
        case 'SET_CONNECTION_STATUS':
            return { ...state, connectionStatus: action.payload };
        case 'SET_VOLUME':
            if (state.playbackState) {
                return {
                    ...state,
                    playbackState: {
                        ...state.playbackState,
                        volume: action.payload,
                    },
                };
            }
            return state;
        case 'SET_TRACK_METADATA':
            if (state.playbackState) {
                return {
                    ...state,
                    playbackState: {
                        ...state.playbackState,
                        positionInfo: {
                            ...state.playbackState.positionInfo,
                            TrackMetaData: action.payload,
                        },
                    },
                };
            }
            return state;
        case 'UPDATE_REL_TIME':
            if (state.playbackState) {
                return {
                    ...state,
                    playbackState: {
                        ...state.playbackState,
                        positionInfo: {
                            ...state.playbackState.positionInfo,
                            RelTime: action.payload,
                        },
                    },
                };
            }
            return state;
        default:
            return state;
    }
}

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
    listenToTrackMetadata: () => void;
    listenToMuteEvent: () => void;
    listenToVolumeEvent: () => void;
    listenToPlayPauseEvent: () => void;
}

export type PlayerAPI = SonosActions & SonosStateType;

const AudioPlayerContext = createContext<PlayerAPI | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(sonosReducer, initialState);
    const [optimisticRelTime, setOptimisticRelTime] = useState<number | null>(null);

    const actions: SonosActions = {
        connect: async (groupName: string) => {
            const result = await ipcService.connect(groupName);
            dispatch({ type: 'SET_CONNECTION_STATUS', payload: result });
            return result;
        },
        connectToServices: async () => {
            const result = await ipcService.connectToServices();
            dispatch({ type: 'SET_CONNECTION_STATUS', payload: result });
            return result;
        },
        togglePlayback: () => {
            ipcService.togglePlayback();
        },
        next: () => {
            ipcService.next();
        },
        previous: () => {
            ipcService.previous();
        },
        getPlaybackState: async () => {
            const playbackState = await ipcService.getPlaybackState();
            dispatch({ type: 'SET_PLAYBACK_STATE', payload: playbackState as SonosStateType['playbackState'] });
            return playbackState;
        },
        getVolume: async () => {
            const volume = await ipcService.getVolume();
            dispatch({ type: 'SET_VOLUME', payload: volume });
            return volume;
        },
        setVolume: (volume: number) => {
            ipcService.setVolume(volume);
            dispatch({ type: 'SET_VOLUME', payload: volume });
        },
        jumpToPointInQueue: (index: number) => {
            ipcService.jumpToPointInQueue(index);
        },
        getConnectionStatus: async () => {
            const status = await ipcService.getConnectionStatus();
            dispatch({ type: 'SET_CONNECTION_STATUS', payload: status });
            return status;
        },
        listenToTrackMetadata: () => {
            ipcService.listenToTrackMetadata((metadata: Track) => {
                console.log('Track metadata received:', metadata);
                dispatch({ type: 'SET_TRACK_METADATA', payload: metadata });
            });
        },
        listenToMuteEvent: () => {
            ipcService.listenToMuteEvent((mute) => {
                console.log('Mute event received:', mute);
                actions.getPlaybackState();
            });
        },
        listenToVolumeEvent: () => {
            ipcService.listenToVolumeEvent((volume) => {
                console.log('Volume event received:', volume);
                actions.getPlaybackState();
            });
        },
        listenToPlayPauseEvent: () => {
            ipcService.listenToPlayPauseEvent(() => {
                console.log('Play/Pause event received');
                actions.getPlaybackState();
            });
        },

    };

    useEffect(() => {
        const fetchInitialPlaybackState = async () => {
            try {
                const playbackState = await actions.getPlaybackState();
                console.log('Initial playback state fetched:', playbackState);
            } catch (error) {
                console.error('Error fetching initial playback state:', error);
            }
        };

        actions.connect("Harding Hub").then( () => {
            fetchInitialPlaybackState();
            actions.listenToTrackMetadata();
            actions.listenToMuteEvent();
            actions.listenToVolumeEvent();
            actions.listenToPlayPauseEvent();
        })


    }, []); // Empty dependency array ensures this runs only once when the component mounts


    // Effect for updating optimistic RelTime every second
    useEffect(() => {
        if (state.playbackState?.transportState === 'PLAYING' && optimisticRelTime !== null) {
            const interval = setInterval(() => {
                setOptimisticRelTime((prev) => (prev !== null ? prev + 1 : prev));
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [state.playbackState?.transportState, optimisticRelTime]);

    // Effect for syncing RelTime with Sonos every 5 seconds
    useEffect(() => {
        if (state.playbackState?.transportState === 'PLAYING') {
            const syncInterval = setInterval(async () => {
                const playbackState = await ipcService.getPlaybackState();
    
                dispatch({ type: 'SET_PLAYBACK_STATE', payload: playbackState as SonosStateType['playbackState'] });
    
                const newRelTime = playbackState.positionInfo.RelTime;
                const newRelTimeInSeconds = convertRelTimeToSeconds(newRelTime);
                setOptimisticRelTime(newRelTimeInSeconds);
            }, 5000);
    
            return () => clearInterval(syncInterval);
        }
    }, [state.playbackState?.transportState]);
    

    // Function to convert RelTime (string format like "0:02:19") to seconds
    function convertRelTimeToSeconds(relTime: string): number {
        const parts = relTime.split(':').map(Number);
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    // Update the `RelTime` in the state whenever `optimisticRelTime` changes
    useEffect(() => {
        if (optimisticRelTime !== null && state.playbackState) {
            const relTimeString = new Date(optimisticRelTime * 1000).toISOString().substr(12, 7);
            dispatch({ type: 'UPDATE_REL_TIME', payload: relTimeString });
        }
    }, [optimisticRelTime]);

    const value = useMemo(() => ({ ...state, ...actions }), [state]);

    return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}

export function useSonosContext() {
    const context = useContext(AudioPlayerContext);
    if (!context) {
        throw new Error('useSonosContext must be used within an AudioProvider');
    }
    return context;
}
