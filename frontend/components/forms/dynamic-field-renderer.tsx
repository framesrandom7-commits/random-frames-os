"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface CustomFieldDef {
  id: string;
  name: string;
  label: string;
  fieldType: string; // TEXT, NUMBER, DROPDOWN, DATE, BOOLEAN
  options: string | null; // JSON string array
  isRequired: boolean;
}

interface DynamicFieldRendererProps {
  fields: CustomFieldDef[];
  formData: any;
  setFormData: (data: any) => void;
  errors?: Record<string, string>;
}

export function DynamicFieldRenderer({ fields, formData, setFormData, errors = {} }: DynamicFieldRendererProps) {
  if (!fields || fields.length === 0) return null;

  const handleChange = (name: string, value: any) => {
    setFormData({
      ...formData,
      customFields: {
        ...(formData.customFields || {}),
        [name]: value,
      }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {fields.map((field) => {
        const currentValue = formData.customFields?.[field.name] ?? "";

        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-zinc-300">
              {field.label} {field.isRequired && <span className="text-red-500">*</span>}
            </Label>

            {field.fieldType === "TEXT" && (
              <Input
                value={currentValue}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                className="bg-white/5 border-white/10 text-white"
                required={field.isRequired}
              />
            )}

            {field.fieldType === "NUMBER" && (
              <Input
                type="number"
                value={currentValue}
                onChange={(e) => handleChange(field.name, Number(e.target.value))}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                className="bg-white/5 border-white/10 text-white"
                required={field.isRequired}
              />
            )}

            {field.fieldType === "DROPDOWN" && (
              <Select value={currentValue} onValueChange={(v) => handleChange(field.name, v)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="- - -" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {field.options && JSON.parse(field.options).map((opt: string) => (
                    <SelectItem key={opt} value={opt} className="text-zinc-200">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {field.fieldType === "BOOLEAN" && (
              <div className="flex items-center h-10">
                <Switch
                  checked={!!currentValue}
                  onCheckedChange={(c) => handleChange(field.name, c)}
                />
                <span className="ml-3 text-sm text-zinc-400">{!!currentValue ? "Yes" : "No"}</span>
              </div>
            )}

            {field.fieldType === "DATE" && (
              <Input
                type="date"
                value={currentValue ? new Date(currentValue).toISOString().split('T')[0] : ""}
                onChange={(e) => handleChange(field.name, e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="bg-white/5 border-white/10 text-white w-full [color-scheme:dark]"
              />
            )}

            {errors[field.name] && (
              <p className="text-sm text-red-500">{errors[field.name]}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
