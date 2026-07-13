"use client";

import React, { useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Loader2, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { addShot, toggleShot, deleteShot, reorderShots } from "@/app/actions/shoot";
import { ShootShot } from "@prisma/client";
import { toast } from "sonner";

export default function ShotListManager({ shootId, shots: initialShots }: { shootId: string, shots: ShootShot[] }) {
  const [isPending, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);
  
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    startTransition(async () => {
      const order = initialShots.length;
      const result = await addShot(shootId, newTitle.trim(), newDesc.trim() || "", order);
      if (result.success) {
        setNewTitle("");
        setNewDesc("");
        setIsAdding(false);
      } else {
        toast.error("Failed to add shot");
      }
    });
  };

  const handleToggle = (id: string, checked: boolean) => {
    startTransition(async () => {
      const success = await toggleShot(id, checked, shootId);
      if (!success) {
        toast.error("Failed to update status");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const success = await deleteShot(id, shootId);
      if (!success) {
        toast.error("Failed to delete shot");
      }
    });
  };

  const moveShot = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === initialShots.length - 1)
    ) return;

    const newShots = [...initialShots];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap elements
    const temp = newShots[index];
    newShots[index] = newShots[swapIndex];
    newShots[swapIndex] = temp;

    // Send new order to server
    const orderedIds = newShots.map(s => s.id);
    
    startTransition(async () => {
      const success = await reorderShots(shootId, orderedIds);
      if (!success) {
        toast.error("Failed to reorder shots");
      }
    });
  };

  const completedCount = initialShots.filter(s => s.isCompleted).length;
  const progress = initialShots.length > 0 ? (completedCount / initialShots.length) * 100 : 0;

  return (
    <div className="space-y-4">
      
      <div className="flex items-center justify-between text-sm text-zinc-400 mb-2">
        <span>{completedCount} of {initialShots.length} shots captured</span>
        <span>{Math.round(progress)}%</span>
      </div>
      
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-blue-500 transition-all duration-500 ease-in-out" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className={`space-y-2 mt-4 ${isPending ? 'opacity-70 pointer-events-none' : ''}`}>
        {initialShots.length === 0 ? (
          !isAdding && <p className="text-zinc-500 text-sm text-center py-4 italic">No shots planned yet.</p>
        ) : (
          initialShots.map((shot, index) => (
            <div 
              key={shot.id} 
              className={`flex items-start gap-3 p-3 rounded-lg bg-black/40 border border-white/5 transition-colors group ${shot.isCompleted ? 'opacity-60' : ''}`}
            >
              <div className="flex flex-col items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity mt-1">
                <button 
                  onClick={() => moveShot(index, 'up')} 
                  disabled={index === 0}
                  className="hover:text-white disabled:opacity-30 disabled:hover:text-current"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <GripVertical className="w-3 h-3 text-zinc-600" />
                <button 
                  onClick={() => moveShot(index, 'down')} 
                  disabled={index === initialShots.length - 1}
                  className="hover:text-white disabled:opacity-30 disabled:hover:text-current"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>

              <Checkbox 
                checked={shot.isCompleted} 
                onChange={(e) => handleToggle(shot.id, e.target.checked)}
                className="mt-1 border-white/20 checked:bg-blue-500 checked:border-blue-500"
              />
              
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium block truncate ${shot.isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                  {shot.title}
                </span>
                {shot.description && (
                  <span className={`text-xs mt-1 block ${shot.isCompleted ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {shot.description}
                  </span>
                )}
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDelete(shot.id)}
                className="h-7 w-7 text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>

      {isAdding ? (
        <form onSubmit={handleAdd} className="bg-black/60 p-3 rounded-lg border border-white/10 space-y-3 mt-4">
          <Input 
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Shot Title (e.g. Wide tracking shot of entrance)"
            className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500"
            autoFocus
          />
          <Textarea 
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description / Camera settings / Lens choice (Optional)"
            className="bg-white/5 border-white/10 text-white focus-visible:ring-blue-500 min-h-[60px] text-sm"
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)} className="text-zinc-400 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !newTitle.trim()} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save Shot
            </Button>
          </div>
        </form>
      ) : (
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setIsAdding(true)}
          className="w-full border-dashed border-white/20 bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 hover:border-white/30"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Shot
        </Button>
      )}

    </div>
  );
}
