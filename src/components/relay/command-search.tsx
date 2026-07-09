import { useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { EmptyState, emptyStateIllustrations } from "@/components/relay/empty-state";
import { useRelayStore } from "@/lib/relay/store";

export function CommandSearch() {
  const { commandOpen, toggleCommand, exceptions, openDrawer } = useRelayStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleCommand();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleCommand]);

  return (
    <CommandDialog open={commandOpen} onOpenChange={(o) => toggleCommand(o)}>
      <CommandInput placeholder="Search exceptions, customers, technicians…" />
      <CommandList>
        <CommandEmpty>
          <EmptyState
            framed={false}
            illustration={emptyStateIllustrations.noSearchResults}
            artworkLabel="No exceptions matched your search. Try another keyword or clear your filters."
            className="px-2 py-8"
            imageClassName="max-w-[440px]"
          />
        </CommandEmpty>
        <CommandGroup heading="Exceptions">
          {exceptions.slice(0, 8).map((e) => (
            <CommandItem
              key={e.id}
              value={`${e.id} ${e.customer} ${e.issueType}`}
              onSelect={() => {
                openDrawer(e.id);
                toggleCommand(false);
              }}
              className="text-sm"
            >
              <span className="tnum mr-2 text-[11px] text-slate-400">{e.id}</span>
              <span className="font-medium">{e.customer}</span>
              <span className="ml-2 truncate text-xs text-slate-500">{e.issueType}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
