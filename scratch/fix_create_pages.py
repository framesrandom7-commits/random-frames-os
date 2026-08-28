import os
path = 'scratch/create_pages.sh'
content = open(path).read()
content = content.replace('import { checkAdminRbac } from "@/lib/core/permissions/rbac.service";\n', '')
content = content.replace('  await checkAdminRbac();\n', '')
content = content.replace('import { checkFounderRbac } from "@/lib/core/permissions/rbac.service";\n', '')
content = content.replace('  await checkFounderRbac();\n', '')
open(path, 'w').write(content)
