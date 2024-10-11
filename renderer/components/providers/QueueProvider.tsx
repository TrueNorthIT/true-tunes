import { Track } from '@svrooij/sonos/lib/models';
import { createContext, useContext, useEffect, useState } from 'react';
import { useSonosContext } from './SonosContext';


interface QueueContextType {
    currentTrackIndex: number;
    queue: Track[];
    followingQueue: boolean;
    setFollowingQueue: (value: boolean) => void;
}

const QueueContext = createContext({
    followingQueue: false,
    setFollowingQueue: (value: boolean) => { },
    queue: [],
    currentTrackIndex: 0,
} as QueueContextType);

export const QueueProvider = ({ children }) => {
    const [followingQueue, setFollowingQueue] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [queue, setQueue] = useState<Track[]>([]);

    const sonosContext = useSonosContext();

    useEffect(() => {
        setQueue(sonosContext.queue);
        setCurrentTrackIndex(sonosContext.playbackState.positionInfo.Track);
    }, [sonosContext.queue]);
    
    return (
        <QueueContext.Provider value={{ followingQueue, setFollowingQueue, queue, currentTrackIndex }}>
            {children}
        </QueueContext.Provider>
    );
};

export const useQueue = () => {
    return useContext(QueueContext);
};
