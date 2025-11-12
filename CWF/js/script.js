 // Color data and application state
        const colorOptions = [
            '#1E3A5F', '#2F4F2F', '#FFDB58', '#E74C3C', '#9B59B6',
            '#3498DB', '#2ECC71', '#F39C12', '#E67E22', '#1ABC9C',
            '#34495E', '#16A085', '#27AE60', '#2980B9', '#8E44AD',
            '#2C3E50', '#F1C40F', '#E74C3C', '#ECF0F1', '#95A5A6'
        ];

        let selectedColors = [];
        let colorMeanings = {};
        let colorPriority = [];

        // Initialize the form
        document.addEventListener('DOMContentLoaded', function() {
            initializeColorGrid();
        });

        function initializeColorGrid() {
            const grid = document.getElementById('color-grid');
            grid.innerHTML = '';
            
            colorOptions.forEach(color => {
                const colorElement = document.createElement('div');
                colorElement.className = 'color-option';
                colorElement.style.backgroundColor = color;
                colorElement.setAttribute('data-color', color);
                colorElement.addEventListener('click', () => toggleColorSelection(color));
                grid.appendChild(colorElement);
            });
        }

        function toggleColorSelection(color) {
            const index = selectedColors.indexOf(color);
            
            if (index === -1) {
                if (selectedColors.length < 5) {
                    selectedColors.push(color);
                    colorMeanings[color] = [];
                } else {
                    alert('Maximum 5 colors allowed. Remove one to add another.');
                    return;
                }
            } else {
                selectedColors.splice(index, 1);
                delete colorMeanings[color];
            }
            
            updateSelectedPalette();
            updateColorOptionStates();
        }

        function updateSelectedPalette() {
            const palette = document.getElementById('selected-palette');
            
            if (selectedColors.length === 0) {
                palette.innerHTML = '<p>Your selected colors will appear here...</p>';
                return;
            }
            
            palette.innerHTML = selectedColors.map(color => `
                <div class="selected-color" style="background-color: ${color}" data-color="${color}">
                    <button class="remove-color" onclick="removeColor('${color}')">×</button>
                </div>
            `).join('');
        }

        function updateColorOptionStates() {
            document.querySelectorAll('.color-option').forEach(option => {
                const color = option.getAttribute('data-color');
                if (selectedColors.includes(color)) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });
        }

        function removeColor(color) {
            const index = selectedColors.indexOf(color);
            if (index !== -1) {
                selectedColors.splice(index, 1);
                delete colorMeanings[color];
                updateSelectedPalette();
                updateColorOptionStates();
            }
        }

        function nextStep(step) {
            // Validation
            if (step === 2 && selectedColors.length < 3) {
                alert('Please select at least 3 colors to continue.');
                return;
            }
            
            if (step === 3) {
                let allHaveMeanings = true;
                selectedColors.forEach(color => {
                    if (!colorMeanings[color] || colorMeanings[color].length === 0) {
                        allHaveMeanings = false;
                    }
                });
                
                if (!allHaveMeanings) {
                    alert('Please assign at least one meaning to each color.');
                    return;
                }
                
                initializePriorityList();
            }
            
            if (step === 4) {
                generateFinalPalette();
            }
            
            // Update UI
            document.querySelectorAll('.form-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(`step-${step}`).classList.add('active');
            
            document.querySelectorAll('.progress-step').forEach(stepEl => {
                stepEl.classList.remove('active');
            });
            document.querySelector(`.progress-step[data-step="${step}"]`).classList.add('active');
            
            if (step === 2) {
                initializeMeaningSection();
            }
        }

        function prevStep(step) {
            document.querySelectorAll('.form-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(`step-${step}`).classList.add('active');
            
            document.querySelectorAll('.progress-step').forEach(stepEl => {
                stepEl.classList.remove('active');
            });
            document.querySelector(`.progress-step[data-step="${step}"]`).classList.add('active');
        }

        function initializeMeaningSection() {
            const container = document.getElementById('color-meaning-container');
            container.innerHTML = '';
            
            selectedColors.forEach(color => {
                const colorSection = document.createElement('div');
                colorSection.className = 'color-with-meaning';
                colorSection.innerHTML = `
                    <div class="color-display" style="background-color: ${color}"></div>
                    <div class="meaning-controls">
                        <h4>What does this color represent?</h4>
                        <div class="meaning-tags" id="tags-${color}">
                            ${(colorMeanings[color] || []).map(meaning => `
                                <div class="meaning-tag">
                                    ${meaning}
                                    <button class="remove-tag" onclick="removeMeaning('${color}', '${meaning}')">×</button>
                                </div>
                            `).join('')}
                        </div>
                        <input type="text" 
                               class="meaning-input" 
                               placeholder="Add a meaning..." 
                               onkeypress="handleMeaningInput(event, '${color}')">
                    </div>
                `;
                container.appendChild(colorSection);
            });
        }

        function addMeaningToCurrentColor(meaning) {
            // For simplicity, adding to first color - in real implementation would track current color
            if (selectedColors.length > 0) {
                addMeaning(selectedColors[0], meaning);
            }
        }

        function addMeaning(color, meaning) {
            if (!colorMeanings[color]) {
                colorMeanings[color] = [];
            }
            
            if (!colorMeanings[color].includes(meaning)) {
                colorMeanings[color].push(meaning);
                initializeMeaningSection();
            }
        }

        function removeMeaning(color, meaning) {
            const index = colorMeanings[color].indexOf(meaning);
            if (index !== -1) {
                colorMeanings[color].splice(index, 1);
                initializeMeaningSection();
            }
        }

        function handleMeaningInput(event, color) {
            if (event.key === 'Enter') {
                const input = event.target;
                const meaning = input.value.trim();
                
                if (meaning) {
                    addMeaning(color, meaning);
                    input.value = '';
                }
                
                event.preventDefault();
            }
        }

        function initializePriorityList() {
            colorPriority = [...selectedColors];
            const list = document.getElementById('priority-list');
            list.innerHTML = '';
            
            colorPriority.forEach((color, index) => {
                const item = document.createElement('div');
                item.className = 'priority-item';
                item.setAttribute('data-color', color);
                item.setAttribute('draggable', 'true');
                item.innerHTML = `
                    <div class="priority-handle">⋮⋮</div>
                    <div class="priority-color" style="background-color: ${color}"></div>
                    <div>
                        <strong>Color ${index + 1}</strong>
                        <div>${(colorMeanings[color] || []).join(', ')}</div>
                    </div>
                `;
                
                item.addEventListener('dragstart', handleDragStart);
                item.addEventListener('dragover', handleDragOver);
                item.addEventListener('drop', handleDrop);
                item.addEventListener('dragend', handleDragEnd);
                
                list.appendChild(item);
            });
        }

        let draggedItem = null;

        function handleDragStart(e) {
            draggedItem = this;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.innerHTML);
            this.style.opacity = '0.5';
        }

        function handleDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            return false;
        }

        function handleDrop(e) {
            e.stopPropagation();
            if (draggedItem !== this) {
                const list = this.parentNode;
                const items = Array.from(list.children);
                const fromIndex = items.indexOf(draggedItem);
                const toIndex = items.indexOf(this);
                
                if (fromIndex < toIndex) {
                    list.insertBefore(draggedItem, this.nextSibling);
                } else {
                    list.insertBefore(draggedItem, this);
                }
                
                // Update colorPriority array
                const movedColor = draggedItem.getAttribute('data-color');
                colorPriority.splice(fromIndex, 1);
                colorPriority.splice(toIndex, 0, movedColor);
            }
            return false;
        }

        function handleDragEnd(e) {
            this.style.opacity = '1';
        }

        function generateFinalPalette() {
            const palette = document.getElementById('final-palette');
            palette.innerHTML = '';
            
            colorPriority.forEach(color => {
                const colorElement = document.createElement('div');
                colorElement.className = 'palette-color';
                colorElement.style.backgroundColor = color;
                colorElement.innerHTML = `
                    <div>${color}</div>
                    <small>${(colorMeanings[color] || []).join(', ')}</small>
                `;
                palette.appendChild(colorElement);
            });
        }

        function exportPalette(format) {
            const paletteData = {
                colors: colorPriority.map(color => ({
                    hex: color,
                    meanings: colorMeanings[color] || [],
                    priority: colorPriority.indexOf(color) + 1
                })),
                generated: new Date().toISOString()
            };
            
            switch (format) {
                case 'css':
                    const cssVars = colorPriority.map((color, index) => 
                        `  --color-${index + 1}: ${color}; /* ${colorMeanings[color].join(', ')} */`
                    ).join('\n');
                    
                    const cssContent = `:root {\n${cssVars}\n}`;
                    downloadFile(cssContent, 'color-palette.css', 'text/css');
                    break;
                    
                case 'json':
                    downloadFile(
                        JSON.stringify(paletteData, null, 2),
                        'color-palette.json',
                        'application/json'
                    );
                    break;
                    
                case 'image':
                    alert('Image export would be implemented with a canvas drawing library in a real application.');
                    break;
            }
        }

        function downloadFile(content, filename, mimeType) {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        function submitPalette() {
            // In a real application, this would send data to a server
            const paletteData = {
                colors: colorPriority.map(color => ({
                    hex: color,
                    meanings: colorMeanings[color] || [],
                    priority: colorPriority.indexOf(color) + 1
                }))
            };
            
            console.log('Palette submitted:', paletteData);
            alert('Your palette has been saved! In a real application, this would be stored in our database.');
        }

         // Feedback Modal Functionality
        document.addEventListener('DOMContentLoaded', function() {
            const modal = document.getElementById('feedbackModal');
            const modalClose = document.getElementById('modalClose');
            const shareFeedbackBtn = document.getElementById('shareFeedback');
            const maybeLaterBtn = document.getElementById('maybeLater');
            const cornerFeedbackBtn = document.getElementById('cornerFeedbackBtn');
            const formUrl = 'https://forms.gle/N1RRqoK7sAw1Jrx6A';
            
            // Check if user has already seen the modal in this session
            let feedbackShown = sessionStorage.getItem('feedbackShown');
            
            // Show modal after 30 seconds if not shown before
            if (!feedbackShown) {
                setTimeout(showModal, 30000);
            }
            
            // Show modal when user tries to leave the page
            window.addEventListener('beforeunload', function(e) {
                if (!feedbackShown && !modal.classList.contains('active')) {
                    e.preventDefault();
                    e.returnValue = '';
                    showModal();
                    return '';
                }
            });
            
            // Show modal when corner button is clicked
            cornerFeedbackBtn.addEventListener('click', showModal);
            
            // Close modal when X is clicked
            modalClose.addEventListener('click', hideModal);
            
            // Close modal when "Maybe Later" is clicked
            maybeLaterBtn.addEventListener('click', function() {
                hideModal();
                sessionStorage.setItem('feedbackShown', 'true');
            });
            
            // Open feedback form when "Share Feedback" is clicked
            shareFeedbackBtn.addEventListener('click', function() {
                window.open(formUrl, '_blank');
                sessionStorage.setItem('feedbackShown', 'true');
                hideModal();
            });
            
            // Close modal when clicking outside content
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    hideModal();
                }
            });
            
            function showModal() {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            }
            
            function hideModal() {
                modal.classList.remove('active');
                document.body.style.overflow = ''; // Re-enable scrolling
            }
            
            // Add slight delay to corner button appearance
            setTimeout(() => {
                cornerFeedbackBtn.style.opacity = '1';
                cornerFeedbackBtn.style.transform = 'translateY(0)';
            }, 2000);
            
            // Initial styles for corner button animation
            cornerFeedbackBtn.style.opacity = '0';
            cornerFeedbackBtn.style.transform = 'translateY(20px)';
            cornerFeedbackBtn.style.transition = 'opacity 0.5s, transform 0.5s';
        });

        // Authentication functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check login status on page load
    updateAuthUI();
    
    // Auth modal functionality
    const authModal = document.getElementById('authModal');
    const authClose = document.getElementById('authClose');
    const authTrigger = document.getElementById('authTrigger');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const authSwitches = document.querySelectorAll('.auth-switch a');
    
    if (authTrigger) {
        authTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            showAuthModal();
        });
    }
    
    if (authClose) {
        authClose.addEventListener('click', hideAuthModal);
    }
    
    // Tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Update tabs
            authTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update forms
            authForms.forEach(form => form.classList.remove('active'));
            document.getElementById(`${tabName}-form`).classList.add('active');
        });
    });
    
    // Form switching links
    authSwitches.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetTab = this.getAttribute('data-switch');
            
            // Switch to the target tab
            authTabs.forEach(tab => {
                if (tab.getAttribute('data-tab') === targetTab) {
                    tab.click();
                }
            });
        });
    });
    
    // Form submissions
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

function showAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.style.display = 'flex';
    }
}

function hideAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.style.display = 'none';
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simple validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Check if user exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Login successful
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateAuthUI();
        hideAuthModal();
        alert('Login successful!');
        
        // Redirect if on form page after creating palette
        if (window.location.pathname.includes('form.html')) {
            const tempPalette = JSON.parse(localStorage.getItem('tempPaletteToSave'));
            if (tempPalette) {
                savePaletteToUser(user.id, tempPalette);
                localStorage.removeItem('tempPaletteToSave');
                window.location.href = 'dashboard.html';
            }
        }
    } else {
        alert('Invalid email or password');
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;
    
    // Validation
    if (!name || !email || !password || !confirm) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirm) {
        alert('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
        alert('User with this email already exists');
        return;
    }
    
    // Create new user
    const newUser = {
        id: generateUserId(),
        name: name,
        email: email,
        password: password, // In a real app, this would be hashed
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto-login
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    updateAuthUI();
    hideAuthModal();
    alert('Account created successfully!');
    
    // Redirect if on form page after creating palette
    if (window.location.pathname.includes('form.html')) {
        const tempPalette = JSON.parse(localStorage.getItem('tempPaletteToSave'));
        if (tempPalette) {
            savePaletteToUser(newUser.id, tempPalette);
            localStorage.removeItem('tempPaletteToSave');
            window.location.href = 'dashboard.html';
        }
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    updateAuthUI();
    alert('Logged out successfully');
    
    // Redirect to home if on dashboard
    if (window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'index.html';
    }
}

function updateAuthUI() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authTrigger = document.getElementById('authTrigger');
    const userDropdown = document.getElementById('userDropdown');
    const userName = document.getElementById('userName');
    
    if (currentUser) {
        // User is logged in
        if (authTrigger) {
            authTrigger.textContent = currentUser.name;
            authTrigger.style.display = 'none';
        }
        if (userName) {
            userName.textContent = currentUser.name;
        }
        if (userDropdown) {
            userDropdown.style.display = 'block';
        }
    } else {
        // User is not logged in
        if (authTrigger) {
            authTrigger.textContent = 'Login';
            authTrigger.style.display = 'block';
        }
        if (userDropdown) {
            userDropdown.style.display = 'none';
        }
    }
}

function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

// Add these functions to script.js
function savePaletteToUser(userId, paletteData) {
    const userPalettes = JSON.parse(localStorage.getItem('userPalettes') || '{}');
    
    if (!userPalettes[userId]) {
        userPalettes[userId] = [];
    }
    
    const paletteWithId = {
        id: generatePaletteId(),
        ...paletteData,
        createdAt: new Date().toISOString(),
        favorite: false
    };
    
    userPalettes[userId].push(paletteWithId);
    localStorage.setItem('userPalettes', JSON.stringify(userPalettes));
    return paletteWithId;
}

function generatePaletteId() {
    return 'palette_' + Math.random().toString(36).substr(2, 9);
}

// Update the submitPalette function to work with user accounts
function submitPalette() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const paletteData = {
        colors: colorPriority.map(color => ({
            hex: color,
            meanings: colorMeanings[color] || [],
            priority: colorPriority.indexOf(color) + 1
        })),
        name: prompt("Give your palette a name:", "My Color Palette") || "Untitled Palette"
    };
    
    if (currentUser) {
        // User is logged in - save to their account
        const savedPalette = savePaletteToUser(currentUser.id, paletteData);
        alert('Your palette has been saved to your account!');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        // User is not logged in - prompt to login or save temporarily
        const saveChoice = confirm('Would you like to create an account to save this palette? Click OK to register or Cancel to download it now.');
        
        if (saveChoice) {
            // Save palette temporarily and redirect to auth
            localStorage.setItem('tempPaletteToSave', JSON.stringify(paletteData));
            showAuthModal();
        } else {
            // Just download the palette
            exportPalette('json');
            alert('Palette downloaded. Create an account to save and manage your palettes!');
        }
    }
}

