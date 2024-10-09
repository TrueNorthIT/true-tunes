import { PauseCircleIcon, PlayCircleIcon, PlayPauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/solid"
import { useSonosContext } from "../providers/SonosContext"

export default function MuteButton() {
    
    const player = useSonosContext()

    return (
        <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
            onClick={() => player.toggleMute()}
        >
        {
            player.playbackState?.muted  ? (
                <SpeakerXMarkIcon aria-hidden="true" className="h-6 w-6" />
            ) : (
                <SpeakerWaveIcon aria-hidden="true" className="h-6 w-6" />
            )
        }       
        </button>
    )
}
    