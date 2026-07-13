import React from "react";
import LeadSearch from "./lead-search";
import LeadFilters from "./lead-filters";
import LeadActions from "./lead-actions";

export default function LeadToolbar() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">
      <div className="flex w-full sm:w-auto items-center gap-3">
        <LeadSearch />
        <LeadFilters />
      </div>
      <LeadActions />
    </div>
  );
}
