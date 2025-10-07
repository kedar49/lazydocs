// Initialize Lucide icons
lucide.createIcons();

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll reveal animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.feature-card, .example-card, .model-card, .step').forEach(el => {
    el.classList.add('scroll-reveal');
    observer.observe(el);
});

// Copy code functionality
document.querySelectorAll('.copy-btn').forEach(button => {
    button.addEventListener('click', async function () {
        const code = this.getAttribute('data-copy');

        try {
            await navigator.clipboard.writeText(code);

            // Change icon to check
            const icon = this.querySelector('i');
            const originalIcon = icon.getAttribute('data-lucide');

            // Add copied class
            this.classList.add('copied');
            icon.setAttribute('data-lucide', 'check');
            lucide.createIcons();

            // Reset after 2 seconds
            setTimeout(() => {
                this.classList.remove('copied');
                icon.setAttribute('data-lucide', 'copy');
                lucide.createIcons();
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });
});

// Copy code blocks on click
document.querySelectorAll('pre code').forEach(block => {
    // Skip if it's inside a code-block with copy button
    if (block.closest('.code-block')) return;

    block.style.cursor = 'pointer';
    block.title = 'Click to copy';

    block.addEventListener('click', async () => {
        const text = block.textContent;
        try {
            await navigator.clipboard.writeText(text);

            // Visual feedback
            const originalBg = block.parentElement.style.background;
            block.parentElement.style.background = 'var(--accent-light)';
            block.parentElement.style.transition = 'background 0.3s';

            setTimeout(() => {
                block.parentElement.style.background = originalBg;
            }, 300);

            // Show tooltip
            const tooltip = document.createElement('div');
            tooltip.textContent = '✓ Copied!';
            tooltip.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--accent);
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                font-weight: 500;
                z-index: 1000;
                animation: fadeInUp 0.3s ease-out;
            `;
            document.body.appendChild(tooltip);

            setTimeout(() => {
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translate(-50%, -50%) translateY(-10px)';
                tooltip.style.transition = 'all 0.3s';
                setTimeout(() => tooltip.remove(), 300);
            }, 1500);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });
});

// Parallax effect for hero blobs
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
});

function animateBlobs() {
    const blob1 = document.querySelector('.blob-1');
    const blob2 = document.querySelector('.blob-2');

    if (blob1 && blob2) {
        const moveX1 = (mouseX - 0.5) * 50;
        const moveY1 = (mouseY - 0.5) * 50;
        const moveX2 = (mouseX - 0.5) * -30;
        const moveY2 = (mouseY - 0.5) * -30;

        blob1.style.transform = `translate(${moveX1}px, ${moveY1}px)`;
        blob2.style.transform = `translate(${moveX2}px, ${moveY2}px)`;
    }

    requestAnimationFrame(animateBlobs);
}

animateBlobs();

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 12px var(--shadow)';
    } else {
        navbar.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// Add hover effect to feature cards
document.querySelectorAll('.feature-card, .example-card, .model-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Animate numbers (if you want to add stats)
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Add sparkle effect on hover for buttons
document.querySelectorAll('.btn-primary').forEach(button => {
    button.addEventListener('mouseenter', function (e) {
        const sparkle = document.createElement('span');
        sparkle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: white;
            border-radius: 50%;
            pointer-events: none;
            animation: sparkle 0.6s ease-out forwards;
        `;

        const rect = this.getBoundingClientRect();
        sparkle.style.left = (e.clientX - rect.left) + 'px';
        sparkle.style.top = (e.clientY - rect.top) + 'px';

        this.style.position = 'relative';
        this.appendChild(sparkle);

        setTimeout(() => sparkle.remove(), 600);
    });
});

// Add CSS for sparkle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkle {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Typing effect for hero title (optional)
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Easter egg: Konami code
let konamiCode = [];
const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join(',') === konamiPattern.join(',')) {
        // Easter egg activated!
        document.body.style.animation = 'rainbow 2s infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
});

const rainbowStyle = document.createElement('style');
rainbowStyle.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(rainbowStyle);

console.log('%c🚀 LazyDocs', 'font-size: 24px; font-weight: bold; color: #FF6B6B;');
console.log('%cBuilt with ❤️ using Groq AI', 'font-size: 14px; color: #6B6B6B;');
console.log('%cTry the Konami code! ↑↑↓↓←→←→BA', 'font-size: 12px; color: #FF6B6B;');
