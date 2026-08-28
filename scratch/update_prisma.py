import re

with open('backend/prisma/schema.prisma', 'r') as f:
    lines = f.readlines()

def should_restrict(line):
    # If the line contains a relation to Project, Client, or Shoot
    # and has onDelete: Cascade, we replace it with onDelete: Restrict
    if "onDelete: Cascade" not in line:
        return False
    
    # Check if it's a relation to Project, Client, or Shoot
    # Format: fieldName ModelName @relation(...)
    match = re.search(r'\b(client\s+Client\??|project\s+Project\??|shoot\s+Shoot\??)\s+@relation', line)
    if match:
        return True
    return False

for i in range(len(lines)):
    if should_restrict(lines[i]):
        lines[i] = lines[i].replace("onDelete: Cascade", "onDelete: Restrict")

with open('backend/prisma/schema.prisma', 'w') as f:
    f.writelines(lines)
