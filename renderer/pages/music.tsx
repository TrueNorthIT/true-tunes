import { AsideBreakpointProvider } from "@providers/AsideBreakpointContext";
import { useSonosContext } from "@providers/SonosContext";
import QueueAside from "@components/Queue/QueueAside";
import SearchContainer from "@components/Search/SearchContainer";

export default function Music() {
  const sonosState = useSonosContext();

  return (
    <AsideBreakpointProvider>
      <div className="flex h-screen overflow-y-hidden">
        <QueueAside />
        <SearchContainer />

      </div>
    </AsideBreakpointProvider>
  );
}
