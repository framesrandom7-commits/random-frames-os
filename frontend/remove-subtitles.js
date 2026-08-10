const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('/Users/savansomaiahtp/Documents/random-frames-os/frontend/app/(dashboard)', function(filePath) {
  if (filePath.endsWith('.tsx') && !filePath.includes('/home/') && !filePath.endsWith('workspace-page.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // We want to remove the subtitle="..." or subtitle={`...`} or subtitle={...} line inside PageHeader or ModuleHeader
    // This regex looks for subtitle= followed by "...", `...`, or {...} on its own line or within a tag
    // Since it's usually on its own line like `        subtitle="Something"` we can replace it.
    let newContent = content.replace(/\s*subtitle=(?:"[^"]*"|`[^`]*`|\{[^\}]*\})\s*/g, ' ');
    
    if (content !== newContent) {
      console.log('Modified:', filePath);
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
  }
});
