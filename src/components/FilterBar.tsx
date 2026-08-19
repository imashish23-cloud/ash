import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useDashboard } from "@/components/DashboardProvider";
import { DATE_PRESETS, type DatePresetId } from "@/lib/calculations";
import { campTypeLabel, formatDate } from "@/lib/formatting";
import { cn } from "@/lib/utils";

function MultiSelect({
  label,
  options,
  selected,
  onChange,
  searchable,
  renderLabel = (v: string) => v,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  searchable?: boolean;
  renderLabel?: (v: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const summary =
    selected.length === 0
      ? `All ${label}`
      : selected.length === 1
        ? renderLabel(selected[0]!)
        : `${selected.length} ${label} selected`;

  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter((s) => s !== value) : [...selected, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("justify-between gap-2 font-normal", selected.length > 0 && "border-primary/40 text-foreground")}
        >
          <span className="max-w-[180px] truncate">{summary}</span>
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <Command>
          {searchable ? <CommandInput placeholder={`Search ${label.toLowerCase()}…`} /> : null}
          <CommandList className="max-h-72">
            <CommandEmpty>No matches.</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem key={o} value={o} onSelect={() => toggle(o)} className="gap-2">
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border border-border",
                      selected.includes(o) && "border-primary bg-primary text-primary-foreground",
                    )}
                  >
                    {selected.includes(o) ? <Check className="h-3 w-3" /> : null}
                  </span>
                  <span className="truncate">{renderLabel(o)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        {selected.length > 0 ? (
          <div className="border-t border-border p-2">
            <Button variant="ghost" size="sm" className="w-full" onClick={() => onChange([])}>
              <X /> Clear
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function Controls() {
  const { filters, setFilters, options, range, resetFilters } = useDashboard();
  const isFiltered =
    filters.partners.length > 0 ||
    filters.campTypes.length > 0 ||
    filters.sourceTypes.length > 0 ||
    filters.preset !== "all";

  const toISO = (ts: number | null) => (ts == null ? "" : new Date(ts).toISOString().slice(0, 10));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 font-normal">
            <span className="font-medium">
              {DATE_PRESETS.find((p) => p.id === filters.preset)?.label}
            </span>
            <span className="hidden text-muted-foreground num sm:inline">
              {formatDate(range.from)} → {formatDate(range.to)}
            </span>
            <ChevronDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-2">
          <div className="grid gap-1">
            {DATE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setFilters((f) => ({ ...f, preset: p.id }))}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-accent",
                  filters.preset === p.id && "bg-accent font-medium",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          {filters.preset === "custom" ? (
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-2">
              <label className="text-xs text-muted-foreground">
                From
                <Input
                  type="date"
                  value={toISO(filters.customFrom)}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      customFrom: e.target.value ? new Date(e.target.value).getTime() : null,
                    }))
                  }
                />
              </label>
              <label className="text-xs text-muted-foreground">
                To
                <Input
                  type="date"
                  value={toISO(filters.customTo)}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      customTo: e.target.value ? new Date(e.target.value).getTime() : null,
                    }))
                  }
                />
              </label>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>

      <MultiSelect
        label="Partners"
        searchable
        options={options.partners}
        selected={filters.partners}
        onChange={(partners) => setFilters((f) => ({ ...f, partners }))}
      />
      <MultiSelect
        label="Camp Types"
        options={options.campTypes}
        selected={filters.campTypes}
        onChange={(campTypes) => setFilters((f) => ({ ...f, campTypes }))}
        renderLabel={campTypeLabel}
      />
      <MultiSelect
        label="Sources"
        options={options.sourceTypes}
        selected={filters.sourceTypes}
        onChange={(sourceTypes) => setFilters((f) => ({ ...f, sourceTypes }))}
      />

      {isFiltered ? (
        <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground">
          <X /> Reset
        </Button>
      ) : null}
    </div>
  );
}

export function FilterBar() {
  return (
    <>
      <div className="hidden md:block">
        <Controls />
      </div>
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="p-4">
              <Controls />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
