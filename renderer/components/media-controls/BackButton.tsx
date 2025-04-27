import { BackwardIcon } from "@heroicons/react/24/solid"
import { useSonosActions } from "../providers/SonosContext"

export default function BackButton() {

    const player = useSonosActions()

    return (
        <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
            onClick={() => player.previous()}
        >
            <BackwardIcon aria-hidden="true" className="h-6 w-6" />
        </button>
    )
}
