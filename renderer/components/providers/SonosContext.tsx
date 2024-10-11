import React, { createContext, useContext, useMemo, useReducer, useEffect, useState } from 'react';
import { BrowseResponse, Track } from '@svrooij/sonos/lib/models';
import { ipcService } from './ipcService';
import { SonosState } from '@svrooij/sonos/lib/models/sonos-state';
import { MediaList } from '@svrooij/sonos/lib/musicservices/smapi-client';
import { SonosSearchTypes } from '../../enums/SonosSearchType';
import { Services } from '../../enums/Services';

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
            TrackMetaData: Track;
            TrackURI: string;
            RelTime: string;
            AbsTime: string;
            RelCount: number;
            AbsCount: number;
        };
        transportState: string;
        volume: number;
    } | null;
    connectionStatus: string;
    queue: Track[]; // Add queue state
}

const initialState: SonosStateType = {
    "playbackState": {
        "mediaInfo": {
            "NrTracks": 20,
            "MediaDuration": "NOT_IMPLEMENTED",
            "CurrentURI": "x-rincon-queue:RINCON_000E588DE3D801400#0",
            "PlayMedium": "NETWORK",
            "RecordMedium": "NOT_IMPLEMENTED",
            "WriteStatus": "NOT_IMPLEMENTED"
        },
        "muted": false,
        "positionInfo": {
            "Track": 1,
            "TrackDuration": "0:04:36",
            "TrackMetaData": {
                "Album": "Moon Music (Full Moon Edition)",
                "Artist": "Coldplay, Jon Hopkins",
                "AlbumArtUri": "https://i.scdn.co/image/ab67616d00001e02ed4cd21086be1931a5b9d2c9",
                "Title": "MOON MUSiC",
                "UpnpClass": "object.item.audioItem.musicTrack",
                "Duration": "0:04:36",
                "ItemId": "-1",
                "ParentId": "-1",
                "TrackUri": "x-sonos-http:track/391126375.flac?sid=174&flags=24608&sn=7",
                "ProtocolInfo": "sonos.com-http:*:audio/flac:*"
            },
            "TrackURI": "x-sonos-http:track/391126375.flac?sid=174&flags=24608&sn=7",
            "RelTime": "0:00:38",
            "AbsTime": "NOT_IMPLEMENTED",
            "RelCount": 2147483647,
            "AbsCount": 2147483647
        },
        "transportState": "STOPPED",
        "volume": 11
    },
    "connectionStatus": "Connected",
    "queue": [
        {
            "Album": "Moon Music (Full Moon Edition)",
            "Artist": "Coldplay, Jon Hopkins",
            "AlbumArtUri": "https://i.scdn.co/image/ab67616d00001e02ed4cd21086be1931a5b9d2c9",
            "Title": "MOON MUSiC",
            "UpnpClass": "object.item.audioItem.musicTrack",
            "Duration": "0:04:36",
            "ItemId": "Q:0/1",
            "ParentId": "Q:0",
            "TrackUri": "x-sonos-http:track/391126375.flac?sid=174&flags=24608&sn=7",
            "ProtocolInfo": "sonos.com-http:*:audio/flac:*"
        },
        {
            "Album": "Moon Music (Full Moon Edition)",
            "Artist": "Coldplay",
            "AlbumArtUri": "https://i.scdn.co/image/ab67616d00001e02ed4cd21086be1931a5b9d2c9",
            "Title": "feelslikeimfallinginlove",
            "UpnpClass": "object.item.audioItem.musicTrack",
            "Duration": "0:03:56",
            "ItemId": "Q:0/2",
            "ParentId": "Q:0",
            "TrackUri": "x-sonos-http:track/391126377.flac?sid=174&flags=24608&sn=7",
            "ProtocolInfo": "sonos.com-http:*:audio/flac:*"
        },
        {
            "Album": "Moon Music (Full Moon Edition)",
            "Artist": "Coldplay, Little Simz, Burna Boy, Elyanna, Tini",
            "AlbumArtUri": "https://i.scdn.co/image/ab67616d00001e02ed4cd21086be1931a5b9d2c9",
            "Title": "WE PRAY",
            "UpnpClass": "object.item.audioItem.musicTrack",
            "Duration": "0:03:53",
            "ItemId": "Q:0/3",
            "ParentId": "Q:0",
            "TrackUri": "x-sonos-http:track/391126379.flac?sid=174&flags=24608&sn=7",
            "ProtocolInfo": "sonos.com-http:*:audio/flac:*"
        },
        {
            "Album": "Moon Music (Full Moon Edition)",
            "Artist": "Coldplay",
            "AlbumArtUri": "https://i.scdn.co/image/ab67616d00001e02ed4cd21086be1931a5b9d2c9",
            "Title": "JUPiTER",
            "UpnpClass": "object.item.audioItem.musicTrack",
            "Duration": "0:04:01",
            "ItemId": "Q:0/4",
            "ParentId": "Q:0",
            "TrackUri": "x-sonos-http:track/391126381.flac?sid=174&flags=24608&sn=7",
            "ProtocolInfo": "sonos.com-http:*:audio/flac:*"
        },
        {
            "Album": "Moon Music (Full Moon Edition)",
            "Artist": "Coldplay, Ayra Starr",
            "AlbumArtUri": "https://i.scdn.co/image/ab67616d00001e02ed4cd21086be1931a5b9d2c9",
            "Title": "GOOD FEELiNGS",
            "UpnpClass": "object.item.audioItem.musicTrack",
            "Duration": "0:03:37",
            "ItemId": "Q:0/5",
            "ParentId": "Q:0",
            "TrackUri": "x-sonos-http:track/391126382.flac?sid=174&flags=24608&sn=7",
            "ProtocolInfo": "sonos.com-http:*:audio/flac:*"
        },
        {
            "Album": "Moon Music (Full Moon Edition)",
            "Artist": "Coldplay",
            "AlbumArtUri": "https://i.scdn.co/image/ab67616d00001e02ed4cd21086be1931a5b9d2c9",
            "Title": "🌈",
            "UpnpClass": "object.item.audioItem.musicTrack",
            "Duration": "0:06:10",
            "ItemId": "Q:0/6",
            "ParentId": "Q:0",
            "TrackUri": "x-sonos-http:track/391126384.flac?sid=174&flags=24608&sn=7",
            "ProtocolInfo": "sonos.com-http:*:audio/flac:*"
        },
        {
            "Album": "Moon Music (Full Moon Edition)",
            "Artist": "Coldplay",
            "AlbumArtUri": "https://i.scdn.co/image/ab67616d00001e02ed4cd21086be1931a5b9d2c9",
            "Title": "iAAM",
            "UpnpClass": "object.item.audioItem.musicTrack",
            "Duration": "0:03:03",
            "ItemId": "Q:0/7",
            "ParentId": "Q:0",
            "TrackUri": "x-sonos-http:track/391126385.flac?sid=174&flags=24608&sn=7",
            "ProtocolInfo": "sonos.com-http:*:audio/flac:*"
        },
        {
            "Album": "Moon Music (Full Moon Edition)",
            "Artist": "Coldplay",
            "AlbumArtUri": "https://i.scdn.co/image/ab67616d00001e02ed4cd21086be1931a5b9d2c9",
            "Title": "AETERNA",
            "UpnpClass": "object.item.audioItem.musicTrack",
            "Duration": "0:04:13",
            "ItemId": "Q:0/8",
            "ParentId": "Q:0",
            "TrackUri": "x-sonos-http:track/391126386.flac?sid=174&flags=24608&sn=7",
            "ProtocolInfo": "sonos.com-http:*:audio/flac:*"
        },
        {
            "Album": "Moon Music (Full Moon Edition)",
            "Artist": "Coldplay",
            "AlbumArtUri": "https://i.scdn.co/image/ab67616d00001e02ed4cd21086be1931a5b9d2c9",
            "Title": "ALL MY LOVE",
            "UpnpClass": "object.item.audioItem.musicTrack",
            "Duration": "0:03:43",
            "ItemId": "Q:0/9",
            "ParentId": "Q:0",
            "TrackUri": "x-sonos-http:track/391126388.flac?sid=174&flags=24608&sn=7",
            "ProtocolInfo": "sonos.com-http:*:audio/flac:*"
        },
        {
            "Album": "Moon Music (Full Moon Edition)",
            "Artist": "Coldplay",
            "AlbumArtUri": "https://i.scdn.co/image/ab67616d00001e02ed4cd21086be1931a5b9d2c9",
            "Title": "ONE WORLD",
            "UpnpClass": "object.item.audioItem.musicTrack",
            "Duration": "0:06:48",
            "ItemId": "Q:0/10",
            "ParentId": "Q:0",
            "TrackUri": "x-sonos-http:track/391126389.flac?sid=174&flags=24608&sn=7",
            "ProtocolInfo": "sonos.com-http:*:audio/flac:*"
        },
        {
            "Album": "Moon Music (Full Moon Edition)",
            "Artist": "Coldplay",
            "AlbumArtUri": "https://i.scdn.co/image/ab67616d00001e02ed4cd21086be1931a5b9d2c9",
            "Title": "Moon Music (Elodie)",
            "UpnpClass": "object.item.audioItem.musicTrack",
            "Duration": "0:02:46",
            "ItemId": "Q:0/11",
            "ParentId": "Q:0",
            "TrackUri": "x-sonos-http:track/391126391.flac?sid=174&flags=24608&sn=7",
            "ProtocolInfo": "sonos.com-http:*:audio/flac:*"
        },
        {
            "Album": "Moon Music (Full Moon Edition)",
            "Artist": "Coldplay",
            "AlbumArtUri": "https://i.scdn.co/image/ab67616d00001e02ed4cd21086be1931a5b9d2c9",
            "Title": "feelslikeimfallinginlive",
            "UpnpClass": "object.item.audioItem.musicTrack",
            "Duration": "0:04:36",
            "ItemId": "Q:0/12",
            "ParentId": "Q:0",
            "TrackUri": "x-sonos-http:track/391126392.flac?sid=174&flags=24608&sn=7",
            "ProtocolInfo": "sonos.com-http:*:audio/flac:*"
        },
        {
            "Album": "Moon Music (Full Moon Edition)",
            "Artist": "Coldplay",
            "AlbumArtUri": "https://i.scdn.co/image/ab67616d00001e02ed4cd21086be1931a5b9d2c9",
            "Title": "The Karate Kid",
            "UpnpClass": "object.item.audioItem.musicTrack",
            "Duration": "0:02:55",
            "ItemId": "Q:0/13",
            "ParentId": "Q:0",
            "TrackUri": "x-sonos-http:track/391126395.flac?sid=174&flags=24608&sn=7",
            "ProtocolInfo": "sonos.com-http:*:audio/flac:*"
        },
        {
            "Album": "Moon Music (Full Moon Edition)",
            "Artist": "Coldplay, Little Simz, Burna Boy, Elyanna, Tini",
            "AlbumArtUri": "https://i.scdn.co/image/ab67616d00001e02ed4cd21086be1931a5b9d2c9",
            "Title": "We Pray (Be Our Guest)",
            "UpnpClass": "object.item.audioItem.musicTrack",
            "Duration": "0:03:53",
            "ItemId": "Q:0/14",
            "ParentId": "Q:0",
            "TrackUri": "x-sonos-http:track/391126396.flac?sid=174&flags=24608&sn=7",
            "ProtocolInfo": "sonos.com-http:*:audio/flac:*"
        },
        {
            "Album": "Moon Music (Full Moon Edition)",
            "Artist": "Coldplay",
            "AlbumArtUri": "https://i.scdn.co/image/ab67616d00001e02ed4cd21086be1931a5b9d2c9",
            "Title": "Angelsong",
            "UpnpClass": "object.item.audioItem.musicTrack",
            "Duration": "0:04:22",
            "ItemId": "Q:0/15",
            "ParentId": "Q:0",
            "TrackUri": "x-sonos-http:track/391126397.flac?sid=174&flags=24608&sn=7",
            "ProtocolInfo": "sonos.com-http:*:audio/flac:*"
        },
        {
            "Album": "Moon Music (Full Moon Edition)",
            "Artist": "Coldplay",
            "AlbumArtUri": "https://i.scdn.co/image/ab67616d00001e02ed4cd21086be1931a5b9d2c9",
            "Title": "Jupiter (Single Version)",
            "UpnpClass": "object.item.audioItem.musicTrack",
            "Duration": "0:02:53",
            "ItemId": "Q:0/16",
            "ParentId": "Q:0",
            "TrackUri": "x-sonos-http:track/391126399.flac?sid=174&flags=24608&sn=7",
            "ProtocolInfo": "sonos.com-http:*:audio/flac:*"
        },
        {
            "Album": "Moon Music (Full Moon Edition)",
            "Artist": "Coldplay",
            "AlbumArtUri": "https://i.scdn.co/image/ab67616d00001e02ed4cd21086be1931a5b9d2c9",
            "Title": "Man in The Moon",
            "UpnpClass": "object.item.audioItem.musicTrack",
            "Duration": "0:03:55",
            "ItemId": "Q:0/17",
            "ParentId": "Q:0",
            "TrackUri": "x-sonos-http:track/391126405.flac?sid=174&flags=24608&sn=7",
            "ProtocolInfo": "sonos.com-http:*:audio/flac:*"
        },
        {
            "Album": "Moon Music (Full Moon Edition)",
            "Artist": "Coldplay",
            "AlbumArtUri": "https://i.scdn.co/image/ab67616d00001e02ed4cd21086be1931a5b9d2c9",
            "Title": "i Am A Mountain",
            "UpnpClass": "object.item.audioItem.musicTrack",
            "Duration": "0:03:07",
            "ItemId": "Q:0/18",
            "ParentId": "Q:0",
            "TrackUri": "x-sonos-http:track/391126410.flac?sid=174&flags=24608&sn=7",
            "ProtocolInfo": "sonos.com-http:*:audio/flac:*"
        },
        {
            "Album": "Moon Music (Full Moon Edition)",
            "Artist": "Coldplay",
            "AlbumArtUri": "https://i.scdn.co/image/ab67616d00001e02ed4cd21086be1931a5b9d2c9",
            "Title": "All My Love (Live in Dublin)",
            "UpnpClass": "object.item.audioItem.musicTrack",
            "Duration": "0:04:06",
            "ItemId": "Q:0/19",
            "ParentId": "Q:0",
            "TrackUri": "x-sonos-http:track/391126413.flac?sid=174&flags=24608&sn=7",
            "ProtocolInfo": "sonos.com-http:*:audio/flac:*"
        },
        {
            "Album": "Moon Music (Full Moon Edition)",
            "Artist": "Coldplay",
            "AlbumArtUri": "https://i.scdn.co/image/ab67616d00001e02ed4cd21086be1931a5b9d2c9",
            "Title": "👋",
            "UpnpClass": "object.item.audioItem.musicTrack",
            "Duration": "0:02:33",
            "ItemId": "Q:0/20",
            "ParentId": "Q:0",
            "TrackUri": "x-sonos-http:track/391126417.flac?sid=174&flags=24608&sn=7",
            "ProtocolInfo": "sonos.com-http:*:audio/flac:*"
        }
    ]
}

