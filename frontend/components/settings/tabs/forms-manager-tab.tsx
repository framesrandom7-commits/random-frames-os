"use client";

import React, { useState } from "react";
import { Plus, Trash2, Edit2, ArrowLeft, FileText, Users, FolderOpen, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createCustomField, updateCustomField, deleteCustomField } from "@/app/actions/custom-fields";

const EXISTING_FORMS = [
  { id: "LEAD", name: "Lead Form", description: "Inquiry and prospect data", icon: FileText },
  { id: "CLIENT", name: "Client Form", description: "Official client records", icon: Users },
  { id: "PROJECT", name: "Project Form", description: "Project workflows and details", icon: FolderOpen },
  { id: "SHOOT", name: "Shoot Form", description: "Shoot logistics and scheduling", icon: Camera },
];

export default function FormsManagerTab({ initialFields = [] }: { initialFields?: any[] }) {
  const [fields, setFields] = useState<any[]>(Array.isArray(initialFields) ? initialFields : []);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    fieldType: "TEXT",
    options: "",
    isRequired: false,
  });

  const filteredFields = selectedEntity ? fields.filter((f) => f.entityType === selectedEntity) : [];

  const handleOpenModal = (field?: any) => {
    if (field) {
      setEditingField(field);
      setFormData({
        name: field.name,
        label: field.label,
        fieldType: field.fieldType,
        options: field.options ? JSON.parse(field.options).join(", ") : "",
        isRequired: field.isRequired,
      });
    } else {
      setEditingField(null);
      setFormData({
        name: "",
        label: "",
        fieldType: "TEXT",
        options: "",
        isRequired: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedEntity) return;

    try {
      let parsedOptions = null;
      if (formData.fieldType === "DROPDOWN" && formData.options) {
        parsedOptions = JSON.stringify(formData.options.split(",").map(s => s.trim()).filter(Boolean));
      }

      if (editingField) {
        const updated = await updateCustomField(editingField.id, {
          ...formData,
          options: parsedOptions,
        });
        if (updated) {
          setFields(fields.map((f) => (f.id === updated.id ? updated : f)));
          toast.success("Field updated");
        }
      } else {
        const created = await createCustomField({
          ...formData,
          entityType: selectedEntity,
          options: parsedOptions,
        });
        if (created) {
          setFields([...fields, created]);
          toast.success("Field created");
        }
      }
      setIsModalOpen(false);
    } catch (e) {
      toast.error("Failed to save field");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this field? Data associated with it may be lost.")) return;
    const success = await deleteCustomField(id);
    if (success) {
      setFields(fields.filter((f) => f.id !== id));
      toast.success("Field deleted");
    }
  };

  // If no entity is selected, show the overview of existing forms
  if (!selectedEntity) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Existing System Forms</h2>
          <p className="text-sm text-zinc-400">Select a form below to customize its fields or add new dynamic inputs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {EXISTING_FORMS.map((form) => (
            <div 
              key={form.id} 
              onClick={() => setSelectedEntity(form.id)}
              className="bg-white/5 border border-white/10 p-6 rounded-xl cursor-pointer hover:bg-white/10 transition-colors group flex flex-col items-center text-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                <form.icon className="w-5 h-5 text-[#C1121F]" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">{form.name}</h3>
                <p className="text-xs text-zinc-400">{form.description}</p>
              </div>
              <div className="mt-auto w-full pt-4">
                <div className="text-xs font-mono text-zinc-500 bg-black/20 rounded py-1 px-2">
                  {fields.filter(f => f.entityType === form.id).length} Custom Fields
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If an entity is selected, show its field manager
  const formDetails = EXISTING_FORMS.find(f => f.id === selectedEntity);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedEntity(null)} className="h-8 w-8 text-zinc-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {formDetails?.name} Fields
            </h2>
            <p className="text-sm text-zinc-400">Dynamically add or edit custom fields for this form.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button onClick={() => handleOpenModal()} className="bg-[#E53935] hover:bg-[#EF5350] text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Field
          </Button>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm text-left text-zinc-400">
          <thead className="text-xs uppercase bg-white/5 border-b border-white/10 text-zinc-300">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider">Field Label</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Internal Key</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Type</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Required</th>
              <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFields.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                  No custom fields defined for this form.
                </td>
              </tr>
            ) : (
              filteredFields.map((field) => (
                <tr key={field.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{field.label}</td>
                  <td className="px-6 py-4 font-mono text-xs">{field.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-white/10 text-xs font-medium">
                      {field.fieldType}
                    </span>
                  </td>
                  <td className="px-6 py-4">{field.isRequired ? "Yes" : "No"}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(field)} className="h-8 w-8 text-zinc-400 hover:text-white">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(field.id)} className="h-8 w-8 text-zinc-400 hover:text-[#E53935]">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#171A21] border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingField ? "Edit Field" : "Add New Field"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Field Label</Label>
              <Input 
                value={formData.label}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    label: e.target.value,
                    // Auto-generate name if it's a new field
                    name: !editingField && !formData.name ? e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_') : formData.name
                  })
                }}
                className="bg-white/5 border-white/10 text-white"
                placeholder="e.g. Industry Type"
              />
            </div>
            <div className="space-y-2">
              <Label>Internal Key (Database Name)</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                className="bg-white/5 border-white/10 text-white font-mono text-sm"
                placeholder="e.g. industry_type"
                disabled={!!editingField}
              />
            </div>
            <div className="space-y-2">
              <Label>Field Type</Label>
              <Select value={formData.fieldType} onValueChange={(v) => setFormData({ ...formData, fieldType: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="- - -" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="TEXT" className="text-zinc-200">Text Input</SelectItem>
                  <SelectItem value="NUMBER" className="text-zinc-200">Number</SelectItem>
                  <SelectItem value="DROPDOWN" className="text-zinc-200">Dropdown Menu</SelectItem>
                  <SelectItem value="DATE" className="text-zinc-200">Date Picker</SelectItem>
                  <SelectItem value="BOOLEAN" className="text-zinc-200">Checkbox (Yes/No)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.fieldType === "DROPDOWN" && (
              <div className="space-y-2">
                <Label>Dropdown Options (comma separated)</Label>
                <Input 
                  value={formData.options}
                  onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="e.g. Option 1, Option 2, Option 3"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Label>Required Field?</Label>
              <Switch 
                checked={formData.isRequired} 
                onCheckedChange={(c) => setFormData({ ...formData, isRequired: c })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-[#E53935] hover:bg-[#EF5350] text-white">
              Save Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
