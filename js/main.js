/**
 * Portfolio Main Script
 * Entry point for the application.
 */

import { createRipple, initTheme, toggleTheme } from './utils.js';

(function () {
    'use strict';

    // DOM Elements
    const elements = {
        card: document.querySelector('.card'),
        container: document.querySelector('.container'),
        linkButtons: document.querySelectorAll('.link-button'),
        themeToggle: document.getElementById('theme-toggle')
    };

    /**
     * Initialize the application
     */
    function init() {
        initTheme();
        setupAnimations();
        setupRippleEffect();
        setupThemeToggle();
    }

    /**
     * Setup theme toggle
     */
    function setupThemeToggle() {
        if (elements.themeToggle) {
            elements.themeToggle.addEventListener('click', toggleTheme);
        }
    }

    /**
     * Setup initial animations
     */
    function setupAnimations() {
        // Initial card state
        elements.card.style.opacity = '0';
        elements.card.style.transform = 'translateY(20px)';

        // Trigger entry animation
        setTimeout(() => {
            elements.card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            elements.card.style.opacity = '1';
            elements.card.style.transform = 'translateY(0)';
        }, 100);
    }

    /**
     * Setup ripple effect for buttons
     */
    function setupRippleEffect() {
        elements.linkButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Allow default navigation for links
                const href = button.getAttribute('href');
                if (href && (href.startsWith('http') || href.endsWith('.html'))) {
                    return;
                }

                e.preventDefault();
                createRipple(e, button);
            });
        });
    }

    // Start the app
    document.addEventListener('DOMContentLoaded', init);

})();
