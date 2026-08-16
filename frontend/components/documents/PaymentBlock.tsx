import React from "react";
import { PaymentSettings } from "./types";
import { CheckCircle2 } from "lucide-react";

export const PaymentBlock: React.FC<{
  paymentInfo: PaymentSettings;
}> = ({ paymentInfo }) => {
  return (
    <div className="border border-[#E6E6E6] rounded-xl p-5 h-full">
      <div className="flex items-center gap-2 text-[#C1121F] font-bold mb-4 uppercase">
        <CheckCircle2 size={18} /> PAYMENT INFORMATION
      </div>
      
      <div className="grid grid-cols-[130px_1fr] gap-y-3 text-sm">
        {paymentInfo.acceptBankTransfer && (
          <>
            <div className="text-zinc-500">Payment Method</div>
            <div className="font-medium">: Bank Transfer</div>
            
            {paymentInfo.bankName && (
              <>
                <div className="text-zinc-500">Bank Name</div>
                <div className="font-medium">: {paymentInfo.bankName}</div>
              </>
            )}
            
            {paymentInfo.accountNumber && (
              <>
                <div className="text-zinc-500">Account Number</div>
                <div className="font-medium">: {paymentInfo.accountNumber}</div>
              </>
            )}
            
            {paymentInfo.ifscCode && (
              <>
                <div className="text-zinc-500">IFSC / SWIFT</div>
                <div className="font-medium">: {paymentInfo.ifscCode}</div>
              </>
            )}
            
            {paymentInfo.accountHolder && (
              <>
                <div className="text-zinc-500">Account Holder</div>
                <div className="font-medium">: {paymentInfo.accountHolder}</div>
              </>
            )}
          </>
        )}
        
        {(!paymentInfo.acceptBankTransfer && paymentInfo.acceptUpi) && (
          <>
            <div className="text-zinc-500">Payment Method</div>
            <div className="font-medium">: UPI</div>
          </>
        )}
        
        {paymentInfo.acceptUpi && paymentInfo.upiId && (
          <>
            <div className="text-zinc-500">UPI ID</div>
            <div className="font-medium">: {paymentInfo.upiId}</div>
          </>
        )}
      </div>
    </div>
  );
};
