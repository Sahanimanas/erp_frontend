/**
 * accordion.jsx — plain-Tailwind port of the shadcn/ui Accordion (no Radix).
 *
 * Supports the API the FAQ section uses: type="single" | "multiple",
 * `collapsible`, and per-item `value`. Crucially it still emits
 * `data-state="open" | "closed"` on the item and trigger, because callers style
 * against `data-[state=open]:…` selectors.
 */
import { createContext, useContext, useId, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";

const AccordionContext = createContext(null);
const ItemContext = createContext(null);

export function Accordion({
  type = "single",
  collapsible = false,
  defaultValue,
  className,
  children,
  ...props
}) {
  const [open, setOpen] = useState(() => {
    if (defaultValue == null) return [];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  });

  const toggle = useMemo(
    () => (value) => {
      setOpen((current) => {
        const isOpen = current.includes(value);
        if (type === "multiple") {
          return isOpen ? current.filter((v) => v !== value) : [...current, value];
        }
        // single: clicking the open item closes it only when `collapsible`.
        if (isOpen) return collapsible ? [] : current;
        return [value];
      });
    },
    [type, collapsible],
  );

  const ctx = useMemo(() => ({ open, toggle }), [open, toggle]);

  return (
    <AccordionContext.Provider value={ctx}>
      <div className={className} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ value, className, children, ...props }) {
  const { open } = useContext(AccordionContext) ?? { open: [] };
  const isOpen = open.includes(value);
  const id = useId();

  return (
    <ItemContext.Provider value={{ value, isOpen, id }}>
      <div data-state={isOpen ? "open" : "closed"} className={className} {...props}>
        {children}
      </div>
    </ItemContext.Provider>
  );
}

export function AccordionTrigger({ className, children, ...props }) {
  const { toggle } = useContext(AccordionContext) ?? { toggle: () => {} };
  const { value, isOpen, id } = useContext(ItemContext) ?? {};

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-controls={`${id}-content`}
      id={`${id}-trigger`}
      data-state={isOpen ? "open" : "closed"}
      onClick={() => toggle(value)}
      className={cn(
        "flex w-full flex-1 items-center justify-between gap-4 font-medium transition-all",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180",
        )}
      />
    </button>
  );
}

export function AccordionContent({ className, children, ...props }) {
  const { isOpen, id } = useContext(ItemContext) ?? {};

  // Animated via a 0fr→1fr grid row rather than a measured max-height: the
  // content never has to be measured, so there's no first-open glitch and no
  // wrong height when the copy wraps differently at another breakpoint.
  return (
    <div
      role="region"
      id={`${id}-content`}
      aria-labelledby={`${id}-trigger`}
      aria-hidden={!isOpen}
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "grid transition-[grid-template-rows] duration-200 ease-out",
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <div className="overflow-hidden">
        <div className={className} {...props}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Accordion;
