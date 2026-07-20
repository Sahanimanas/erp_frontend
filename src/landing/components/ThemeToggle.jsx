import { useTheme } from "@site/lib/theme";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@site/ui/button";

/** Light/Dark toggle. Hydration-safe. */
export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <div
                aria-hidden
                className="h-10 w-10 rounded-full border border-border bg-card/40"
                data-testid="theme-toggle-placeholder"
            />
        );
    }

    const isDark = theme === "dark";
    return (
        <Button
            data-testid="theme-toggle-button"
            variant="ghost"
            size="icon"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="rounded-full h-10 w-10 border border-border/60 hover:bg-primary/5 transition-all"
        >
            {isDark ? (
                <Sun className="h-[18px] w-[18px] text-amber-400" />
            ) : (
                <Moon className="h-[18px] w-[18px] text-blue-800" />
            )}
        </Button>
    );
}
