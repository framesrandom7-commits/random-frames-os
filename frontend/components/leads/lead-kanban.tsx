"use client";

import React, { useState, useEffect } from "react";
import { LeadStatus } from "@prisma/client";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import LeadCard from "./lead-card";
import { updateLeadStatus, LeadListWithRelations } from "@/app/actions/lead";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface LeadKanbanProps {
  leads: LeadListWithRelations[];
}

const STATUS_COLUMNS = Object.values(LeadStatus);

export default function LeadKanban({ leads: initialLeads }: LeadKanbanProps) {
  const [leads, setLeads] = useState<LeadListWithRelations[]>(initialLeads);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLeads(initialLeads);
  }, [initialLeads]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as LeadStatus;
    
    // Optimistic UI update
    setLeads((prev) => 
      prev.map((lead) => 
        lead.id === draggableId ? { ...lead, status: newStatus } : lead
      )
    );

    const success = await updateLeadStatus(draggableId, newStatus);
    if (!success) {
      toast.error("Failed to update status");
      // Revert if failed
      setLeads([...initialLeads]);
    }
  };

  if (!isMounted) {
    return <div className="flex justify-center items-center h-[500px]"><Loader2 className="h-8 w-8 animate-spin text-zinc-500" /></div>;
  }

  return (
    <div className="flex h-full w-full overflow-x-auto pb-4 gap-4 px-1">
      <DragDropContext onDragEnd={onDragEnd}>
        {STATUS_COLUMNS.map((status) => {
          const columnLeads = leads.filter((l) => l.status === status);
          
          return (
            <div key={status} className="flex-shrink-0 w-80 flex flex-col">
              <div className="flex items-center justify-between mb-3 px-2">
                <h3 className="font-semibold text-white/90 text-sm">{status.replace("_", " ")}</h3>
                <span className="bg-white/10 text-xs text-zinc-400 px-2 py-0.5 rounded-full">
                  {columnLeads.length}
                </span>
              </div>
              
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 rounded-lg p-2 min-h-[150px] transition-colors ${
                      snapshot.isDraggingOver ? "bg-white/10" : "bg-black/20"
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      {columnLeads.map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${snapshot.isDragging ? "opacity-90 shadow-xl scale-105 z-50" : ""}`}
                              style={{ ...provided.draggableProps.style }}
                            >
                              <div className="pointer-events-none">
                                <LeadCard lead={lead} />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </DragDropContext>
    </div>
  );
}
