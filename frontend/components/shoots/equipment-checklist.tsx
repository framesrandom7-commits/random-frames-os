"use client";

import React, { useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { addEquipment, toggleEquipment, deleteEquipment } from "@/app/actions/shoot";
import { ShootEquipment } from "@prisma/client";
import { toast } from "sonner";

export default function EquipmentChecklist({ shootId, equipment }: { shootId: string, equipment: ShootEquipment[] }) {
  const [isPending, startTransition] = useTransition();
  const [newItem, setNewItem] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    startTransition(async () => {
      const result = await addEquipment(shootId, newItem.trim());
      if (result.success) {
        setNewItem("");
      } else {
        toast.error("Failed to add equipment");
      }
    });
  };

  const handleToggle = (id: string, checked: boolean) => {
    startTransition(async () => {
      const success = await toggleEquipment(id, checked, shootId);
      if (!success) {
        toast.error("Failed to update status");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const success = await deleteEquipment(id, shootId);
      if (!success) {
        toast.error("Failed to delete equipment");
      }
    });
  };

  const completedCount = equipment.filter(e => e.status === "PACKED").length;
  const progress = equipment.length > 0 ? (completedCount / equipment.length) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-zinc-400 mb-2">
        <span>{completedCount} of {equipment.length} items packed</span>
        <span>{Math.round(progress)}%</span>
      </div>
      
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-emerald-500 transition-all duration-500 ease-in-out" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input 
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add equipment (e.g., Sony A7IV, 24-70mm lens)..."
          className="bg-black/40 border-white/10 text-white h-9 focus-visible:ring-[#C1121F]"
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending || !newItem.trim()} size="sm" className="bg-white/10 text-white hover:bg-white/20 h-9">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        </Button>
      </form>

      <div className={`space-y-1 mt-4 ${isPending ? 'opacity-70' : ''}`}>
        {equipment.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-4 italic">No equipment added yet.</p>
        ) : (
          equipment.map((item) => (
            <div 
              key={item.id} 
              className={`flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors group ${item.status === "PACKED" ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={item.status === "PACKED"} 
                  onChange={(e) => handleToggle(item.id, e.target.checked)}
                  className="border-white/20 checked:bg-emerald-500 checked:border-emerald-500"
                />
                <span className={`text-sm ${item.status === "PACKED" ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                  {item.name}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDelete(item.id)}
                className="h-7 w-7 text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-400/10 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
