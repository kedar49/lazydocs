// Initialize Lucide icons
lucide.createIcons();

/* -------------------------------------------------------------
 * 1. Global Copy-to-Clipboard & Floating Tooltip Utility
 * ------------------------------------------------------------- */
function showCopyTooltip(message = 'Copied to clipboard!') {
    // Remove existing tooltip if any
    const existing = document.querySelector('.copy-tooltip');
    if (existing) existing.remove();

    const tooltip = document.createElement('div');
    tooltip.className = 'copy-tooltip';
    tooltip.innerHTML = `<i data-lucide="check-circle" style="width:16px;height:16px;color:#10B981;"></i> <span>${message}</span>`;
    document.body.appendChild(tooltip);
    lucide.createIcons();

    // Fade out and remove
    setTimeout(() => {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(10px)';
        tooltip.style.transition = 'all 0.3s ease';
        setTimeout(() => tooltip.remove(), 300);
    }, 1500);
}

async function copyTextToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showCopyTooltip();
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}

// Bind standard copy buttons
document.querySelectorAll('.copy-box-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-copy');
        copyTextToClipboard(text);
    });
});

document.querySelectorAll('.notebook-copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-copy-id');
        const codeElement = document.getElementById(targetId);
        if (codeElement) {
            copyTextToClipboard(codeElement.textContent);
        }
    });
});


/* -------------------------------------------------------------
 * 2. Interactive Terminal Simulator (Typewriter Effects)
 * ------------------------------------------------------------- */
const terminalContainer = document.getElementById('terminal-simulator');

const terminalScript = [
    { type: 'input', text: 'npm install -g @lazykedar/lazydocs' },
    { type: 'log', text: 'added 386 packages in 4.2s', delay: 600 },
    { type: 'input', text: 'lazydocs generate --interactive' },
    { type: 'log', text: 'Analyzing codebase...', delay: 400 },
    { type: 'info', text: '  Found 14 files, 1,280 lines of code' },
    { type: 'info', text: '  Functions: 26, Classes: 4, Avg Complexity: 2.4' },
    { type: 'log', text: 'Generating documentation via llama-3.3-70b-versatile...', delay: 800 },
    { type: 'success', text: '✔ README.md successfully created inside anchors! (0.8s)', delay: 1000 },
    { type: 'code', text: '# @lazykedar/lazydocs\n\n## 📋 Overview\n<!-- lazydocs:start:overview -->\nLazyDocs is a high-performance, developer-native Node CLI...', delay: 200 }
];

let scriptIndex = 0;

function clearTerminal() {
    terminalContainer.innerHTML = '';
}

function writeLine(className, content) {
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.innerHTML = content;
    terminalContainer.appendChild(line);
    terminalContainer.scrollTop = terminalContainer.scrollHeight;
}

function typeCommand(text, callback) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerHTML = `<span class="terminal-prompt">$</span><span class="typing-text"></span><span class="terminal-cursor"></span>`;
    terminalContainer.appendChild(line);
    
    const typingSpan = line.querySelector('.typing-text');
    const cursor = line.querySelector('.terminal-cursor');
    let charIndex = 0;
    
    const interval = setInterval(() => {
        typingSpan.textContent += text.charAt(charIndex);
        charIndex++;
        terminalContainer.scrollTop = terminalContainer.scrollHeight;
        
        if (charIndex >= text.length) {
            clearInterval(interval);
            cursor.remove();
            setTimeout(callback, 500);
        }
    }, 55);
}

function runTerminalSimulation() {
    if (scriptIndex >= terminalScript.length) {
        // Reset simulation after a pause
        setTimeout(() => {
            clearTerminal();
            scriptIndex = 0;
            runTerminalSimulation();
        }, 5000);
        return;
    }
    
    const step = terminalScript[scriptIndex];
    scriptIndex++;
    
    if (step.type === 'input') {
        typeCommand(step.text, runTerminalSimulation);
    } else {
        const delay = step.delay || 300;
        setTimeout(() => {
            let colorClass = 'terminal-comment';
            if (step.type === 'success') colorClass = 'terminal-success';
            if (step.type === 'info') colorClass = 'terminal-info';
            if (step.type === 'code') colorClass = 'terminal-code';
            
            // Format code previews nicely
            const textToPrint = step.type === 'code' 
                ? `<pre style="padding:0;background:transparent;border:none;box-shadow:none;color:#68DB9F;font-size:0.85rem;margin:0.5rem 0;">${step.text}</pre>`
                : step.text;
                
            writeLine(colorClass, textToPrint);
            runTerminalSimulation();
        }, delay);
    }
}

