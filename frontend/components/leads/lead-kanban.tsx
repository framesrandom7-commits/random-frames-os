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

  const SUPER_STAGES = [
  {
    id: "INBOUND",
    label: "Inbound",
    statuses: [LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.NO_RESPONSE, LeadStatus.REPLIED]
  },
  {
    id: "ENGAGED",
    label: "Engaged",
    statuses: [LeadStatus.INTERESTED, LeadStatus.QUALIFIED, LeadStatus.FOLLOW_UP_LATER]
  },
  {
    id: "IN_PROGRESS",
    label: "In Progress",
    statuses: [LeadStatus.DISCOVERY, LeadStatus.PROPOSAL, LeadStatus.NEGOTIATION]
  },
  {
    id: "COMPLETED",
    label: "Completed",
    statuses: [LeadStatus.WON, LeadStatus.CLIENT, LeadStatus.LOST, LeadStatus.NOT_INTERESTED]
  }
];

export default function LeadKanban({ leads: initialLeads }: LeadKanbanProps) {
  const [leads, setLeads] = useState<LeadListWithRelations[]>(initialLeads);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) => 
      prev.map((lead) => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      )
    );
    const success = await updateLeadStatus(leadId, newStatus);
    if (!success) {
      toast.error("Failed to update status");
      setLeads([...initialLeads]);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (destination.droppableId !== source.droppableId) {
      const targetStage = SUPER_STAGES.find(s => s.id === destination.droppableId);
      if (!targetStage) return;

      const newStatus = targetStage.statuses[0];
      
      handleStatusChange(draggableId, newStatus);
    }
  };

  if (!isMounted) {
    return <div className="flex justify-center items-center h-[500px]"><Loader2 className="h-8 w-8 animate-spin text-zinc-500" /></div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 h-full w-full gap-4 px-1 pb-4">
      <DragDropContext onDragEnd={onDragEnd}>
        {SUPER_STAGES.map((stage) => {
          const columnLeads = leads.filter((l) => stage.statuses.includes(l.status));
          
          return (
            <div key={stage.id} className="flex flex-col h-full bg-[#12141A] rounded-xl border border-white/5 shadow-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#171A21]">
                <h3 className="font-semibold text-white tracking-wide text-sm">{stage.label}</h3>
                <span className="bg-white/10 text-xs font-medium text-zinc-300 px-2.5 py-1 rounded-full">
                  {columnLeads.length}
                </span>
              </div>
              
              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 p-3 min-h-[300px] transition-colors overflow-y-auto ${
                      snapshot.isDraggingOver ? "bg-white/[0.03]" : "bg-transparent"
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
                              className={`${snapshot.isDragging ? "opacity-90 shadow-2xl scale-[1.02] z-50 ring-2 ring-primary/50 rounded-xl" : ""}`}
                              style={{ ...provided.draggableProps.style }}
                            >
                              <LeadCard lead={lead} onStatusChange={handleStatusChange} />
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
