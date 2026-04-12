import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TopBar() {
  return (
    <header className="h-14 border-b border-border/60 bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 shrink-0 sticky top-0 z-30">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <div className="flex items-center gap-2.5">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">DR</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium hidden sm:block">Dr. Rivera</span>
      </div>
    </header>
  );
}
