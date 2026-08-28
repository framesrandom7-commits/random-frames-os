import React from "react";
import { PaymentSettings } from "./types";
import { CheckCircle2 } from "lucide-react";

export const PaymentBlock: React.FC<{
  paymentInfo: PaymentSettings;
}> = ({ paymentInfo }) => {
  return (
    <div>
      <div className="flex items-center gap-3 text-[#C1121F] font-bold mb-4">
        <div className="border border-[#C1121F] rounded-full p-1.5 flex items-center justify-center">
          <CheckCircle2 size={16} strokeWidth={2} /> 
        </div>
        <span className="uppercase text-black tracking-wide">PAYMENT INFORMATION</span>
      </div>
      
      <div className="grid grid-cols-[130px_1fr] gap-y-3 text-[11px]">
        {paymentInfo.acceptBankTransfer && (
          <>
            <div className="text-[#111111]">Payment Method</div>
            <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;Bank Transfer</div>
            
            {paymentInfo.bankName && (
              <>
                <div className="text-[#111111]">Bank Name</div>
                <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;{paymentInfo.bankName}</div>
              </>
            )}
            
            {paymentInfo.accountHolder && (
              <>
                <div className="text-[#111111]">Account Holder</div>
                <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;{paymentInfo.accountHolder}</div>
              </>
            )}
            
            {paymentInfo.accountNumber && (
              <>
                <div className="text-[#111111]">Account Number</div>
                <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;{paymentInfo.accountNumber}</div>
              </>
            )}
            
            {paymentInfo.ifscCode && (
              <>
                <div className="text-[#111111]">IFSC</div>
                <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;{paymentInfo.ifscCode}</div>
              </>
            )}
          </>
        )}
        
        {(!paymentInfo.acceptBankTransfer && paymentInfo.acceptUpi) && (
          <>
            <div className="text-[#111111]">Payment Method</div>
            <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;UPI</div>
          </>
        )}
        
        {paymentInfo.acceptUpi && paymentInfo.upiId && (
          <>
            <div className="text-[#111111]">UPI ID</div>
            <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;{paymentInfo.upiId}</div>
          </>
        )}
      </div>
    </div>
  );
};
