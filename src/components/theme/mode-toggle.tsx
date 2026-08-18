"use client";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import {
  Moon,
  Sun,
  // Laptop
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only show the theme toggle after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same dimensions to avoid layout shift
    return (
      <Button
        variant="ghost"
        className="w-10 rounded-full"
        aria-label="Alternar tema"
      >
        <div className="size-5" />
      </Button>
    );
  }

  // Use resolvedTheme to handle system theme correctly
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      className="w-10 rounded-full"
      aria-label="Alternar tema"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <Sun className="size-5 text-yellow-500" />
      ) : (
        <Moon className="size-5 text-black dark:text-white" />
      )}
    </Button>

    // <button
    //   onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    //   className="rounded p-2 hover:bg-muted transition-colors"
    // >
    //   {theme === "dark" ? "🌞" : "🌙"}
    // </button>

    // <DropdownMenu>
    //   <DropdownMenuTrigger asChild>
    //     <Button variant="ghost" size="sm" className="size-8 px-0">
    //       <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
    //       <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    //       <span className="sr-only">Toggle theme</span>
    //     </Button>
    //   </DropdownMenuTrigger>
    //   <DropdownMenuContent align="end">
    //     <DropdownMenuItem onClick={() => setTheme("light")}>
    //       <Sun className="mr-2 size-4" />
    //       <span>Light</span>
    //     </DropdownMenuItem>
    //     <DropdownMenuItem onClick={() => setTheme("dark")}>
    //       <Moon className="mr-2 size-4" />
    //       <span>Dark</span>
    //     </DropdownMenuItem>
    //     <DropdownMenuItem onClick={() => setTheme("system")}>
    //       <Laptop className="mr-2 size-4" />
    //       <span>System</span>
    //     </DropdownMenuItem>
    //   </DropdownMenuContent>
    // </DropdownMenu>
  );
}
