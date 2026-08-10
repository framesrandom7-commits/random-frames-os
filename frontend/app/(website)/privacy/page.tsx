import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black pt-12 pb-24 px-6">
      <div className="max-w-3xl mx-auto prose prose-invert prose-amber">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-6">Privacy Policy</h1>
        <p className="text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="mt-8 text-slate-300 space-y-6">
          <p>At Random Frames Studio, accessible from randomframes.os, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Random Frames Studio and how we use it.</p>
          
          <h2 className="text-xl font-bold text-white mt-8">Information We Collect</h2>
          <p>The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.</p>
          <p>If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.</p>
          
          <h2 className="text-xl font-bold text-white mt-8">How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Provide, operate, and maintain our website and studio operations.</li>
            <li>Improve, personalize, and expand our website and services.</li>
            <li>Understand and analyze how you use our website.</li>
            <li>Develop new products, services, features, and functionality.</li>
            <li>Communicate with you for customer service, updates, and marketing.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8">Client Portal & Project Data</h2>
          <p>All project briefs, unreleased media, financial records, and proprietary client data are protected under strict RBAC (Role-Based Access Control) protocols via the Random Frames OS. This data is entirely compartmentalized and never shared with third parties without explicit contractual authorization.</p>
        </div>
      </div>
    </div>
  );
}
