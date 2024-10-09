import { useEffect, useState } from "react";
import { useSonosContext } from "../providers/SonosContext";
import { TimeString } from "./TimeString";

export default function TrackProgressSlider() {
    const player = useSonosContext();
    const [progress, setProgress] = useState(0); // Current progress of the track
    const [userProgress, setUserProgress] = useState(null); // Value the user is interacting with
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSeeking, setIsSeeking] = useState(false); // To handle the seek state

    
    const convertTimeToSeconds = (timeStr) => {
        const [hours, minutes, seconds] = timeStr.split(":").map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    };

    const seek = () => {
        if (player?.playbackState?.positionInfo && userProgress !== null) {
            let trackOverallTime = player.playbackState.positionInfo.TrackDuration;
            let totalSeconds = convertTimeToSeconds(trackOverallTime);
            let seekTime = (userProgress / 100) * totalSeconds;
            
            // Convert seekTime back to H:MM:SS
            const date = new Date(seekTime * 1000);
            const strTime = date.toISOString().substr(11, 8); // Format to HH:MM:SS
            
            player.seek(strTime);
            setIsSeeking(true); // Mark as seeking to avoid immediate optimistic updates
        }
    };

    useEffect(() => {
        let intervalId;

        if (isPlaying && !isSeeking) {
            // Set up interval for smooth progress updates (lerp)
            intervalId = setInterval(() => {
                setProgress((prevProgress) => {
                    if (player?.playbackState?.positionInfo) {
                        let trackOverallTime = player.playbackState.positionInfo.TrackDuration;
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
    }, [isPlaying, player?.playbackState?.positionInfo, isSeeking]);

    useEffect(() => {
        if (player?.playbackState?.positionInfo) {
            let trackOverallTime = player.playbackState.positionInfo.TrackDuration;
            let trackCurrentTime = player.playbackState.positionInfo.RelTime;

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
                setIsPlaying(player.playbackState.transportState === "PLAYING");

                // If seeking, stop it once we receive the updated time from Sonos
                if (isSeeking) {
                    setIsSeeking(false);
                    setProgress(percentage); // Sync with the real progress after seeking
                    setUserProgress(null); // Reset user progress after syncing
                }
            }
        }
    }, [player.playbackState?.positionInfo?.RelTime, userProgress, player.playbackState?.transportState, isSeeking]);

    return (
        <div className="relative flex flex-1 items-center gap-4">#
            <TimeString date={player.playbackState?.positionInfo?.RelTime} />
            {/* <p className="text-gray-600 font-semibold" >{player.playbackState?.positionInfo?.RelTime}</p> */}
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
            <TimeString date={player.playbackState?.positionInfo?.TrackDuration} />

        {/* <p className="text-gray-600 font-semibold">{player.playbackState?.positionInfo?.TrackDuration}</p> */}
        </div>
    );
}
