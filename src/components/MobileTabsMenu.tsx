import { useState } from "react";
import { Menu, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export interface MobileTabItem {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface MobileTabsMenuProps {
  items: MobileTabItem[];
  value: string;
  onChange: (value: string) => void;
  title?: string;
}

const MobileTabsMenu = ({ items, value, onChange, title = "Menu" }: MobileTabsMenuProps) => {
  const [open, setOpen] = useState(false);
  const active = items.find((i) => i.value === value);
  const ActiveIcon = active?.icon;

  const handleSelect = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div className="mb-4 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full justify-between border-primary/20 bg-muted/10">
            <span className="flex items-center gap-2">
              {ActiveIcon && <ActiveIcon className="h-4 w-4 text-primary" />}
              <span className="font-medium">{active?.label || title}</span>
            </span>
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b border-border p-4">
            <SheetTitle className="font-display">{title}</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col p-2">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = item.value === value;
              return (
                <button
                  key={item.value}
                  onClick={() => handleSelect(item.value)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileTabsMenu;
