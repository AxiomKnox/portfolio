import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ArchStep } from "@/content/types";
export function StepsAccordion({
  steps,
  selectedId,
  onSelect,
}: {
  steps: ArchStep[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <Accordion
      value={selectedId ? [selectedId] : []}
      onValueChange={(next) => {
        onSelect(next[0] ?? null);
      }}
      className="w-full"
    >
      {steps.map((s, i) => (
        <AccordionItem key={s.id} value={s.id} className="border-border">
          <AccordionTrigger className="text-left hover:no-underline">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm font-medium text-foreground">{s.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pl-9 text-sm text-muted-foreground">
            {s.detail}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
