import React from "react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-black pt-12 pb-24 px-6">
      <div className="max-w-3xl mx-auto prose prose-invert prose-amber">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-6">Terms of Service</h1>
        <p className="text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="mt-8 text-slate-300 space-y-6">
          <p>Welcome to Random Frames Studio. By accessing this website and utilizing our services, you agree to be bound by these Terms and Conditions of Use.</p>
          
          <h2 className="text-xl font-bold text-white mt-8">1. Intellectual Property</h2>
          <p>Unless otherwise stated, Random Frames Studio and/or its licensors own the intellectual property rights for all material on the Website. All intellectual property rights are reserved. You may access this from Random Frames Studio for your own personal use subjected to restrictions set in these terms and conditions.</p>
          
          <h2 className="text-xl font-bold text-white mt-8">2. Production Contracts</h2>
          <p>Website quotations and booking requests do not constitute a binding production contract. All shoots, whether automotive, commercial, or editorial, require a formally signed Master Services Agreement (MSA) and a cleared initial deposit via the Client Portal before production commences.</p>

          <h2 className="text-xl font-bold text-white mt-8">3. Media Rights & Usage</h2>
          <p>Usage rights for all delivered media will be explicitly detailed in the Client Quotation. Raw footage and unedited RAW files remain the property of Random Frames Studio unless a complete buyout is negotiated.</p>
        </div>
      </div>
    </div>
  );
}
