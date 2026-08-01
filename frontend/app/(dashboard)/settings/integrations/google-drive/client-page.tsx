"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { testConnection, disconnectDrive, repairDriveStructure } from "@/app/actions/drive-settings";
import { toast } from "sonner";
import { RefreshCw, XCircle, Wrench, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function DriveSettingsClient({ status }: { status: any }) {
  const router = useRouter();
  const [isTesting, setIsTesting] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const res = await testConnection();
      if (res.success) {
        toast.success("Connection successful! API is reachable.");
      } else {
        toast.error(`Connection failed: ${res.error}`);
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleRepair = async () => {
    setIsRepairing(true);
    try {
      const res = await repairDriveStructure();
      if (res.success) {
        toast.success("Folder structure verified/repaired successfully.");
      } else {
        toast.error(`Repair failed: ${res.error}`);
      }
    } finally {
      setIsRepairing(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectDrive();
      toast.success("Disconnected successfully.");
      router.refresh();
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (!status.connected) {
    return (
      <a href="/api/auth/google" className="w-full block">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          Connect Google Drive
        </Button>
      </a>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="w-full border-white/10 text-white bg-white/5 hover:bg-white/10"
          onClick={handleTest}
          disabled={isTesting}
        >
          {isTesting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Test Connection
        </Button>
        <Button 
          variant="outline" 
          className="w-full border-white/10 text-white bg-white/5 hover:bg-white/10"
          onClick={handleRepair}
          disabled={isRepairing}
        >
          {isRepairing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Wrench className="mr-2 h-4 w-4" />}
          Repair Structure
        </Button>
      </div>
      
      <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
        <a href="/api/auth/google" className="w-full block">
          <Button variant="outline" className="w-full border-white/10 text-white bg-white/5 hover:bg-white/10">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reconnect
          </Button>
        </a>
        <Button 
          variant="outline" 
          className="w-full border-rose-500/50 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10"
          onClick={handleDisconnect}
          disabled={isDisconnecting}
        >
          {isDisconnecting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
          Disconnect
        </Button>
      </div>
    </div>
  );
}
