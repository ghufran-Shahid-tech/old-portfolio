
document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-button');
    const sections = document.querySelectorAll('.section-content');
    const currentYearElement = document.getElementById('current-year');
    const typingTextElement = document.getElementById('typing-text');
    const skillItems = document.querySelectorAll('.skill-item');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const downloadCvButton = document.querySelector('.download-cv-button');
    const generateDescriptionButtons = document.querySelectorAll('.generate-description-button');
    const socialIconLinks = document.querySelectorAll('.social-icon-link');

    // Set current year in footer dynamically
    currentYearElement.textContent = new Date().getFullYear();

    // Initialize Lucide icons for all elements with data-lucide attribute
    lucide.createIcons();

 
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 150; // milliseconds per character for typing
    let deletingSpeed = 40; // milliseconds per character for deleting
    let pauseBeforeDelete = 1500; // milliseconds to pause before deleting a phrase
    let pauseBeforeType = 500; // milliseconds to pause before typing the next phrase

    function typeWriter() {
        // Ensure typingTextElement exists before proceeding
        if (!typingTextElement) return;

        const currentPhrase = phrases[phraseIndex];
        if (isDeleting) {
            // If deleting, remove one character
            typingTextElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            // If typing, add one character
            typingTextElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }

        let currentTypingSpeed = isDeleting ? deletingSpeed : typingSpeed;

        // Check if typing is complete or deleting is complete
        if (!isDeleting && charIndex === currentPhrase.length) {
            currentTypingSpeed = pauseBeforeDelete; // Pause before starting to delete
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false; // Switch to typing mode
            phraseIndex = (phraseIndex + 1) % phrases.length; // Move to the next phrase
            currentTypingSpeed = pauseBeforeType; // Pause before typing the next phrase
        }

        // Schedule the next character update
        setTimeout(typeWriter, currentTypingSpeed);
    }

    // Intersection Observer for scroll-triggered animations (ONLY for Skills section)
    // This observes elements and adds 'is-animated' class when they enter the viewport
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const animatedElements = entry.target.querySelectorAll('.animated-text');
                animatedElements.forEach((el, index) => {
                    // Apply staggered delay for a smoother reveal effect
                    setTimeout(() => {
                        el.classList.add('is-animated');
                    }, 100 + (index * 100)); // 100ms initial delay + 100ms per element
                });
                // Stop observing once the elements are animated to prevent re-triggering
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: '0px 0px -50px 0px' // Make elements animate slightly earlier
    });

    // Observe the skills section from the beginning
    const skillsSection = document.getElementById('skills-section');
    if (skillsSection) {
        observer.observe(skillsSection);
    }

    // Function to control section visibility and trigger animations
    function showSection(sectionId) {
        // Hide all sections first
        sections.forEach(section => {
            section.classList.remove('active');
            // When a section becomes inactive, remove 'is-animated' to reset for next activation
            section.querySelectorAll('.animated-text').forEach(el => {
                el.classList.remove('is-animated');
            });
        });

        // Show the target section
        const targetSection = document.getElementById(`${sectionId}-section`);
        targetSection.classList.add('active');

        // Update active state for navigation buttons
        navButtons.forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`.nav-button[data-section="${sectionId}"]`).classList.add('active');

        // Manually trigger animation for About, Portfolio, Contact sections
        // The Skills section is handled by the IntersectionObserver
        // This ensures that when you click a nav button, the corresponding section animates in.
        // The 'animated-text' elements within the target section will now fade in and slide up.
        const animatedElementsInTargetSection = targetSection.querySelectorAll('.animated-text');
        animatedElementsInTargetSection.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('is-animated');
            }, 100 + (index * 100)); // Staggered animation
        });


        // Start typing animation only for the 'about' section
        if (sectionId === 'about') {
            charIndex = 0;
            isDeleting = false;
            phraseIndex = 0;
            if (typingTextElement) { // Ensure element exists before clearing
                typingTextElement.textContent = ''; // Clear text before starting
            }
            typeWriter();
        } else {
            if (typingTextElement) { // Ensure element exists before clearing
                typingTextElement.textContent = '';
            }
        }
    }

    // Helper function to attach press animations
    function attachPressAnimations(element) {
        element.addEventListener('mousedown', () => { element.classList.add('is-pressed'); });
        element.addEventListener('mouseup', () => { element.classList.remove('is-pressed'); });
        element.addEventListener('mouseleave', () => { element.classList.remove('is-pressed'); });
        element.addEventListener('touchstart', (e) => { e.stopPropagation(); element.classList.add('is-pressed'); }, { passive: true });
        element.addEventListener('touchend', () => { element.classList.remove('is-pressed'); });
        element.addEventListener('touchcancel', () => { element.classList.remove('is-pressed'); });
    }


    // Add event listeners to navigation buttons for section switching and press effects
    navButtons.forEach(button => {
        attachPressAnimations(button); // Apply press animations
        // Click event to switch sections
        button.addEventListener('click', (event) => {
            const sectionToShow = event.target.dataset.section;
            showSection(sectionToShow);
        });
    });

    // Add touch/click animation for skill items
    skillItems.forEach(item => {
        attachPressAnimations(item);
    });

    // Add touch/click animation for portfolio items
    portfolioItems.forEach(item => {
        attachPressAnimations(item);
    });

    // Add touch/click animation for the Download CV button
    if (downloadCvButton) {
        attachPressAnimations(downloadCvButton);
    }

    // Add touch/click animation for social media icons
    socialIconLinks.forEach(link => {
        attachPressAnimations(link);
    });

    // --- Gemini API Integration Logic ---
    generateDescriptionButtons.forEach(button => {
        attachPressAnimations(button); // Apply press animations

        button.addEventListener('click', async (event) => {
            const projectTitle = event.currentTarget.dataset.projectTitle;
            const targetDescriptionId = event.currentTarget.dataset.targetId;
            const descriptionElement = document.getElementById(targetDescriptionId);
            // Store original text to restore if needed (e.g., on error or reset)
            const originalDescription = descriptionElement.dataset.originalText || descriptionElement.textContent;
            descriptionElement.dataset.originalText = originalDescription; // Save original text

            if (!projectTitle || !descriptionElement) {
                console.error("Missing project title or target description element.");
                return;
            }

            // Show loading indicator
            descriptionElement.innerHTML = `<div class="loading-indicator"><div class="loading-spinner"></div>Generating...</div>`;
            button.disabled = true; // Disable button during generation

            try {
                let chatHistory = [];
                const prompt = `Generate a concise, professional, and engaging 2-3 sentence project description for a portfolio based on the following project title: "${projectTitle}". Focus on the key achievement or purpose.`;
                chatHistory.push({ role: "user", parts: [{ text: prompt }] });

                const payload = { contents: chatHistory };
                const apiKey = ""; // Canvas will automatically provide the API key
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    const generatedText = result.candidates[0].content.parts[0].text;
                    descriptionElement.innerHTML = `<p class="generated-description-text">${generatedText}</p>`;
                } else {
                    descriptionElement.innerHTML = `<p class="generated-description-text" style="color: red;">Error: Could not generate description. Please try again.</p>`;
                    console.error("Gemini API response structure unexpected:", result);
                }
            } catch (error) {
                descriptionElement.innerHTML = `<p class="generated-description-text" style="color: red;">Error: Failed to connect to Gemini API. Please check your network or try again later.</p>`;
                console.error("Error calling Gemini API:", error);
            } finally {
                button.disabled = false; // Re-enable button
            }
        });
    });
    // --- End Gemini API Integration Logic ---

    // Initially show the 'about' section and start its animations on page load
    showSection('about');
});


