const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./components', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace <SelectValue placeholder="Anything" />
    content = content.replace(/<SelectValue\s+placeholder="[^"]*"\s*\/>/g, '<SelectValue placeholder="- - -" />');
    
    // Replace <SelectValue /> with <SelectValue placeholder="- - -" />
    content = content.replace(/<SelectValue\s*\/>/g, '<SelectValue placeholder="- - -" />');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
