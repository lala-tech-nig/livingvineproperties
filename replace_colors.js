const fs = require('fs');
const path = require('path');

const directories = [
    path.join(__dirname, 'client', 'app'),
    path.join(__dirname, 'client', 'components')
];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content.replace(/blue-/g, 'orange-');

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function traverseDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            replaceInFile(fullPath);
        }
    }
}

directories.forEach(dir => traverseDir(dir));
console.log('Done replacing colors.');
