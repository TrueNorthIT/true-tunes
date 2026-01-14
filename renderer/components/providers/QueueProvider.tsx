import React, { createContext, useContext, useState } from "react";
import type { FC, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as SonosContext from "./SonosContext";
import type { TN_Track } from "../../models/Track";
import type { TN_Album } from "@models/Album";
import { extractTrackReference } from "../../utils/sonosUri";

interface QueueContextType {
  currentTrackIndex: number;
  queue: TN_Track[];
  followingQueue: boolean;
  setFollowingQueue: (value: boolean) => void;
  reorderTracksInQueue: (
    startingIndex: number,
    numberOfTracks: number,
    insertBefore: number
  ) => void;
  addToQueue: (item: TN_Track | TN_Album, insertAfterPosition: number) => void;
}

const QueueContext = createContext<QueueContextType>({
  currentTrackIndex: 0,
  queue: [],
  followingQueue: true,
  setFollowingQueue: () => {},
  reorderTracksInQueue: () => {},
  addToQueue: () => {},
});

export const QueueProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const sonosActions = SonosContext.useSonosActions();
  const { currentTrackIndex } = SonosContext.useSonosQueue();
  const queryClient = useQueryClient();

  const [followingQueue, setFollowingQueue] = useState<boolean>(true);

  // Fetch Sonos queue and map URIs to full track objects
  const queueQuery = useQuery<TN_Track[], unknown, TN_Track[]>({
    queryKey: ["queue"],
    queryFn: async () => {
      const raw = await sonosActions.getQueue();
      const tracks = await Promise.all(
        raw.map((item) => {
          if (item.TrackUri === undefined)
            console.log("Undefined TrackUri for item:", item);
          const trackReference = extractTrackReference(item.TrackUri);
          if (!trackReference)
            return Promise.resolve(null as unknown as TN_Track);
          return sonosActions.getTrack(
            trackReference.ref,
            trackReference.serviceId
          );
        })
      );
      console.log("Fetched queue:", tracks);
      return tracks.filter(Boolean) as TN_Track[];
    },
    refetchInterval: 10000,
    staleTime: 10000,
  });
  console.log("Queue Query Key:", queueQuery);
  console.log("Queue Query Data:", queueQuery.data);
  // Optimistic add-to-queue mutation
  const addMutation = useMutation<
    void,
    unknown,
    { item: TN_Track | TN_Album; insertAfterPosition: number },
    { previousQueue?: TN_Track[] }
  >({
    mutationFn: (vars) =>
      // sonosActions.addToQueue likely returns Promise<void>
      sonosActions.addToQueue(vars.item.id, vars.insertAfterPosition),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ["queue"] });
      const previous = queryClient.getQueryData<TN_Track[]>(["queue"]);
      queryClient.setQueryData<TN_Track[]>(["queue"], (old) => {
        const optimisticItems: TN_Track[] = [];
        if (vars.item.type === "track") optimisticItems.push(vars.item);
        if (vars.item.type === "album") {
          const album = vars.item as TN_Album;
          Promise.all(
            album.trackList.map((item) => sonosActions.getTrack(item.id))
          ).then((tracks) => {
            optimisticItems.push(...tracks);
          });
        }
        const list = old ? [...old] : [];
        list.splice(vars.insertAfterPosition + 1, 0, ...optimisticItems);
        return list;
      });
      return { previousQueue: previous };
    },
    onError: (_error, _vars, context) => {
      if (context.previousQueue) {
        queryClient.setQueryData(["queue"], context.previousQueue);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });

  // Optimistic reorder mutation
  const reorderMutation = useMutation<
    void,
    unknown,
    { startingIndex: number; numberOfTracks: number; insertBefore: number },
    { previousQueue?: TN_Track[] }
  >({
    mutationFn: (vars) =>
      // wrap synchronous call to return a Promise<void>
      Promise.resolve(
        sonosActions.reorderTracksInQueue(
          vars.startingIndex,
          vars.numberOfTracks,
          vars.insertBefore
        )
      ),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ["queue"] });
      const previous = queryClient.getQueryData<TN_Track[]>(["queue"]);
      queryClient.setQueryData<TN_Track[]>(["queue"], (old) => {
        if (!old) return old;
        const items = [...old];
        const moving = items.splice(vars.startingIndex, vars.numberOfTracks);
        items.splice(vars.insertBefore, 0, ...moving);
        return items;
      });
      return { previousQueue: previous };
    },
    onError: (_error, _vars, context) => {
      if (context.previousQueue) {
        queryClient.setQueryData(["queue"], context.previousQueue);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });

  return (
    <QueueContext.Provider
      value={{
        currentTrackIndex,
        queue: queueQuery.data ?? [],
        followingQueue,
        setFollowingQueue,
        reorderTracksInQueue: (start, len, before) =>
          reorderMutation.mutate({
            startingIndex: start,
            numberOfTracks: len,
            insertBefore: before,
          }),
        addToQueue: (item, pos) =>
          addMutation.mutate({ item, insertAfterPosition: pos }),
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = (): QueueContextType => useContext(QueueContext);
