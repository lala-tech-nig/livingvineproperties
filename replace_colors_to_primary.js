const fs = require('fs');
const path = require('path');

const directories = [
    path.join(__dirname, 'client', 'app'),
    path.join(__dirname, 'client', 'components')
];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content
        .replace(/bg-orange-600/g, 'bg-[#de1f25]')
        .replace(/bg-orange-500/g, 'bg-[#de1f25]')
        .replace(/hover:bg-orange-700/g, 'hover:bg-[#b0181d]')
        .replace(/text-orange-600/g, 'text-[#de1f25]')
        .replace(/text-orange-700/g, 'text-[#b0181d]')
        .replace(/text-orange-500/g, 'text-[#de1f25]')
        .replace(/text-orange-100/g, 'text-[#de1f25]/20')
        .replace(/border-orange-500/g, 'border-[#de1f25]')
        .replace(/border-orange-200/g, 'border-[#de1f25]/20')
        .replace(/ring-orange-500/g, 'ring-[#de1f25]')
        .replace(/focus:ring-orange-500/g, 'focus:ring-[#de1f25]')
        .replace(/focus:border-orange-600/g, 'focus:border-[#de1f25]')
        .replace(/shadow-orange-600\/20/g, 'shadow-[#de1f25]/20')
        .replace(/shadow-orange-600\/40/g, 'shadow-[#de1f25]/40')
        .replace(/bg-orange-50/g, 'bg-[#de1f25]/10');

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
