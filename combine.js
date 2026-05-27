const fs = require('fs');
const path = require('path');

function processDir(dir, outFile) {
    const files = [];
    function readDir(currentDir) {
        if (!fs.existsSync(currentDir)) return;
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            if (entry.isDirectory() && entry.name !== 'node_modules') {
                readDir(fullPath);
            } else if (entry.isFile()) {
                files.push(fullPath);
            }
        }
    }
    readDir(dir);
    
    let content = '';
    for (const file of files) {
        content += `\n\n--- FILE: ${file.replace(/\\/g, '/')} ---\n`;
        content += fs.readFileSync(file, 'utf8');
    }
    fs.writeFileSync(outFile, content);
}

processDir(path.join(__dirname, 'backend', 'src'), path.join(__dirname, 'backend_all.txt'));
processDir(path.join(__dirname, 'frontend', 'src'), path.join(__dirname, 'frontend_all.txt'));
