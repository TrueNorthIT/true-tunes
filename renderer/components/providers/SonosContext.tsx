import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useEffect,
  useState,
} from "react";
import type { BrowseResponse, Track } from "@svrooij/sonos/lib/models";
import type { SonosState } from "@svrooij/sonos/lib/models/sonos-state";
import type { MediaList } from "@svrooij/sonos/lib/musicservices/smapi-client";
import { SonosSearchTypes } from "../../enums/SonosSearchType";
import { Services } from "../../enums/Services";
import { ipcService, sonos } from "./ipcService";
import type { TN_Track, TN_TrackRef } from "../../models/Track";
import type { TN_Album } from "../../models/Album";
import type { TN_Artist } from "../../models/Artist";
import type { ITrackEntity } from "@components/result-types/trackEntity";
import type { IAlbumEntity } from "@components/result-types/albumEntity";
import type { IArtistEntity } from "@components/result-types/artistEntity";
import { decode } from "html-entities";
interface SonosStateType {
  playbackState?: Partial<SonosState>;
  connectionStatus: string;
  queue: Track[];
}

interface TN_MediaList {
  index: number;
  count: number;
  total: number;
  mediaMetadata?: TN_Track[];
  mediaCollection?: (TN_Album | TN_Artist)[];
}

interface fullFatSearchResult {
  track: TN_MediaList;
  album: TN_MediaList;
  artist: TN_MediaList;
}

type SonosAction =
  | { type: "SET_PLAYBACK_STATE"; payload: SonosStateType["playbackState"] }
  | { type: "SET_CONNECTION_STATUS"; payload: string }
  | { type: "SET_VOLUME"; payload: number }
  | { type: "UPDATE_REL_TIME"; payload: string }
  | { type: "SET_QUEUE"; payload: BrowseResponse };

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
  search: (
    searchTerm: string,
    searchType: SonosSearchTypes,
    service: Services,
    resultCount: number,
    skip?: number
  ) => Promise<TN_MediaList>;
  fullFatSearch: (
    searchTerm: string,
    service: Services
  ) => Promise<fullFatSearchResult>;
  playSongNow: (uri: string) => void;
  getQueue: () => Promise<Track[]>;
  reorderTracksInQueue: (
    startingIndex: number,
    numberOfTracks: number,
    insertBefore: number
  ) => void;
  addToQueue: (uri: string, index?: number) => Promise<void>;
  playNext: (uri: string) => Promise<void>;
  getMetadata: (
    itemId: string,
    skip?: number,
    count?: number
  ) => Promise<MediaList>;
  getTrack: (ref: string, service?: Services) => Promise<TN_Track>;
  getAlbum: (ref: string, service?: Services) => Promise<TN_Album>;
  getArtist: (ref: string, service?: Services) => Promise<TN_Artist>;
  getItemMetadata: (itemId: string, service?: Services) => Promise<MediaList>;
  removeFromQueue: (index: number) => void;
  removeRangeFromQueue: (index: number, count: number) => void;
  utils: {
    convertTrackEntityToTNTrack: (
      mediaMetadata: ITrackEntity
    ) => Promise<TN_Track>;
    convertAlbumEntityToTNAlbum: (
      mediaMetadata: IAlbumEntity
    ) => Promise<TN_Album>;
    convertArtistEntityToTNArtist: (
      mediaMetadata: IArtistEntity
    ) => Promise<TN_Artist>;
  };
}

const initialState: SonosStateType = {
  playbackState: null,
  connectionStatus: "Disconnected",
  queue: [],
};

