const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('E:/ai_social_media/client/src/app/(dashboard)', function(f) {
  if (f.endsWith('.tsx')) {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/background:\s*['"]#fff(?:fff)?['"]/g, 'background: "var(--bg-card)"');
    c = c.replace(/backgroundColor:\s*['"]#fff(?:fff)?['"]/g, 'backgroundColor: "var(--bg-card)"');
    c = c.replace(/background:\s*['"]#f9fafb['"]/g, 'background: "var(--bg-input)"');
    c = c.replace(/color:\s*['"]#111827['"]/g, 'color: "var(--text-primary)"');
    c = c.replace(/color:\s*['"]#374151['"]/g, 'color: "var(--text-primary)"');
    c = c.replace(/color:\s*['"]#4b5563['"]/g, 'color: "var(--text-secondary)"');
    c = c.replace(/color:\s*['"]#6b7280['"]/g, 'color: "var(--text-secondary)"');
    c = c.replace(/color:\s*['"]#9ca3af['"]/g, 'color: "var(--text-muted)"');
    c = c.replace(/border:\s*['"]1px solid #e5e7eb['"]/g, 'border: "1px solid var(--border-color)"');
    c = c.replace(/borderBottom:\s*['"]1px solid #e5e7eb['"]/g, 'borderBottom: "1px solid var(--border-color)"');
    c = c.replace(/borderTop:\s*['"]1px solid #e5e7eb['"]/g, 'borderTop: "1px solid var(--border-color)"');
    c = c.replace(/border:\s*['"]1px dashed #d1d5db['"]/g, 'border: "1px dashed var(--border-color)"');
    c = c.replace(/border:\s*['"]1px solid #d1d5db['"]/g, 'border: "1px solid var(--border-color)"');
    c = c.replace(/borderColor:\s*['"]#e5e7eb['"]/g, 'borderColor: "var(--border-color)"');
    c = c.replace(/background:\s*['"]#f3f4f6['"]/g, 'background: "var(--bg-hover)"');
    c = c.replace(/background:\s*['"]#fafafa['"]/g, 'background: "var(--bg-hover)"');
    c = c.replace(/color:\s*['"]#16a34a['"]/g, 'color: "var(--primary-color)"');
    fs.writeFileSync(f, c);
  }
});
console.log('All files fixed!');
