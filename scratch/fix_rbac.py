import os

base_path = "frontend/app/(dashboard)/settings"
pages = ["business", "branding", "team", "roles", "invoice", "payment", "notifications", "calendar", "forms", "workflow"]

for page in pages:
    file_path = f"{base_path}/{page}/page.tsx"
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            content = f.read()
        
        # Remove import of checkAdminRbac
        content = content.replace('import { checkAdminRbac } from "@/lib/core/permissions/rbac.service";\n', '')
        # Remove await checkAdminRbac();
        content = content.replace('  await checkAdminRbac();\n', '')
        
        with open(file_path, "w") as f:
            f.write(content)

