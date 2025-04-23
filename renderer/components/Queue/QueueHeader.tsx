import { useEffect, useState } from "react";

import { ArrowTrendingDownIcon } from "@heroicons/react/24/solid";
import { useQueue } from "@providers/QueueProvider";
import { Breakpoint, useAsideBreakpoint } from "@components/providers/AsideBreakpointContext";


const QueueHeader = () => {

  const queueDetails = useQueue();

  
  const [isSmall, setIsSmall] = useState(false);
  const { registerBreakpoint } = useAsideBreakpoint(); 
  let breakpoint: Breakpoint = null;  
  useEffect(() => {
      breakpoint = registerBreakpoint(400, setIsSmall);
      return () => breakpoint.unsubscribe();        
  }, [registerBreakpoint]);


  return (

    <div className="ml-4 mt-4 border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
      <h3 className="text-base font-semibold leading-6 text-white">{queueDetails.queue.length} Songs in Queue</h3>
      <div className="mt-3 flex sm:ml-4 sm:mt-0">
        <button
          type="button"
          className="inline-flex items-center  mx-3 py-2 text-sm font-semibold text-white-900 border-b-[1px] border-opacity-0 border-b-white border-solid hover:border-opacity-100"
          onClick={() => queueDetails.setFollowingQueue(true)}
        >
          <span className={isSmall ? "hidden" : "mr-2"}>Jump to Now Playing </span>
          <ArrowTrendingDownIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default QueueHeader;