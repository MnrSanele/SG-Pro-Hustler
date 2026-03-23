"use client";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/constants/categories";

interface FilterSidebarProps {
  selectedCategory?: string;
  onCategoryChange: (category: string) => void;
}

export function FilterSidebar({ selectedCategory, onCategoryChange }: FilterSidebarProps) {
  return (
    <aside className="space-y-4">
      <div>
        <Label className="text-sm font-semibold mb-2 block">Category</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Badge
              key={cat.slug}
              variant={selectedCategory === cat.slug ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onCategoryChange(cat.slug)}
            >
              {cat.icon} {cat.name}
            </Badge>
          ))}
        </div>
      </div>
      <Separator />
    </aside>
  );
}
