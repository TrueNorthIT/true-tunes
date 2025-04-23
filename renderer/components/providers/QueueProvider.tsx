import { Track } from '@svrooij/sonos/lib/models';
import { createContext, SetStateAction, useContext, useEffect, useState, Dispatch} from 'react';
import { useSonosContext } from './SonosContext';


interface QueueContextType {
    currentTrackIndex: number;
    queue: Track[];
    followingQueue: boolean;
    setFollowingQueue: (value: boolean) => void;
    reorderTracksInQueue: (startingIndex: number, numberOfTracks: number, insertBefore: number) => void;
}

const QueueContext = createContext({
    followingQueue: false,
    setFollowingQueue: (value: boolean) => { },
    queue: [],
    setQueue: (value: Track[]) => { },
    currentTrackIndex: 0,
    reorderTracksInQueue: (startingIndex: number, numberOfTracks: number, insertBefore: number) => { }
} as QueueContextType);

export const QueueProvider = ({ children }) => {
    const sonosContext = useSonosContext();

    const [followingQueue, setFollowingQueue] = useState(false);
    const [queue, setQueue] = useState<Track[]>([]);

    const reorderTracksInQueue =(startingIndex: number, numberOfTracks: number, insertBefore: number) => {
        sonosContext.reorderTracksInQueue(startingIndex, numberOfTracks, insertBefore);
    }

    useEffect(() => setQueue(sonosContext.queue), [sonosContext.queue]);

    return (
        <QueueContext.Provider value={{ followingQueue, setFollowingQueue, queue, reorderTracksInQueue, currentTrackIndex: sonosContext.playbackState.positionInfo.Track }}>
            {children}
        </QueueContext.Provider>
    );
};

export const useQueue = () => {
    return useContext(QueueContext);
};
