<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Color Squares</title>
    <style>
        body {
            background-color: black;
            color: cyan;
            font-family: monospace;
            margin: 0;
            padding: 20px;
        }
        
        .input-area {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            background: rgba(0, 255, 255, 0.1);
            padding: 15px;
            border: 1px solid cyan;
        }
        
        .color-preview {
            width: 50px;
            height: 50px;
            border: 1px solid cyan;
            margin-right: 10px;
        }
        
        input {
            background: black;
            color: cyan;
            border: 1px solid cyan;
            padding: 10px;
            margin-right: 10px;
            font-family: monospace;
        }
        
        button {
            background: cyan;
            color: black;
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            font-family: monospace;
            text-transform: uppercase;
        }
        
        .view-controls {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .view-btn {
            background: black;
            color: cyan;
            border: 1px solid cyan;
            padding: 8px 15px;
            cursor: pointer;
            font-family: monospace;
        }
        
        .view-btn.active {
            background: cyan;
            color: black;
        }
        
        .color-grid {
            display: flex;
            flex-wrap: wrap;
        }
        
        .color-square {
            width: 50px;
            height: 50px;
            cursor: pointer;
            position: relative;
            margin: 0;
        }
        
        .color-square:hover {
            transform: scale(1.1);
            z-index: 10;
            box-shadow: 0 0 10px white;
        }
        
        .stats {
            margin-top: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="input-area">
        <div id="preview" class="color-preview"></div>
        <input type="text" id="color-code" placeholder="ENTER HEX CODE" maxlength="6">
        <button id="add-btn">ADD COLOR</button>
    </div>
    
    <div class="view-controls">
        <button class="view-btn active" data-view="grid">GRID</button>
        <button class="view-btn" data-view="spectrum">SPECTRUM</button>
    </div>
    
    <div id="color-container" class="color-grid"></div>
    
    <div class="stats">
        <span id="count">0</span> COLORS IN COLLECTIVE
    </div>
    
    <script>
        // Starting colors
        const colors = [
            "#FF0000", "#FF7F00", "#FFFF00", "#00FF00", 
            "#0000FF", "#4B0082", "#9400D3", "#FF1493",
            "#00FFFF", "#FFD700", "#32CD32", "#BA55D3",
            "#FF4500", "#2E8B57", "#D2691E", "#DC143C",
            "#00BFFF", "#FF00FF", "#1E90FF", "#F4A460"
        ];
        
        // DOM elements
        const preview = document.getElementById('preview');
        const colorInput = document.getElementById('color-code');
        const addBtn = document.getElementById('add-btn');
        const colorContainer = document.getElementById('color-container');
        const countElement = document.getElementById('count');
        const viewButtons = document.querySelectorAll('.view-btn');
        
        // Current view
        let currentView = 'grid';
        
        // Initialize
        window.onload = function() {
            renderColors();
            updateCount();
            
            // Color input preview
            colorInput.addEventListener('input', function() {
                const color = this.value;
                if (/^[0-9A-Fa-f]{6}$/i.test(color)) {
                    preview.style.backgroundColor = '#' + color;
                } else {
                    preview.style.backgroundColor = '';
                }
            });
            
            // Add color button
            addBtn.addEventListener('click', function() {
                const color = colorInput.value;
                if (/^[0-9A-Fa-f]{6}$/i.test(color)) {
                    colors.push('#' + color.toUpperCase());
                    colorInput.value = '';
                    preview.style.backgroundColor = '';
                    renderColors();
                    updateCount();
                } else {
                    alert('Please enter a valid hex code');
                }
            });
            
            // View buttons
            viewButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    viewButtons.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    currentView = this.getAttribute('data-view');
                    renderColors();
                });
            });
        };
        
        // Render colors
        function renderColors() {
            colorContainer.innerHTML = '';
            
            let displayColors = [...colors];
            
            // Sort by color for spectrum view
            if (currentView === 'spectrum') {
                displayColors.sort();
            }
            
            // Create squares
            displayColors.forEach(color => {
                const square = document.createElement('div');
                square.className = 'color-square';
                square.style.backgroundColor = color;
                square.title = color;
                
                square.addEventListener('click', function() {
                    navigator.clipboard.writeText(color.substring(1));
                    this.style.boxShadow = '0 0 15px white';
                    setTimeout(() => {
                        this.style.boxShadow = '';
                    }, 500);
                });
                
                colorContainer.appendChild(square);
            });
        }
        
        // Update count
        function updateCount() {
            countElement.textContent = colors.length;
        }
    </script>
</body>
</html>
