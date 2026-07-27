import { tv } from "tailwind-variants";

export const dialogBackdrop = tv({
  base: [
    "starwind-dialog-backdrop fixed inset-0 top-0 left-0 z-50 hidden h-screen w-screen bg-black/80",
    "data-[state=open]:animate-in fade-in",
    "data-[state=closed]:animate-out data-[state=closed]:fill-mode-forwards fade-out",
  ],
});

export const dialogContent = tv({
  base: [
    "starwind-dialog-content",
    // SOURCE-parity chrome: centered + p-6. Avoid Tailwind display utilities
    // (grid/flex) — they override the UA `dialog:not([open]) { display:none }`.
    // Explicit text-foreground so UA dialog CanvasText cannot win in .dark.
    "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
    "bg-background text-foreground rounded-lg border p-6 shadow-lg sm:rounded-lg",
    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fill-mode-forwards transition-[translate,scale,opacity]",
    "fade-in zoom-in-95",
    "fade-out zoom-out-95",
    "data-[state=open]:data-[nested-dialog-open]:-translate-y-[calc(50%-var(--nested-offset)*var(--nested-dialogs,1))]",
    "data-[state=open]:data-[nested-dialog-open]:scale-[calc(1-var(--nested-scale)*var(--nested-dialogs,1))]",
  ],
});

export const dialogCloseButton = tv({
  base: [
    "starwind-dialog-close text-muted-foreground",
    "absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 [&>svg]:size-4",
    "ring-offset-background transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  ],
});

export const dialogDescription = tv({ base: "text-muted-foreground" });

export const dialogFooter = tv({ base: "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end" });

export const dialogHeader = tv({ base: "flex flex-col space-y-1.5 text-center sm:text-left" });

export const dialogTitle = tv({
  base: "text-lg leading-none font-semibold tracking-tight text-foreground",
});
