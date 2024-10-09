import { ForwardIcon } from "@heroicons/react/24/solid"
import { useSonosContext } from "../providers/SonosContext"

export default function NextButton() {

    const player = useSonosContext()

    return (
        <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
            onClick={() => player.next()}
        >
            <ForwardIcon aria-hidden="true" className="h-6 w-6" />
        </button>
    )
}
