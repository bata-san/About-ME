/**
 * Portfolio Main Script
 * Entry point for the application.
 */

import { createRipple, initTheme, toggleTheme } from './utils.js';
import { initDiscordStatus } from './discord.js';
import { initCustomCursor } from './cursor.js';
import { initDecorations } from './decorations.js';

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
        initDiscordStatus();
        initAge();
        initCustomCursor();
        initDecorations();
        initHoloEffect();
        setupAnimations();
        setupRippleEffect();
        setupThemeToggle();
    }

    /**
     * Initialize Age Calculation with Playful Toggle
     */
    function initAge() {
        const ageElement = document.getElementById('age-display');
        if (!ageElement) return;

        const birthDate = new Date('2009-08-31');
        let mode = 'years'; // 'years' | 'days' | 'hours'

        const update = () => {
            const now = new Date();
            const diff = now - birthDate;

            if (mode === 'years') {
                const ageDate = new Date(diff);
                const years = Math.abs(ageDate.getUTCFullYear() - 1970);
                ageElement.textContent = `${years}`;
                ageElement.setAttribute('data-unit', 'years');
            } else if (mode === 'days') {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                ageElement.textContent = `${days.toLocaleString()}`;
                ageElement.setAttribute('data-unit', 'days');
            } else if (mode === 'hours') {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                ageElement.textContent = `${hours.toLocaleString()}`;
                ageElement.setAttribute('data-unit', 'hours');
            }
        };

        // Initial update
        update();

        // Toggle on click
        ageElement.addEventListener('click', () => {
            if (mode === 'years') mode = 'days';
            else if (mode === 'days') mode = 'hours';
            else mode = 'years';
            
            // Add glitch effect class temporarily
            ageElement.classList.add('glitch-active');
            setTimeout(() => ageElement.classList.remove('glitch-active'), 300);
            
            update();
        });

        // Update every minute just in case
        setInterval(update, 60000);
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
