import { useAsideBreakpoint } from "@components/providers/AsideBreakpointContext";
import { useSonosContext } from "@components/providers/SonosContext";
import SearchBar from "@components/Search/SearchBar"


const SearchContainer = () => {

    const { mainRef, handleRef } = useAsideBreakpoint();
    const sonosContext = useSonosContext();


    return (
        <main className="flex-grow px-4 py-10 sm:px-6 lg:px-8 lg:py-6 relative" ref={mainRef}>
            <div
                ref={handleRef}
                className="absolute left-0 right-0  top-0 h-full w-2 cursor-col-resize bg-gray-300"
            ></div>
            <SearchBar />
            {/* <pre>{JSON.stringify(sonosContext, null, 2)}</pre> */}

        </main>
    )
}

export default SearchContainer;