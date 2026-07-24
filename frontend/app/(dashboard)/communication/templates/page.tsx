import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TemplateEngine } from "@/lib/communication/template.engine";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Copy, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  // In a real app we would fetch all templates
  // using TemplateEngine.getTemplatesByCategory or similar without category filter
  const templates = await TemplateEngine.getTemplatesByCategory("CUSTOM"); 
  // Let's assume we fetch all. For now we will just show the ones returned.

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] gap-6 text-white overflow-hidden">
      <div className="flex justify-between items-center">
        <PageHeader 
          title="Communication Templates"
          subtitle="Manage reusable email and WhatsApp templates"
        />
        <Button className="bg-white text-black hover:bg-white/90">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {templates.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-white/10 rounded-xl bg-white/5">
            <h3 className="text-lg font-medium mb-2">No Templates Found</h3>
            <p className="text-white/50 mb-4">Create your first template to speed up your communication.</p>
            <Button variant="outline" className="border-white/10">Create Template</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(t => (
              <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col group">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="outline" className="bg-white/10 border-none">{t.category}</Badge>
                  <Badge variant="outline" className={`border-none ${t.type === 'EMAIL' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                    {t.type}
                  </Badge>
                </div>
                
                <h3 className="font-medium text-lg mb-1">{t.title}</h3>
                {t.subject && <p className="text-sm text-white/50 mb-3 truncate">Subj: {t.subject}</p>}
                
                <div className="flex-1 bg-black/20 rounded-lg p-3 text-sm text-white/70 line-clamp-4 font-mono mb-4">
                  {t.body}
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-xs text-white/40">v{t.version}</div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white"><Copy className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white"><Edit2 className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400/60 hover:text-red-400"><Trash2 className="h-4 w-4"/></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
