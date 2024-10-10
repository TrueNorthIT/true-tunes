'use client'

import NowPlayingCard from "../components/nowPlayingCard";
import { useSonosContext } from "../components/providers/SonosContext";
import SearchBar from "../components/SearchBar";


export default function Music() {

  const sonosState = useSonosContext();

  // const logTrackData = (metadata) => {
  //   console.log(metadata);
  //   document.title = "TrueTunes: " + metadata.Title + " - " + metadata.Artist;
  // }
  
  // useEffect(() => {
  //   player.connect('Harding Hub').then((result) => {
  //     console.log(result);
  //   });    

  //   player.listenToTrackMetadata(logTrackData);

  // }, []);


  return (
      <div>
        <main className="xl:pl-96">
            <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">

                <SearchBar />

                <NowPlayingCard />

                <pre>{JSON.stringify(sonosState, null, 2)}</pre> {/* Pretty print the JSON */}

              {/* Main area */}
              </div>
          </main>

        <aside className="fixed bottom-0 left-20 top-16 hidden w-96 overflow-y-auto border-r border-gray-200 px-4 py-6 sm:px-6 lg:px-8 xl:block">
          {/* Secondary column (hidden on smaller screens) */}
        </aside>
      </div>
  )
}