// Start simulator on load
if (terminalContainer) {
    runTerminalSimulation();
}


/* -------------------------------------------------------------
 * 3. Interactive CLI Option Builder
 * ------------------------------------------------------------- */
const typeSelectors = document.querySelectorAll('#builder-type-selectors .selector-btn');
const modelSelectors = document.querySelectorAll('#builder-model-selectors .selector-btn');
const baseInput = document.getElementById('builder-base-input');
const headInput = document.getElementById('builder-head-input');
const templateInput = document.getElementById('builder-template-input');
const commandOutput = document.getElementById('command-output');
const btnCopyCommand = document.getElementById('btn-copy-command');

const branchGroup = document.getElementById('branch-inputs-group');
const templateGroup = document.getElementById('template-input-group');

let selectedType = 'readme';
let selectedModel = 'llama-3.3-70b-versatile';

function updateCommand() {
    let cmd = 'lazydocs generate';
    
    if (selectedType !== 'readme') {
        cmd += ` -t ${selectedType}`;
    }
    
    if (selectedModel !== 'llama-3.3-70b-versatile') {
        cmd += ` -m ${selectedModel}`;
    }
    
    if (selectedType === 'pr') {
        const base = baseInput.value.trim();
        const head = headInput.value.trim();
        if (base) {
            cmd += ` --base ${base}`;
            if (head) {
                cmd += ` --head ${head}`;
            }
        }
    }
    
    if (selectedType === 'readme') {
        const template = templateInput.value.trim();
        if (template) {
            cmd += ` --template ${template}`;
        }
    }
    
    commandOutput.textContent = cmd;
}

// Type selector clicks
typeSelectors.forEach(btn => {
    btn.addEventListener('click', () => {
        typeSelectors.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedType = btn.getAttribute('data-value');
        
        // Toggle conditional inputs based on selected type
        if (selectedType === 'pr') {
            branchGroup.classList.remove('hidden');
            templateGroup.classList.add('hidden');
        } else if (selectedType === 'readme') {
            branchGroup.classList.add('hidden');
            templateGroup.classList.remove('hidden');
        } else {
            branchGroup.classList.add('hidden');
            templateGroup.classList.add('hidden');
        }
        
        updateCommand();
    });
});

// Model selector clicks
modelSelectors.forEach(btn => {
    btn.addEventListener('click', () => {
        modelSelectors.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedModel = btn.getAttribute('data-value');
        updateCommand();
    });
});

// Inputs changes
if (baseInput) baseInput.addEventListener('input', updateCommand);
if (headInput) headInput.addEventListener('input', updateCommand);
if (templateInput) templateInput.addEventListener('input', updateCommand);

// Copy Command action
if (btnCopyCommand) {
    btnCopyCommand.addEventListener('click', () => {
        copyTextToClipboard(commandOutput.textContent);
    });
}

// Run initial builder compiler
updateCommand();


/* -------------------------------------------------------------
 * 4. Notebook Tabbed Preview Panel Controls
 * ------------------------------------------------------------- */
const tabButtons = document.querySelectorAll('.notebook-tabs .tab-btn');
const tabContents = document.querySelectorAll('.notebook-body .tab-content');

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Toggle tab highlights
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Toggle active panels
        const targetId = btn.getAttribute('data-target');
        tabContents.forEach(content => {
            if (content.id === targetId) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    });
});


/* -------------------------------------------------------------
 * 5. Mobile Menu Toggle Responsive Handler
 * ------------------------------------------------------------- */
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileMenuToggle.querySelector('i');
        const isOpen = navLinks.classList.contains('active');
        
        if (isOpen) {
            icon.setAttribute('data-lucide', 'x');
        } else {
            icon.setAttribute('data-lucide', 'menu');
        }
        lucide.createIcons();
    });

    // Close menu when clicking link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            icon.setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        });
    });
}
