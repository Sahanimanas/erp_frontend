/**
 * tabs.jsx — plain-Tailwind port of the shadcn/ui Tabs (no Radix).
 *
 * Emits `data-state="active" | "inactive"` on triggers because the Features
 * page styles the selected tab via `data-[state=active]:…` classes.
 */
import { createContext, useContext, useId, useMemo, useState } from "react";
import { cn } from "../lib/utils";

const TabsContext = createContext(null);

export function Tabs({ defaultValue, value: controlled, onValueChange, className, children, ...props }) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled : uncontrolled;
  const baseId = useId();

  const ctx = useMemo(
    () => ({
      value,
      baseId,
      setValue: (next) => {
        if (!isControlled) setUncontrolled(next);
        onValueChange?.(next);
      },
    }),
    [value, baseId, isControlled, onValueChange],
  );

  return (
    <TabsContext.Provider value={ctx}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children, ...props }) {
  return (
    <div role="tablist" className={cn("inline-flex items-center justify-center", className)} {...props}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className, children, ...props }) {
  const ctx = useContext(TabsContext);
  const isActive = ctx?.value === value;

  return (
    <button
      type="button"
      role="tab"
      id={`${ctx?.baseId}-trigger-${value}`}
      aria-selected={isActive}
      aria-controls={`${ctx?.baseId}-content-${value}`}
      data-state={isActive ? "active" : "inactive"}
      onClick={() => ctx?.setValue(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children, ...props }) {
  const ctx = useContext(TabsContext);
  // Unmount inactive panels so the motion reveals re-run when a tab is opened.
  if (ctx?.value !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`${ctx?.baseId}-content-${value}`}
      aria-labelledby={`${ctx?.baseId}-trigger-${value}`}
      data-state="active"
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

export default Tabs;