function sonosReducer(
  state: SonosStateType,
  action: SonosAction
): SonosStateType {
  switch (action.type) {
    case "SET_PLAYBACK_STATE":
      return { ...state, playbackState: action.payload };
    case "SET_CONNECTION_STATUS":
      return { ...state, connectionStatus: action.payload };
    case "SET_VOLUME":
      return state.playbackState
        ? {
            ...state,
            playbackState: { ...state.playbackState, volume: action.payload },
          }
        : state;
    case "UPDATE_REL_TIME":
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
    case "SET_QUEUE":
      return typeof action.payload.Result === "string"
        ? state
        : { ...state, queue: action.payload.Result };
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
  const [optimisticRelTime, setOptimisticRelTime] = useState<number | null>(
    null
  );

  const actions: SonosActions = useMemo(
    () => createActions(dispatch, setOptimisticRelTime),
    [dispatch]
  );

  const queue = useMemo(() => state.queue, [state.queue]);
  const currentTrackIndex = useMemo(() => {
    if (state.playbackState?.positionInfo) {
      return state.playbackState.positionInfo.Track;
    }
    return 0;
  }, [state.playbackState?.positionInfo]);

  const sonosQueueState = useMemo(
    () => ({ queue, currentTrackIndex }),
    [queue, currentTrackIndex]
  );

  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        await actions.getPlaybackState();
        await actions.getQueue();
      } catch (error) {
        console.error("Error fetching initial state:", error);
      }
    };

    actions.connect("192.168.1.16").then(async () => {
      await actions.connectToServices();
      fetchInitialState();
      actions.listenToTrackMetadata();
      actions.listenToMuteEvent();
      actions.listenToVolumeEvent();
      actions.listenToPlayPauseEvent();
    });
  }, [actions]);

  useEffect(() => {
    if (
      state.playbackState?.transportState === "PLAYING" &&
      optimisticRelTime !== null
    ) {
      const interval = setInterval(() => {
        setOptimisticRelTime((prev) => (prev !== null ? prev + 1 : prev));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state.playbackState?.transportState, optimisticRelTime]);

  useEffect(() => {
    if (state.playbackState?.transportState === "PLAYING") {
      const syncInterval = setInterval(async () => {
        const playbackState = await actions.getPlaybackState();
        const newRelTimeInSeconds = convertRelTimeToSeconds(
          playbackState.positionInfo.RelTime
        );
        setOptimisticRelTime(newRelTimeInSeconds);
      }, 5000);
      return () => clearInterval(syncInterval);
    }
  }, [state.playbackState?.transportState, actions]);

  useEffect(() => {
    document.title =
      `TrueTunes : ${state.playbackState?.positionInfo?.TrackMetaData?.Title} - ${state.playbackState?.positionInfo?.TrackMetaData?.Artist}` ||
      "TrueTunes";
  }, [state.playbackState?.mediaInfo]);

  useEffect(() => {
    if (optimisticRelTime !== null && state.playbackState) {
      const relTimeString = convertSecondsToRelTime(optimisticRelTime);
      dispatch({ type: "UPDATE_REL_TIME", payload: relTimeString });
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
  if (!context)
    throw new Error("useSonosQueue must be used within an AudioProvider");
  return context;
}

export function useSonosState() {
  const context = useContext(SonosStateContext);
  if (!context)
    throw new Error("useSonosState must be used within an AudioProvider");
  return context;
}

export function useSonosActions() {
  const context = useContext(SonosActionsContext);
  if (!context)
    throw new Error("useSonosActions must be used within an AudioProvider");
  return context;
}

function createActions(
  dispatch: React.Dispatch<SonosAction>,
  setOptimisticRelTime: React.Dispatch<React.SetStateAction<number | null>>
): SonosActions {
  const searchCache = new Map<string, TN_MediaList>();
  const fullFatSearchCache = new Map<string, fullFatSearchResult>();
  const metadataCache = new Map<string, MediaList>();
  const itemMetadataCache = new Map<string, MediaList>();
  const trackCache = new Map<string, TN_Track>();
  const albumCache = new Map<string, TN_Album>();
  const artistCache = new Map<string, TN_Artist>();

  async function refreshPlaybackStateAndQueue() {
    const playbackState = await sonos.GetPlaybackState();
    dispatch({ type: "SET_PLAYBACK_STATE", payload: playbackState });
    const newRelTimeInSeconds = convertRelTimeToSeconds(
      playbackState.positionInfo.RelTime
    );
    setOptimisticRelTime(newRelTimeInSeconds);

    const queue = await sonos.GetQueue();
    if (typeof queue.Result !== "string") {
      dispatch({ type: "SET_QUEUE", payload: queue });
    }
  }

  async function refreshPlaybackState() {
    const playbackState = await sonos.GetPlaybackState();
    dispatch({ type: "SET_PLAYBACK_STATE", payload: playbackState });
    const newRelTimeInSeconds = convertRelTimeToSeconds(
      playbackState.positionInfo.RelTime
    );
    setOptimisticRelTime(newRelTimeInSeconds);
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const convertTrackEntityToTNTrack = async (
    mediaMetadata: ITrackEntity
  ): Promise<TN_Track> => {
    return {
      type: "track",
      title: mediaMetadata.title,
      artist: {
        name: mediaMetadata.trackMetadata.artist,
        id: mediaMetadata.trackMetadata.artistId,
      },
      album: {
        name: mediaMetadata.trackMetadata.album,
        id: mediaMetadata.trackMetadata.albumId,
      },
      artURI: mediaMetadata.trackMetadata.albumArtURI,
      duration: formatDuration(mediaMetadata.trackMetadata.duration),
      explicit: mediaMetadata.tags?.explicit === 1,
      id: mediaMetadata.id,
    };
  };

  const convertAlbumEntityToTNAlbum = async (
    mediaMetadata: IAlbumEntity
  ): Promise<TN_Album> => {
    const albumMetadata = await sonos.GetMetadata(
      Services.Spotify,
      mediaMetadata.id,
      0,
      1000
    );

    return {
      type: "album",
      name: mediaMetadata.title,
      artist: {
        name: mediaMetadata.artist,
        id: mediaMetadata.artistId,
      },
      artURI: mediaMetadata.albumArtURI,
      id: mediaMetadata.id,
      trackCount: albumMetadata.mediaMetadata.length,
      trackList: albumMetadata.mediaMetadata.map((track) => ({
        title: track.title,
        id: track.id,
      })),
      duration: formatDuration(
        albumMetadata.mediaMetadata.reduce(
          (acc, track: ITrackEntity) =>
            acc + (track.trackMetadata.duration || 0),
          0
        )
      ),
    };
  };

  const convertArtistEntityToTNArtist = async (
    mediaMetadata: IArtistEntity
  ): Promise<TN_Artist> => {
    return {
      type: "artist",
      name: mediaMetadata.title,
      id: mediaMetadata.id,
      artURI: mediaMetadata.albumArtURI,
      heroArtURI: mediaMetadata.albumArtURI,
    };
  };

  return {
    connect: async (ipAddress?: string) => {
      const result = await ipcService.connect(ipAddress);
      if (result) {
        dispatch({ type: "SET_CONNECTION_STATUS", payload: "Connected" });
        return "Connected";
      }
      const ip = prompt("Ip");
      if (ip) {
        const result = await ipcService.connect(ip);
        if (result) {
          dispatch({ type: "SET_CONNECTION_STATUS", payload: "Connected" });
          return "Connected";
        }
      }
      return "Disconnected";
    },
    connectToServices: async () => {
      const result = await ipcService.connectToServices();
      dispatch({ type: "SET_CONNECTION_STATUS", payload: result });
      return result;
    },
    seek: (time) => {
      sonos.SeekToPosition(time);
    },
    togglePlayback: () => {
      sonos.TogglePlayback();
    },
    toggleMute: () => {
      sonos.ToggleMute();
    },
    next: () => {
      sonos.Next();
    },
    previous: () => {
      sonos.Previous();
    },
    getPlaybackState: async () => {
      const playbackState = await sonos.GetPlaybackState();
      dispatch({ type: "SET_PLAYBACK_STATE", payload: playbackState });
      const newRelTimeInSeconds = convertRelTimeToSeconds(
        playbackState.positionInfo.RelTime
      );
      setOptimisticRelTime(newRelTimeInSeconds);
      return playbackState;
    },
    getVolume: async () => {
      const volume = await sonos.GetVolume();
      dispatch({ type: "SET_VOLUME", payload: volume });
      return volume;
    },
    setVolume: (volume) => {
      sonos.SetVolume(volume);
      dispatch({ type: "SET_VOLUME", payload: volume });
    },
    jumpToPointInQueue: (index) => {
      sonos.JumpToPointInQueue(index + 1);
    },
    getQueue: async () => {
      const queue = await sonos.GetQueue();
      if (typeof queue.Result !== "string") {
        dispatch({ type: "SET_QUEUE", payload: queue });
        return queue.Result;
      }
      return [];
    },
    getConnectionStatus: async () => {
      const status = await sonos.GetConnectionStatus();
      dispatch({
        type: "SET_CONNECTION_STATUS",
        payload:
          status !== null && status.length > 0 ? "Connected" : "Disconnected",
      });
      return status !== null && status.length > 0
        ? "Connected"
        : "Disconnected";
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
    search: async (searchTerm, searchType, service, resultCount, skip = 0) => {
      const key = `${searchTerm}|${searchType}|${service}|${resultCount}|${skip}`;
      if (searchCache.has(key)) {
        return searchCache.get(key)!;
      }
      const result = await sonos.Search(
        searchTerm,
        searchType,
        service,
        resultCount,
        skip
      );
      const mediaList: TN_MediaList = {
        index: result.index,
        count: result.count,
        total: result.total,
        mediaMetadata: [],
        mediaCollection: [],
      };

      if (searchType === SonosSearchTypes.Track) {
        const tn_Tracks = await Promise.all(
          result.mediaMetadata.map(convertTrackEntityToTNTrack)
        );
        mediaList.mediaMetadata = tn_Tracks;
      }

      if (searchType === SonosSearchTypes.Album) {
        const tn_Albums = await Promise.all(
          result.mediaCollection.map(convertAlbumEntityToTNAlbum)
        );
        mediaList.mediaCollection = tn_Albums;
      }

      if (searchType === SonosSearchTypes.Artist) {
        const tn_Artists = await Promise.all(
          result.mediaCollection.map(convertArtistEntityToTNArtist)
        );
        mediaList.mediaCollection = tn_Artists;
      }

      searchCache.set(key, mediaList);
      return mediaList;
    },

    fullFatSearch: async (searchTerm, service) => {
      const cleanQuery = decodeURI(searchTerm);

      const key = `${cleanQuery}|${service}`;
      if (fullFatSearchCache.has(key)) {
        return fullFatSearchCache.get(key)!;
      }
      const trackRawResult = await sonos.Search(
        cleanQuery,
        SonosSearchTypes.Track,
        service,
        32
      );
      const albumRawResult = await sonos.Search(
        cleanQuery,
        SonosSearchTypes.Album,
        service,
        12
      );
      const artistRawResult = await sonos.Search(
        cleanQuery,
        SonosSearchTypes.Artist,
        service,
        20
      );

      const tn_Tracks = await Promise.all(
        trackRawResult.mediaMetadata.map(convertTrackEntityToTNTrack)
      );
      const tn_Albums = await Promise.all(
        albumRawResult.mediaCollection.map(convertAlbumEntityToTNAlbum)
      );
      const tn_Artists = await Promise.all(
        artistRawResult.mediaCollection.map(convertArtistEntityToTNArtist)
      );

      const result: fullFatSearchResult = {
        track: {
          index: trackRawResult.index,
          count: trackRawResult.count,
          total: trackRawResult.total,
          mediaMetadata: tn_Tracks,
          mediaCollection: [],
        },
        album: {
          index: albumRawResult.index,
          count: albumRawResult.count,
          total: albumRawResult.total,
          mediaMetadata: [],
          mediaCollection: tn_Albums,
        },
        artist: {
          index: artistRawResult.index,
          count: artistRawResult.count,
          total: artistRawResult.total,
          mediaMetadata: [],
          mediaCollection: tn_Artists,
        },
      };
      fullFatSearchCache.set(key, result);
      return result;
    },

    playSongNow: (uri) => {
      sonos.PlaySongNow(uri);
    },
    reorderTracksInQueue: (start, count, insertBefore) => {
      sonos.ReorderTracksInQueue(start, count, insertBefore);
    },
    addToQueue: async (uri, index) => {
      await sonos.AddToQueue(uri, index);
    },
    playNext: async (uri) => {
      const playbackState = await sonos.GetPlaybackState();
      const trackPosition =
        playbackState.positionInfo.Track === 0
          ? 0
          : playbackState.positionInfo.Track + 1;
      await sonos.AddToQueue(uri, trackPosition);
    },
    getMetadata: async (itemId, skip = 0, count = 15) => {
      const key = `${itemId}|${skip}|${count}`;
      if (metadataCache.has(key)) {
        const cachedMetadata = metadataCache.get(key);
        console.log("Cache hit for metadata:", key, cachedMetadata);
        return cachedMetadata;
      }
      const metadata = await sonos.GetMetadata(
        Services.Spotify,
        itemId,
        skip,
        count
      );
      metadataCache.set(key, metadata);
      return metadata;
    },
    getItemMetadata: async (itemId, service = Services.Spotify) => {
      if (itemId === undefined) return undefined;
      if (itemMetadataCache.has(itemId)) {
        return itemMetadataCache.get(itemId)!;
      }
      const itemMetadata = await sonos.GetItemMetadata(
        service,
        itemId
      );
      itemMetadataCache.set(itemId, itemMetadata);
      return itemMetadata;
    },
    removeFromQueue: (index) => {
      sonos.RemoveTrackRangeFromQueue(index, 1);
    },
    removeRangeFromQueue: (index, count) => {
      sonos.RemoveTrackRangeFromQueue(index, count);
    },
    getTrack: async (ref, service = Services.Spotify) => {
      if (!ref) return undefined;
      const trackKey = `${service}:${ref}`;
      if (trackCache.has(trackKey)) {
        return trackCache.get(trackKey)!;
      }

      const metatadata = (await sonos.GetItemMetadata(service, ref))
        .mediaMetadata[0] as ITrackEntity;
      const md = metatadata.trackMetadata;
      if (!md) console.log("No trackMetadata for ref:", ref);
      console.log("Track metadata for ref:", ref, md, metatadata);
      const track: TN_Track = {
        type: "track",
        id: metatadata.id,
        title: decode(metatadata.title),
        artist: { id: md.artistId, name: decode(md.artist) },
        album: { id: md.albumId, name: decode(md.album) },
        artURI: md.albumArtURI,
        duration: formatDuration(md.duration),
        explicit: (metatadata.tags?.explicit ?? 0) === 1,
      };

      trackCache.set(trackKey, track);
      return track;
    },
    getAlbum: async (ref, service = Services.Spotify) => {
      if (ref === undefined) return undefined;
      const albumKey = `${service}:${ref}`;
      if (albumCache.has(albumKey)) {
        return albumCache.get(albumKey)!;
      }

      const metatadata = (await sonos.GetItemMetadata(service, ref))
        .mediaCollection[0] as IAlbumEntity;
      const deep_metadata = await sonos.GetMetadata(
        service,
        ref,
        0,
        1000
      );
      const tn_Tracks = await Promise.all(
        deep_metadata.mediaMetadata.map(convertTrackEntityToTNTrack)
      );
      const tn_TrackRefs: TN_TrackRef[] = [];
      for (const track of tn_Tracks) {
        const trackKey = `${service}:${track.id}`;
        if (!trackCache.has(trackKey)) trackCache.set(trackKey, track);
        tn_TrackRefs.push({ id: track.id, title: track.title });
      }

      const album: TN_Album = {
        type: "album",
        id: metatadata.id,
        name: decode(metatadata.title),
        artist: { id: metatadata.artistId, name: decode(metatadata.artist) },
        artURI: metatadata.albumArtURI,
        trackCount: deep_metadata.mediaMetadata.length,
        trackList: tn_TrackRefs,
        duration: formatDuration(
          deep_metadata.mediaMetadata.reduce(
            (acc, track: ITrackEntity) =>
              acc + (track.trackMetadata.duration || 0),
            0
          )
        ),
      };

      albumCache.set(albumKey, album);
      return album;
    },
    getArtist: async (ref, service = Services.Spotify) => {
      if (ref === undefined) return undefined;
      const artistKey = `${service}:${ref}`;
      if (artistCache.has(artistKey)) {
        return artistCache.get(artistKey)!;
      }

      const metatadata = (await sonos.GetItemMetadata(service, ref))
        .mediaCollection[0] as IArtistEntity;

      const artist: TN_Artist = {
        type: "artist",
        id: metatadata.id,
        name: decode(metatadata.title),
        artURI: metatadata.albumArtURI,
        heroArtURI: metatadata.albumArtURI,
      };

      artistCache.set(artistKey, artist);
      return artist;
    },
    utils: {
      convertTrackEntityToTNTrack,
      convertAlbumEntityToTNAlbum,
      convertArtistEntityToTNArtist,
    },
  };
}

function convertRelTimeToSeconds(relTime: string): number {
  const parts = relTime.split(":").map(Number);
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

function convertSecondsToRelTime(seconds: number): string {
  if (!seconds || Number.isNaN(seconds)) return "00:00:00";
  const date = new Date(seconds * 1000);
  return date.toISOString().substr(12, 7);
}
