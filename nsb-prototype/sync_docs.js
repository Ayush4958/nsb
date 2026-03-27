const fs = require('fs');
const path = require('path');

// Target the actual NSB README.md assuming they share the same parent folder (SOR)
const SOURCE_FILE = path.join(__dirname, '..', '..', '..', 'nsb', 'README.md');
const DEST_FILE = path.join(__dirname, 'docs.html');

console.log(`[NSB Sync Pipeline] Initializing documentation sync...`);

if (!fs.existsSync(SOURCE_FILE)) {
    console.error(`[ERROR] Could not find NSB repository at ${SOURCE_FILE}. Ensure the 'nsb' folder exists alongside 'ucsc-ospo.github.io'.`);
    process.exit(1);
}

const markdown = fs.readFileSync(SOURCE_FILE, 'utf-8');
console.log(`[NSB Sync Pipeline] Read ${markdown.length} bytes from README.md.`);

// Very basic regex-based Markdown to HTML parser
function parseMarkdown(md) {
    let html = md;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
    
    // Code blocks
    html = html.replace(/```([\s\S]*?)```/gim, '<div class="code-block"><pre><code>$1</code></pre></div>');
    
    // Inline code
    html = html.replace(/`(.*?)`/gim, '<code class="inline-code">$1</code>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="link-cyan">$1</a>');
    
    // Paragraphs (naive approach, handles empty lines)
    html = html.split('\n\n').map(p => {
        if (p.trim().startsWith('<h') || p.trim().startsWith('<div')) return p;
        return `<p>${p.trim().replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

    return html;
}

const htmlContent = parseMarkdown(markdown);

// Wrapper template matching the bold cyberpunk aesthetic
const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NSB | Documentation Hub</title>
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet">
    <style>
        .docs-container { max-width: 900px; margin: 8rem auto 4rem; padding: 2rem; background: var(--bg-surface); border: 1px solid var(--border-dim); border-radius: 8px;}
        .docs-container h1 { font-size: 3rem; margin-bottom: 2rem; border-bottom: 2px solid var(--neon-cyan); padding-bottom: 1rem; color: var(--text-main); }
        .docs-container h2 { font-size: 2rem; margin-top: 3rem; margin-bottom: 1.5rem; color: var(--neon-purple); }
        .docs-container h3 { font-size: 1.5rem; margin-top: 2rem; margin-bottom: 1rem; color: var(--text-main); }
        .docs-container p { color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.8; }
        .code-block { background: var(--bg-void); border: 1px solid var(--border-dim); padding: 1rem; border-radius: 6px; margin: 1.5rem 0; overflow-x: auto; }
        .code-block code { color: #4ade80; font-family: monospace; font-size: 0.9rem; }
        .inline-code { background: rgba(255,255,255,0.05); padding: 0.2rem 0.4rem; border-radius: 4px; color: var(--neon-cyan); font-family: monospace; font-size: 0.9rem;}
    </style>
</head>
<body>
    <div class="noise-overlay"></div>
    <div class="cyber-grid"></div>

    <header class="navbar">
        <div class="nav-content">
            <div class="brand">
                <a href="index.html" style="text-decoration:none;"><div class="brand-glitch" data-text="NSB">NSB</div></a>
            </div>
            <nav class="links">
                <a href="index.html">Home</a>
                <a href="#" class="btn-outline">Documentation</a>
            </nav>
        </div>
    </header>

    <main>
        <div class="docs-container">
            ${htmlContent}
        </div>
    </main>

    <footer>
        <div class="footer-grid">
            <div class="brand-col">
                <div class="brand-glitch small">NSB</div>
                <p class="muted">Synced via Automated Pipeline.</p>
            </div>
        </div>
    </footer>
</body>
</html>`;

fs.writeFileSync(DEST_FILE, template);
console.log(`[NSB Sync Pipeline] Successfully generated ${DEST_FILE} with synced documentation.`);
console.log(`[NSB Sync Pipeline] Sync complete. Pipeline exiting cleanly.`);