// On page load, check for temp palette to save
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and update UI accordingly
    updateAuthUI();
    
    // If user has a temporary palette to save, notify them
    const tempPalette = localStorage.getItem('tempPaletteToSave');
    if (tempPalette) {
        console.log('Temporary palette found - user can save after form completion');
    }
});

// Add to script.js for enhanced features
function toggleFavorite(paletteId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const userPalettes = JSON.parse(localStorage.getItem('userPalettes') || '{}');
    const palette = userPalettes[currentUser.id].find(p => p.id === paletteId);
    
    if (palette) {
        palette.favorite = !palette.favorite;
        localStorage.setItem('userPalettes', JSON.stringify(userPalettes));
        loadUserPalettes(currentUser.id); // Refresh display
    }
}

function deletePalette(paletteId) {
    if (confirm('Are you sure you want to delete this palette?')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const userPalettes = JSON.parse(localStorage.getItem('userPalettes') || '{}');
        
        userPalettes[currentUser.id] = userPalettes[currentUser.id].filter(p => p.id !== paletteId);
        localStorage.setItem('userPalettes', JSON.stringify(userPalettes));
        loadUserPalettes(currentUser.id);
    }
}

// Add to your script.js - User dropdown functionality
function setupUserDropdown() {
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userName && userDropdown) {
        userName.addEventListener('click', function(e) {
            e.preventDefault();
            userDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userMenu.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }
}

// Call this function in your DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
    // ... your existing code
    setupUserDropdown();
});
