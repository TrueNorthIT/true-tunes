import { useEffect, useState } from "react";
import { useSonosContext } from "./providers/SonosContext";
import { useQueue } from "./providers/QueueProvider";


const QueueHeader = () => {

  const queueDetails = useQueue();



  return (

    <div className="ml-4 mt-4 border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
      <h3 className="text-base font-semibold leading-6 text-white">{queueDetails.queue.length} Songs in Queue</h3>
      <div className="mt-3 flex sm:ml-4 sm:mt-0">
        <button
          type="button"
          className="inline-flex items-center  px-3 py-2 text-sm font-semibold text-white-900 hover:underline"
          onClick={() => queueDetails.setFollowingQueue(true)}
        >
          Jump to Now Playing
        </button>
      </div>
    </div>
  );
}

export default QueueHeader;