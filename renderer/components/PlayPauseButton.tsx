import { PlayPauseIcon } from "@heroicons/react/24/outline"
import { useSonosContext } from "./providers/SonosContext"

export default function PlayButton() {
    
    const player = useSonosContext()

    return (
        <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
            onClick={() => player.togglePlayback()}
        >

        <PlayPauseIcon aria-hidden="true" className="h-6 w-6" />
        

        </button>

    )
}
    