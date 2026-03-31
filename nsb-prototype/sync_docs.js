const fs = require('fs');
const path = require('path');

// Target the actual NSB README.md assuming they share the same parent folder
const SOURCE_FILE = path.join(__dirname, '..', 'README.md');
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

    // Links (do this first to prevent link nesting issues)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="link-cyan" target="_blank">$1</a>');

    // ToC Generator
    let tocHtml = '<nav class="docs-toc"><h4>On This Page</h4><ul>';
    let headingCounter = 0;

    // Process Headers and inject anchors
    html = html.replace(/^(#{1,3})\s+(.*$)/gim, (match, hashes, text) => {
        const level = hashes.length;
        const id = text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
        headingCounter++;

        if (level === 2 || level === 3) {
            tocHtml += `<li class="toc-level-${level}"><a href="#${id}">${text.trim()}</a></li>`;
        }

        return `<h${level} id="${id}">${text.trim()}</h${level}>`;
    });

    tocHtml += '</ul></nav>';

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/gim, '<div class="code-block"><pre><code>$1</code></pre></div>');

    // Inline code
    html = html.replace(/`([^`\n]+)`/gim, '<code class="inline-code">$1</code>');

    // Paragraphs (naive approach, handles empty lines)
    html = html.split('\\n\\n').map(p => {
        if (p.trim().startsWith('<h') || p.trim().startsWith('<div') || p.trim().startsWith('<a')) return p;
        return `<p>${p.trim().replace(/\\n/g, '<br>')}</p>`;
    }).join('\\n');

    return { content: html, toc: tocHtml };
}

const parsed = parseMarkdown(markdown);

// Wrapper template matching the clean academic aesthetic
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
        /* Docs Layout System - Design Tokens Usage */
        .docs-layout { display: grid; grid-template-columns: 250px 1fr; gap: 4rem; max-width: 1400px; margin: 8rem auto 4rem; padding: 0 2rem; }
        
        /* Interactive ToC Sidebar */
        .docs-sidebar { position: sticky; top: 100px; height: calc(100vh - 150px); overflow-y: auto; padding-right: 1rem; border-right: 1px solid var(--border-dim); }
        .docs-toc h4 { font-family: var(--font-heading); color: var(--neon-cyan); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1.5rem; font-size: 1.2rem; }
        .docs-toc ul { list-style: none; padding: 0; }
        .docs-toc li { margin-bottom: 0.75rem; transition: transform 0.2s; }
        .docs-toc li:hover { transform: translateX(5px); }
        .docs-toc a { color: var(--text-muted); text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
        .docs-toc a:focus-visible, .docs-toc a:hover { color: var(--neon-cyan); }
        .toc-level-3 { padding-left: 1.5rem; border-left: 2px solid var(--border-dim); font-size: 0.85em; }
        
        /* Main Content Typography */
        .docs-content { padding-bottom: 5rem; max-width: 900px; }
        .docs-content h1 { font-size: 3rem; margin-bottom: 2rem; border-bottom: 3px solid var(--neon-purple); padding-bottom: 1rem; color: var(--text-main); }
        .docs-content h2 { font-size: 2rem; margin-top: 4rem; margin-bottom: 1.5rem; color: var(--neon-cyan); position: relative; }
        .docs-content h3 { font-size: 1.5rem; margin-top: 3rem; margin-bottom: 1rem; color: var(--text-main); }
        .docs-content p, .docs-content ul, .docs-content ol { color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.8; }
        .docs-content ul { padding-left: 1.5rem; color: var(--text-muted); }
        .docs-content li { margin-bottom: 0.5rem; }
        
        /* Code Visuals - Dark block on light page for max contrast */
        .code-block { background: #1e293b; border: 1px solid #334155; padding: 1.5rem; border-radius: 6px; margin: 2rem 0; overflow-x: auto; position: relative; }
        .code-block::before { content: "CODE"; position: absolute; top: 0; right: 0; background: #334155; color: #94a3b8; padding: 0.2rem 0.75rem; font-size: 0.7rem; font-family: var(--font-heading); border-bottom-left-radius: 6px; letter-spacing: 1px; }
        .code-block code { color: #e2e8f0; font-family: 'Courier New', Courier, monospace; font-size: 0.9rem; line-height: 1.6; }
        .code-block h1, .code-block h2, .code-block h3 { color: #ffffff; margin-top: 1rem; border-color: rgba(255,255,255,0.1); }
        .code-block h1 { border-bottom: 3px solid var(--neon-purple); }
        
        .inline-code { background: #e2e8f0; padding: 0.2rem 0.5rem; border-radius: 4px; color: var(--neon-cyan); font-family: 'Courier New', Courier, monospace; font-size: 0.85rem; font-weight: 600; }

        
        /* Links in docs */
        .docs-content a.link-cyan { color: var(--neon-cyan); text-decoration: underline; text-underline-offset: 3px; }
        .docs-content a.link-cyan:hover { color: var(--neon-purple); }

        /* Accessibility */
        @media (max-width: 1024px) {
            .docs-layout { grid-template-columns: 1fr; }
            .docs-sidebar { position: static; height: auto; border-right: none; border-bottom: 1px solid var(--border-dim); padding-bottom: 2rem; margin-bottom: 2rem; }
        }
    </style>
</head>
<body>

    <header class="navbar">
        <div class="nav-content">
            <div class="brand">
                <a href="index.html" style="text-decoration:none;"><div class="brand-glitch" aria-hidden="true">NSB</div></a>
            </div>
            <nav class="links" aria-label="Documentation Navigation">
                <a href="index.html">Home</a>
                <a href="#" class="btn-outline">Documentation</a>
            </nav>
        </div>
    </header>

    <main>
        <div class="docs-layout">
            <aside class="docs-sidebar">
                ${parsed.toc}
            </aside>
            <div class="docs-content">
                ${parsed.content}
            </div>
        </div>
    </main>

    <footer>
        <div class="brand-glitch small" aria-hidden="true">NSB</div>
        <p class="muted">Synced via Automated Pipeline.</p>
    </footer>
</body>
</html>`;

fs.writeFileSync(DEST_FILE, template);
console.log(`[NSB Sync Pipeline] Successfully generated ${DEST_FILE} with synced documentation.`);
console.log(`[NSB Sync Pipeline] Sync complete. Pipeline exiting cleanly.`);
