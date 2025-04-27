import { Track } from '@svrooij/sonos/lib/models';
import { createContext, SetStateAction, useContext, useEffect, useState, Dispatch} from 'react';
import { useSonosActions, useSonosQueue, useSonosState } from './SonosContext';


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
    const sonosQueue = useSonosQueue();
    const sonosActions = useSonosActions();

    const [followingQueue, setFollowingQueue] = useState(false);

    const reorderTracksInQueue =(startingIndex: number, numberOfTracks: number, insertBefore: number) => {
        sonosActions.reorderTracksInQueue(startingIndex, numberOfTracks, insertBefore);
    }


    return (
        <QueueContext.Provider value={{ followingQueue, setFollowingQueue, queue: sonosQueue.queue, reorderTracksInQueue, currentTrackIndex: sonosQueue.currentTrackIndex }}>
            {children}
        </QueueContext.Provider>
    );
};

export const useQueue = () => {
    return useContext(QueueContext);
};
