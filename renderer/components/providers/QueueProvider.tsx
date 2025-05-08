import type { ReactNode, FC } from 'react';
import React, { createContext, useContext, useState } from 'react';
import type { Track } from '@svrooij/sonos/lib/models';
import { useSonosActions, useSonosQueue } from './SonosContext';

interface QueueContextType {
    currentTrackIndex: number;
    queue: Track[];
    followingQueue: boolean;
    setFollowingQueue: (value: boolean) => void;
    reorderTracksInQueue: (
        startingIndex: number,
        numberOfTracks: number,
        insertBefore: number
    ) => void;
    addToQueue: (trackId: string, insertAfterPosition: number) => void;
}

const QueueContext = createContext<QueueContextType>({
    currentTrackIndex: 0,
    queue: [],
    followingQueue: true,
    setFollowingQueue: () => { },
    reorderTracksInQueue: () => { },
    addToQueue: () => { },
});

export const QueueProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const sonosQueue = useSonosQueue();
    const sonosActions = useSonosActions();

    const [followingQueue, setFollowingQueue] = useState<boolean>(true);

    const reorderTracksInQueue = (
        startingIndex: number,
        numberOfTracks: number,
        insertBefore: number
    ) => {
        sonosActions.reorderTracksInQueue(
            startingIndex,
            numberOfTracks,
            insertBefore
        );
    };

    const addToQueue = (trackId: string, insertAfterPosition: number) => {
        sonosActions.addToQueue(trackId, insertAfterPosition);
    };

    return (
        <QueueContext.Provider
            value={{
                currentTrackIndex: sonosQueue.currentTrackIndex,
                queue: sonosQueue.queue,
                followingQueue,
                setFollowingQueue,
                reorderTracksInQueue,
                addToQueue,
            }}
        >
            {children}
        </QueueContext.Provider>
    );
};

export const useQueue = (): QueueContextType => useContext(QueueContext);
