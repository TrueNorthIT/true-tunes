import { AsideBreakpointProvider } from "@providers/AsideBreakpointContext";
import { useSonosContext } from "@providers/SonosContext";
import QueueAside from "@components/Queue/QueueAside";
import SearchContainer from "@components/Search/SearchContainer";

export default function Music() {
  const sonosState = useSonosContext();

  return (
      <div>
        <main className="">
            <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">

      </div>
    </AsideBreakpointProvider>
  );
}
