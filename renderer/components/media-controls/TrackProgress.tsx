import { useEffect, useState } from "react";
import { useSonosActions, useSonosState } from "../providers/SonosContext";
import { TimeString } from "./TimeString";

export default function TrackProgressSlider() {
    const playerState = useSonosState();
    const playerActions = useSonosActions(); 
    const [progress, setProgress] = useState(0); // Current progress of the track
    const [userProgress, setUserProgress] = useState(null); // Value the user is interacting with
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSeeking, setIsSeeking] = useState(false); // To handle the seek state

    
    const convertTimeToSeconds = (timeStr) => {
        const [hours, minutes, seconds] = timeStr.split(":").map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    };

    const seek = () => {
        if (playerState?.playbackState?.positionInfo && userProgress !== null) {
            let trackOverallTime = playerState.playbackState.positionInfo.TrackDuration;
            let totalSeconds = convertTimeToSeconds(trackOverallTime);
            let seekTime = (userProgress / 100) * totalSeconds;
            
            // Convert seekTime back to H:MM:SS
            const date = new Date(seekTime * 1000);
            const strTime = date.toISOString().substr(11, 8); // Format to HH:MM:SS
            
            playerActions.seek(strTime);
            setIsSeeking(true); // Mark as seeking to avoid immediate optimistic updates
        }
    };

    useEffect(() => {
        let intervalId;

        if (isPlaying && !isSeeking) {
            // Set up interval for smooth progress updates (lerp)
            intervalId = setInterval(() => {
                setProgress((prevProgress) => {
                    if (playerState?.playbackState?.positionInfo) {
                        let trackOverallTime = playerState.playbackState.positionInfo.TrackDuration;
                        let totalSeconds = convertTimeToSeconds(trackOverallTime);

                        // Increment the progress optimistically every 100ms
                        let incrementedProgress = prevProgress + (10 / totalSeconds);
                        return incrementedProgress < 100 ? incrementedProgress : 100;
                    }
                    return prevProgress;
                });
            }, 100);
        }

        return () => {
            clearInterval(intervalId);
        };
    }, [isPlaying, playerState?.playbackState?.positionInfo, isSeeking]);

    useEffect(() => {
        if (playerState?.playbackState?.positionInfo) {
            let trackOverallTime = playerState.playbackState.positionInfo.TrackDuration;
            let trackCurrentTime = playerState.playbackState.positionInfo.RelTime;

            if (trackOverallTime && trackCurrentTime) {
                const totalSeconds = convertTimeToSeconds(trackOverallTime);
                const currentSeconds = convertTimeToSeconds(trackCurrentTime);

                // Calculate the percentage of the track that has played
                const percentage = (currentSeconds / totalSeconds) * 100;

                // Sync the optimistic progress with real progress if not interacting with the slider or seeking
                if (userProgress === null && !isSeeking) {
                    setProgress(percentage);
                }

                // Check if the track is playing or paused
                setIsPlaying(playerState.playbackState.transportState === "PLAYING");

                // If seeking, stop it once we receive the updated time from Sonos
                if (isSeeking) {
                    setIsSeeking(false);
                    setProgress(percentage); // Sync with the real progress after seeking
                    setUserProgress(null); // Reset user progress after syncing
                }
            }
        }
    }, [playerState.playbackState?.positionInfo?.RelTime, userProgress, playerState.playbackState?.transportState, isSeeking]);

    return (
        <div className="relative flex flex-1 items-center gap-4">
            <TimeString date={playerState.playbackState?.positionInfo?.RelTime} />
            <input
            className="w-full"
                type="range"
                min="0"
                max="100"
                step={0.01}
                value={userProgress !== null ? userProgress : progress} // Show user progress while interacting, otherwise show track progress
                onChange={(e) => setUserProgress(parseInt(e.target.value))} // Update user progress on interaction
                onMouseUp={seek} // Seek when mouse is released
            />
            <TimeString date={playerState.playbackState?.positionInfo?.TrackDuration} />

        </div>
    );
}
