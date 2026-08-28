const fs = require('fs');
let code = fs.readFileSync('frontend/components/finance/receipt-generator.tsx', 'utf8');
code = code.replace(/import { useToast } from "@\/components\/ui\/use-toast";/g, '');
code = code.replace(/const { toast } = useToast\(\);/g, '');
code = code.replace(/toast\({ title: "Receipt updated successfully" }\);/g, 'alert("Receipt updated successfully");');
code = code.replace(/toast\({ title: "Error", description: result.error, variant: "destructive" }\);/g, 'alert(result.error);');
fs.writeFileSync('frontend/components/finance/receipt-generator.tsx', code);
