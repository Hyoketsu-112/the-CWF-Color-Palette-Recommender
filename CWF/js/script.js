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