type SonosAction =
    | { type: 'SET_PLAYBACK_STATE'; payload: SonosStateType['playbackState'] }
    | { type: 'SET_CONNECTION_STATUS'; payload: string }
    | { type: 'SET_VOLUME'; payload: number }
    | { type: 'UPDATE_REL_TIME'; payload: string }
    | { type: 'SET_QUEUE'; payload: BrowseResponse }; // New action for queue

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
        case 'SET_QUEUE':
            if (typeof action.payload.Result === 'string') return;
            return { ...state, queue: action.payload.Result };
        default:
            return state;
    }
}

interface SonosActions {
    connect: (groupName: string) => Promise<string>;
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
    getQueue: () => Promise<Track[]>;
    search: (searchTerm: string, searchType: SonosSearchTypes, service: Services) => Promise<MediaList>;
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
        seek: (time: string) => {
            ipcService.seek(time);
        },
        togglePlayback: () => {
            ipcService.togglePlayback();
        },
        toggleMute: () => {
            ipcService.toggleMute();
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
            const newRelTime = playbackState.positionInfo.RelTime;
            const newRelTimeInSeconds = convertRelTimeToSeconds(newRelTime);
            setOptimisticRelTime(newRelTimeInSeconds); // Reset optimisticRelTime on full state refresh
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
        getQueue: async () => {
            const queue = await ipcService.getQueue();
            if (typeof queue.Result === 'string') return;
            dispatch({ type: 'SET_QUEUE', payload: queue });
            return queue.Result;
        },
        getConnectionStatus: async () => {
            const status = await ipcService.getConnectionStatus();
            dispatch({ type: 'SET_CONNECTION_STATUS', payload: status });
            return status;
        },
        listenToTrackMetadata: () => {
            ipcService.listenToTrackMetadata(async (metadata: Track) => {
                console.log('Track metadata received:', metadata);
                actions.getPlaybackState();
                await actions.getQueue(); // Fetch queue on metadata change
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
        search: async (searchTerm: string, searchType: SonosSearchTypes, service: Services) => {
            const result = await ipcService.search(searchTerm, searchType, service);
            return result;
        },
    };

    useEffect(() => {
        const fetchInitialState = async () => {
            try {
                const playbackState = await actions.getPlaybackState();
                await actions.getQueue(); // Fetch queue on mount
                console.log('Initial playback state and queue fetched:', playbackState);
            } catch (error) {
                console.error('Error fetching initial state:', error);
            }
        };

        actions.connect('Office + 1').then(() => {
            fetchInitialState();
            actions.listenToTrackMetadata();
            actions.listenToMuteEvent();
            actions.listenToVolumeEvent();
            actions.listenToPlayPauseEvent();
        });
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
                const state = await actions.getPlaybackState();
                const newRelTime = state.positionInfo.RelTime;
                const newRelTimeInSeconds = convertRelTimeToSeconds(newRelTime);
                setOptimisticRelTime(newRelTimeInSeconds);
            }, 5000);

            return () => clearInterval(syncInterval);
        }
    }, [state.playbackState?.transportState]);

    // Update the document title with the current track info
    useEffect(() => {
        document.title =
            `TrueTunes : ${state.playbackState?.positionInfo.TrackMetaData.Title} - ${state.playbackState?.positionInfo.TrackMetaData.Artist} ` ||
            'TrueTunes';
    }, [state.playbackState?.mediaInfo]);

    // Function to convert RelTime (string format like "0:02:19") to seconds
    function convertRelTimeToSeconds(relTime: string): number {
        const parts = relTime.split(':').map(Number);
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    function convertSecondsToRelTime(seconds: number): string {
        const date = new Date(seconds * 1000);
        return date.toISOString().substr(12, 7);
    }

    // Update the `RelTime` in the state whenever `optimisticRelTime` changes
    useEffect(() => {
        if (optimisticRelTime !== null && state.playbackState) {
            const relTimeString = convertSecondsToRelTime(optimisticRelTime);
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
