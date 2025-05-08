// White at center, full color at edge
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, hslToHex(angle, 70, 50));
        gradient.addColorStop(1, hslToHex(angle, 100, 50));
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        ctx.fillStyle = gradient;
        ctx.fill();
    }
    
    // Draw rings for saturation levels
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    
    for (let i = 1; i <= 5; i++) {
        const ringRadius = radius * (i / 5);
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Draw angle lines
    for (let angle = 0; angle < 360; angle += 30) {
        const radian = angle * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(radian) * radius,
            centerY + Math.sin(radian) * radius
        );
        ctx.stroke();
        
        // Add angle label
        const labelRadius = radius + 15;
        const labelX = centerX + Math.cos(radian) * labelRadius;
        const labelY = centerY + Math.sin(radian) * labelRadius;
        
        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${angle}°`, labelX, labelY);
    }
    
    // Highlight collection colors on wheel
    if (colors.length > 0) {
        colors.forEach(color => {
            const hue = getHue(color.hex);
            const sat = getSaturation(color.hex) / 100;
            const light = getLightness(color.hex) / 100;
            
            // Only plot colors with reasonable saturation and lightness
            if (sat > 0.1 && light > 0.1 && light < 0.9) {
                const radian = hue * Math.PI / 180;
                const distance = sat * radius;
                
                const x = centerX + Math.cos(radian) * distance;
                const y = centerY + Math.sin(radian) * distance;
                
                // Draw dot
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, Math.PI * 2);
                ctx.fillStyle = color.hex;
                ctx.fill();
                
                // Draw border
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });
    }
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Add legend
    ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    ctx.fillText('• Center: White', 10, 10);
    ctx.fillText('• Outer Edge: Full Saturation', 10, 30);
    ctx.fillText('• Dots: Your Collection Colors', 10, 50);
}

// Create content for Color Mixer
function createColorMixerContent() {
    const container = document.createElement('div');
    
    // Header
    const header = document.createElement('div');
    header.className = 'theory-header';
    header.innerHTML = `
        <h2 class="theory-title">Color Mixer</h2>
        <p class="theory-description">
            Mix colors from your collection to see how they blend together. Select two colors and adjust the blend ratio to create new colors.
            This tool helps you understand color relationships and create custom palettes.
        </p>
    `;
    container.appendChild(header);
    
    // Check if we have enough colors
    if (colors.length < 2) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'Add at least two colors to your collection to use the color mixer';
        container.appendChild(emptyMessage);
        return container;
    }
    
    // Mixer container
    const mixerContainer = document.createElement('div');
    mixerContainer.className = 'color-mixer';
    
    // Controls column
    const controlsCol = document.createElement('div');
    controlsCol.className = 'mixer-controls';
    
    // Color selection
    const colorSelection = document.createElement('div');
    colorSelection.className = 'mixer-color-selection';
    controlsCol.appendChild(colorSelection);
    
    // First color row
    const color1Row = document.createElement('div');
    color1Row.innerHTML = `<div style="margin-bottom: 10px;">Color 1:</div>`;
    const color1Boxes = document.createElement('div');
    color1Boxes.style.display = 'flex';
    color1Boxes.style.flexWrap = 'wrap';
    color1Boxes.style.gap = '5px';
    color1Boxes.style.marginBottom = '15px';
    
    // Add color boxes for selection
    colors.slice(0, 12).forEach((color, index) => {
        const colorBox = document.createElement('div');
        colorBox.className = 'mixer-color-box';
        colorBox.setAttribute('data-index', index);
        colorBox.style.backgroundColor = color.hex;
        
        if (index === 0) {
            colorBox.classList.add('selected');
            colorBox.setAttribute('data-selected', 'color1');
        }
        
        color1Boxes.appendChild(colorBox);
    });
    
    color1Row.appendChild(color1Boxes);
    controlsCol.appendChild(color1Row);
    
    // Second color row
    const color2Row = document.createElement('div');
    color2Row.innerHTML = `<div style="margin-bottom: 10px;">Color 2:</div>`;
    const color2Boxes = document.createElement('div');
    color2Boxes.style.display = 'flex';
    color2Boxes.style.flexWrap = 'wrap';
    color2Boxes.style.gap = '5px';
    color2Boxes.style.marginBottom = '15px';
    
    // Add color boxes for selection
    colors.slice(0, 12).forEach((color, index) => {
        const colorBox = document.createElement('div');
        colorBox.className = 'mixer-color-box';
        colorBox.setAttribute('data-index', index);
        colorBox.style.backgroundColor = color.hex;
        
        if (index === 1) {
            colorBox.classList.add('selected');
            colorBox.setAttribute('data-selected', 'color2');
        }
        
        color2Boxes.appendChild(colorBox);
    });
    
    color2Row.appendChild(color2Boxes);
    controlsCol.appendChild(color2Row);
    
    // Blend ratio slider
    const blendControl = document.createElement('div');
    blendControl.className = 'mixer-slider';
    blendControl.innerHTML = `
        <label class="mixer-slider-label">Blend Ratio: <span id="blend-value">50%</span></label>
        <input type="range" id="blend-slider" class="mixer-slider-input" min="0" max="100" value="50">
    `;
    controlsCol.appendChild(blendControl);
    
    // Result column
    const resultCol = document.createElement('div');
    resultCol.className = 'mixer-result';
    
    // Result color display
    const resultColor = document.createElement('div');
    resultColor.className = 'mixer-result-color';
    resultColor.id = 'result-color';
    
    // Result info
    const resultInfo = document.createElement('div');
    resultInfo.className = 'mixer-result-info';
    resultInfo.id = 'result-info';
    
    resultCol.appendChild(resultColor);
    resultCol.appendChild(resultInfo);
    
    // Add columns to mixer
    mixerContainer.appendChild(controlsCol);
    mixerContainer.appendChild(resultCol);
    
    container.appendChild(mixerContainer);
    
    // Add script for mixer functionality
    setTimeout(() => {
        // Get elements
        const blendSlider = document.getElementById('blend-slider');
        const blendValue = document.getElementById('blend-value');
        const resultColorEl = document.getElementById('result-color');
        const resultInfoEl = document.getElementById('result-info');
        
        // Get initial selected colors
        let color1 = colors[0];
        let color2 = colors[1];
        
        // Add click events to color boxes
        const colorBoxes = document.querySelectorAll('.mixer-color-box');
        colorBoxes.forEach(box => {
            box.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                const colorData = colors[index];
                
                // Check if it's already selected
                const alreadySelected = this.hasAttribute('data-selected');
                const whichColor = this.getAttribute('data-selected');
                
                // Deselect all in this group
                const group = alreadySelected ? 
                    document.querySelectorAll(`[data-selected="${whichColor}"]`) :
                    document.querySelectorAll(`[data-selected="color1"]`);
                
                group.forEach(b => {
                    b.classList.remove('selected');
                    b.removeAttribute('data-selected');
                });
                
                // Select this one
                this.classList.add('selected');
                this.setAttribute('data-selected', alreadySelected ? whichColor : 'color1');
                
                // Update color variables
                if (alreadySelected) {
                    if (whichColor === 'color1') {
                        color1 = colorData;
                    } else {
                        color2 = colorData;
                    }
                } else {
                    color1 = colorData;
                }
                
                // Update mixed color
                updateMixedColor();
            });
        });
        
        // Update blend value and mixed color when slider changes
        blendSlider.addEventListener('input', function() {
            blendValue.textContent = this.value + '%';
            updateMixedColor();
        });
        
        // Function to update mixed color
        function updateMixedColor() {
            const ratio = parseInt(blendSlider.value) / 100;
            
            // Get RGB values of both colors
            const rgb1 = hexToRgb(color1.hex);
            const rgb2 = hexToRgb(color2.hex);
            
            // Mix colors using linear interpolation
            const mixedRgb = {
                r: Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio),
                g: Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio),
                b: Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio)
            };
            
            // Convert back to hex
            const mixedHex = rgbToHex(mixedRgb.r, mixedRgb.g, mixedRgb.b);
            
            // Update result color display
            resultColorEl.style.backgroundColor = mixedHex;
            
            // Update info text
            resultInfoEl.innerHTML = `
                <div>${mixedHex}</div>
                <div>${getBasicColorName(mixedHex)}</div>
                <div>${color1.name || getBasicColorName(color1.hex)} (${Math.round(100 - ratio * 100)}%) + ${color2.name || getBasicColorName(color2.hex)} (${Math.round(ratio * 100)}%)</div>
            `;
        }
        
        // Initial update
        updateMixedColor();
    }, 200);
    
    return container;
}

// Create content for Color Systems
function createColorSystemsContent() {
    const container = document.createElement('div');
    
    // Header
    const header = document.createElement('div');
    header.className = 'theory-header';
    header.innerHTML = `
        <h2 class="theory-title">Color Systems</h2>
        <p class="theory-description">
            Color can be represented in different systems, each with its own strengths and applications.
            Understanding these systems helps you work with color more effectively in different contexts.
        </p>
    `;
    container.appendChild(header);
    
    // Create sections for different color systems
    const systemsData = [
        {
            name: 'RGB (Red, Green, Blue)',
            description: 'Additive color model used in digital displays. Colors are created by mixing red, green, and blue light at different intensities.',
            example: function(color) {
                const rgb = hexToRgb(color);
                return `R: ${rgb.r}, G: ${rgb.g}, B: ${rgb.b}`;
            }
        },
        {
            name: 'HSL (Hue, Saturation, Lightness)',
            description: 'A more intuitive way to describe colors. Hue is the color type (red, blue, etc.), saturation is the intensity, and lightness goes from black to white.',
            example: function(color) {
                const h = getHue(color);
                const s = getSaturation(color);
                const l = getLightness(color);
                return `H: ${Math.round(h)}°, S: ${Math.round(s)}%, L: ${Math.round(l)}%`;
            }
        },
        {
            name: 'HEX (Hexadecimal)',
            description: 'A way to represent RGB colors as a 6-digit hexadecimal number. Widely used in web design and CSS.',
            example: function(color) {
                return color;
            }
        },
        {
            name: 'CMYK (Cyan, Magenta, Yellow, Key/Black)',
            description: 'Subtractive color model used in printing. Colors are created by mixing cyan, magenta, yellow, and black inks.',
            example: function(color) {
                const rgb = hexToRgb(color);
                const r = rgb.r / 255;
                const g = rgb.g / 255;
                const b = rgb.b / 255;
                
                const k = 1 - Math.max(r, g, b);
                const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
                const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
                const y = k === 1 ? 0 : (1 - b - k) / (1 - k);
                
                return `C: ${Math.round(c * 100)}%, M: ${Math.round(m * 100)}%, Y: ${Math.round(y * 100)}%, K: ${Math.round(k * 100)}%`;
            }
        }
    ];
    
    // Sample color for examples
    const sampleColor = colors.length > 0 ? colors[0].hex : '#FF0000';
    
    // Create system sections
    systemsData.forEach(system => {
        const section = document.createElement('div');
        section.className = 'theory-section';
        
        section.innerHTML = `
            <h3 class="theory-section-title">${system.name}</h3>
            <p class="theory-description">${system.description}</p>
            <div class="theory-example" style="margin-top: 15px; display: flex; align-items: center;">
                <div style="width: 40px; height: 40px; background-color: ${sampleColor}; border-radius: 5px; margin-right: 15px; border: 1px solid rgba(255,255,255,0.3);"></div>
                <div>Example: <code>${system.example(sampleColor)}</code></div>
            </div>
        `;
        
        container.appendChild(section);
    });
    
    // Color conversion calculator
    if (colors.length > 0) {
        const calculatorSection = document.createElement('div');
        calculatorSection.className = 'theory-section';
        calculatorSection.innerHTML = `
            <h3 class="theory-section-title">Your Colors in Different Systems</h3>
            <p class="theory-description">See your collection colors represented in different color systems.</p>
            <div id="systems-collection" style="margin-top: 15px;"></div>
        `;
        
        container.appendChild(calculatorSection);
        
        // Add script to populate collection colors in different systems
        setTimeout(() => {
            const collectionEl = document.getElementById('systems-collection');
            
            // Create table for color systems
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.border = '1px solid rgba(0, 255, 255, 0.3)';
            table.style.marginTop = '15px';
            
            // Create header row
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th style="padding: 8px; text-align: left; border-bottom: 1px solid rgba(0, 255, 255, 0.3);">Color</th>
                    <th style="padding: 8px; text-align: left; border-bottom: 1px solid rgba(0, 255, 255, 0.3);">HEX</th>
                    <th style="padding: 8px; text-align: left; border-bottom: 1px solid rgba(0, 255, 255, 0.3);">RGB</th>
                    <th style="padding: 8px; text-align: left; border-bottom: 1px solid rgba(0, 255, 255, 0.3);">HSL</th>
                    <th style="padding: 8px; text-align: left; border-bottom: 1px solid rgba(0, 255, 255, 0.3);">CMYK</th>
                </tr>
            `;
            table.appendChild(thead);
            
            // Create body rows for each color
            const tbody = document.createElement('tbody');
            
            // Get sample of colors (up to 10)
            const colorSample = colors.slice(0, 10);
            
            colorSample.forEach(color => {
                const row = document.createElement('tr');
                
                // Color swatch cell
                const swatchCell = document.createElement('td');
                swatchCell.style.padding = '8px';
                swatchCell.style.border = '1px solid rgba(0, 255, 255, 0.1)';
                
                const swatch = document.createElement('div');
                swatch.style.width = '30px';
                swatch.style.height = '30px';
                swatch.style.backgroundColor = color.hex;
                swatch.style.borderRadius = '5px';
                swatch.style.border = '1px solid rgba(255,255,255,0.3)';
                
                swatchCell.appendChild(swatch);
                row.appendChild(swatchCell);
                
                // HEX cell
                const hexCell = document.createElement('td');
                hexCell.style.padding = '8px';
                hexCell.style.border = '1px solid rgba(0, 255, 255, 0.1)';
                hexCell.textContent = color.hex;
                row.appendChild(hexCell);
                
                // RGB cell
                const rgbCell = document.createElement('td');
                rgbCell.style.padding = '8px';
                rgbCell.style.border = '1px solid rgba(0, 255, 255, 0.1)';
                
                const rgb = hexToRgb(color.hex);
                rgbCell.textContent = `R: ${rgb.r}, G: ${rgb.g}, B: ${rgb.b}`;
                row.appendChild(rgbCell);
                
                // HSL cell
                const hslCell = document.createElement('td');
                hslCell.style.padding = '8px';
                hslCell.style.border = '1px solid rgba(0, 255, 255, 0.1)';
                
                const h = getHue(color.hex);
                const s = getSaturation(color.hex);
                const l = getLightness(color.hex);
                hslCell.textContent = `H: ${Math.round(h)}°, S: ${Math.round(s)}%, L: ${Math.round(l)}%`;
                row.appendChild(hslCell);
                
                // CMYK cell
                const cmykCell = document.createElement('td');
                cmykCell.style.padding = '8px';
                cmykCell.style.border = '1px solid rgba(0, 255, 255, 0.1)';
                
                const r = rgb.r / 255;
                const g = rgb.g / 255;
                const b = rgb.b / 255;
                
                const k = 1 - Math.max(r, g, b);
                const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
                const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
                const y = k === 1 ? 0 : (1 - b - k) / (1 - k);
                
                cmykCell.textContent = `C: ${Math.round(c * 100)}%, M: ${Math.round(m * 100)}%, Y: ${Math.round(y * 100)}%, K: ${Math.round(k * 100)}%`;
                row.appendChild(cmykCell);
                
                tbody.appendChild(row);
            });
            
            table.appendChild(tbody);
            collectionEl.appendChild(table);
        }, 200);
    }
    
    return container;
}

// Format date (e.g., "Jan 1")
function formatDate(date) {
    try {
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    } catch (e) {
        console.error('Error formatting date:', e, date);
        return 'Unknown date';
    }
}
    // Load CSS
        const linkEl = document.createElement('link');
        linkEl.rel = 'stylesheet';
        linkEl.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
        document.head.appendChild(linkEl);
        
        // Load JavaScript
        const scriptEl = document.createElement('script');
        scriptEl.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
        document.head.appendChild(scriptEl);
        
        scriptEl.onload = () => resolve();
        scriptEl.onerror = () => reject(new Error('Failed to load Leaflet.js'));
    });
}

// Render Map View
function renderMapView() {
    // Create map container
    const mapContainer = document.createElement('div');
    mapContainer.className = 'map-container';
    
    // Add loading message
    const loadingEl = document.createElement('div');
    loadingEl.className = 'map-loading';
    loadingEl.textContent = 'Loading map...';
    mapContainer.appendChild(loadingEl);
    
    viewContainer.appendChild(mapContainer);
    
    // Load Leaflet if not already loaded
    const initMap = () => {
        if (!window.L) {
            loadLeafletJS().then(() => {
                initializeMap(mapContainer);
            }).catch(error => {
                console.error('Error loading Leaflet:', error);
                loadingEl.textContent = 'Error loading map. Please try again.';
            });
        } else {
            initializeMap(mapContainer);
        }
    };
    
    // Initialize map
    initMap();
}

// Initialize the map with color locations
function initializeMap(container) {
    // Remove loading message
    container.innerHTML = '';
    
    // Create map with dark theme
    colorMap = L.map(container, {
        center: [41.8240, -71.4128], // Default to Providence, RI
        zoom: 13,
        attributionControl: false
    });
    
    // Add dark theme tiles
    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://carto.com/attribution">CARTO</a>'
    }).addTo(colorMap);
    
    // Add attribution in our theme
    const attribution = L.control.attribution({
        prefix: false
    }).addTo(colorMap);
    attribution.addAttribution('&copy; <a href="https://carto.com/attribution">CARTO</a> | <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>');
    
    // Add markers for all colors with location data
    const markers = [];
    colors.forEach(color => {
        if (color.location && color.location.latitude && color.location.longitude) {
            // Create custom icon with color
            const icon = L.divIcon({
                className: 'leaflet-custom-marker',
                html: `<div style="background-color: ${color.hex}; width: 100%; height: 100%; border-radius: 50%; border: 1px solid white;"></div>`,
                iconSize: [15, 15]
            });
            
            // Create marker
            const marker = L.marker([color.location.latitude, color.location.longitude], {
                icon: icon,
                title: color.name || getBasicColorName(color.hex)
            }).addTo(colorMap);
            
            // Create popup with color info
            const popupContent = `
                <div>
                    <div class="map-color-swatch" style="background-color: ${color.hex};"></div>
                    <div class="map-color-info">
                        <div><strong>${color.name || getBasicColorName(color.hex)}</strong></div>
                        <div>${color.hex}</div>
                        <div>Added: ${new Date(color.dateAdded).toLocaleDateString()}</div>
                        <div>Emotional proximity: ${formatProximity(color.proximity)}</div>
                    </div>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            
            // Store marker for later reference
            markers.push({
                marker: marker,
                color: color
            });
            
            // Add click event to show color detail
            marker.on('click', () => {
                setTimeout(() => {
                    const swatch = document.querySelector('.map-color-swatch');
                    if (swatch) {
                        swatch.addEventListener('click', () => {
                            createColorDetailModal(color);
                        });
                    }
                }, 100);
            });
        }
    });
    
    // If no markers, show message and center map on default location
    if (markers.length === 0) {
        const noDataMessage = document.createElement('div');
        noDataMessage.className = 'map-no-data';
        noDataMessage.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(0, 0, 0, 0.7); padding: 20px; border-radius: 10px; color: cyan; text-align: center; z-index: 1000; border: 1px solid rgba(0, 255, 255, 0.3);">
                <p>No location data available for any colors yet.</p>
                <p>Add new colors with location to see them on the map.</p>
            </div>
        `;
        container.appendChild(noDataMessage);
    } else {
        // Create bounds from all markers and fit map to these bounds
        const bounds = L.latLngBounds(markers.map(m => m.marker.getLatLng()));
        colorMap.fitBounds(bounds, { padding: [50, 50] });
    }
    
    // Add legend for proximity
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'proximity-legend');
        div.innerHTML = `
            <div style="margin-bottom: 10px;"><strong>Emotional Proximity</strong></div>
            <div class="proximity-legend-item">
                <div class="proximity-legend-color" style="background-color: rgba(255, 255, 255, 0.8);"></div>
                <span>Very Close</span>
            </div>
            <div class="proximity-legend-item">
                <div class="proximity-legend-color" style="background-color: rgba(255, 255, 255, 0.6);"></div>
                <span>Somewhat Close</span>
            </div>
            <div class="proximity-legend-item">
                <div class="proximity-legend-color" style="background-color: rgba(255, 255, 255, 0.4);"></div>
                <span>Neutral</span>
            </div>
            <div class="proximity-legend-item">
                <div class="proximity-legend-color" style="background-color: rgba(255, 255, 255, 0.3);"></div>
                <span>Somewhat Distant</span>
            </div>
            <div class="proximity-legend-item">
                <div class="proximity-legend-color" style="background-color: rgba(255, 255, 255, 0.2);"></div>
                <span>Very Distant</span>
            </div>
        `;
        return div;
    };
    legend.addTo(colorMap);
    
    // Map is now initialized
    mapInitialized = true;
}

// Format proximity text
function formatProximity(proximity) {
    switch(proximity) {
        case 'very-close': return 'Very close';
        case 'somewhat-close': return 'Somewhat close';
        case 'neutral': return 'Neutral';
        case 'somewhat-distant': return 'Somewhat distant';
        case 'very-distant': return 'Very distant';
        default: return 'Unknown';
    }
}

// Focus map on a specific color's location
function focusMapOnColor(color) {
    if (!mapInitialized || !colorMap) return;
    
    if (color.location && color.location.latitude && color.location.longitude) {
        colorMap.setView([color.location.latitude, color.location.longitude], 16);
        
        // Find and open popup for this color
        colorMap.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                const latLng = layer.getLatLng();
                if (latLng.lat === color.location.latitude && latLng.lng === color.location.longitude) {
                    layer.openPopup();
                }
            }
        });
    }
}

// Render enhanced Color Theory View
function renderColorTheoryView() {
    const theoryContainer = document.createElement('div');
    theoryContainer.className = 'color-theory-container';
    
    // Create tabs for different color theory topics
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'theory-tabs';
    tabsContainer.innerHTML = `
        <button class="theory-tab active" data-tab="harmonies">Color Harmonies</button>
        <button class="theory-tab" data-tab="psychology">Color Psychology</button>
        <button class="theory-tab" data-tab="wheel">Color Wheel</button>
        <button class="theory-tab" data-tab="mixer">Color Mixer</button>
        <button class="theory-tab" data-tab="systems">Color Systems</button>
    `;
    theoryContainer.appendChild(tabsContainer);
    
    // Create content containers for each tab
    const harmoniesContent = createHarmoniesContent();
    harmoniesContent.className = 'theory-content active';
    harmoniesContent.id = 'harmonies-content';
    
    const psychologyContent = createPsychologyContent();
    psychologyContent.className = 'theory-content';
    psychologyContent.id = 'psychology-content';
    
    const wheelContent = createColorWheelContent();
    wheelContent.className = 'theory-content';
    wheelContent.id = 'wheel-content';
    
    const mixerContent = createColorMixerContent();
    mixerContent.className = 'theory-content';
    mixerContent.id = 'mixer-content';
    
    const systemsContent = createColorSystemsContent();
    systemsContent.className = 'theory-content';
    systemsContent.id = 'systems-content';
    
    // Add content containers to main container
    theoryContainer.appendChild(harmoniesContent);
    theoryContainer.appendChild(psychologyContent);
    theoryContainer.appendChild(wheelContent);
    theoryContainer.appendChild(mixerContent);
    theoryContainer.appendChild(systemsContent);
    
    // Add tab switching logic
    setTimeout(() => {
        const tabs = document.querySelectorAll('.theory-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Deactivate all tabs and contents
                tabs.forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.theory-content').forEach(c => c.classList.remove('active'));
                
                // Activate clicked tab and corresponding content
                tab.classList.add('active');
                const contentId = tab.getAttribute('data-tab') + '-content';
                document.getElementById(contentId).classList.add('active');
            });
        });
    }, 100);
    
    viewContainer.appendChild(theoryContainer);
}

// Create content for Color Harmonies tab
function createHarmoniesContent() {
    const container = document.createElement('div');
    
    // Header
    const header = document.createElement('div');
    header.className = 'theory-header';
    header.innerHTML = `
        <h2 class="theory-title">Color Harmonies</h2>
        <p class="theory-description">
            Color harmonies are combinations of colors based on their positions on the color wheel.
            These relationships create different visual effects and emotional responses.
            Explore how your colors can be combined using these classical harmony principles.
        </p>
    `;
    container.appendChild(header);
    
    // Create sections for each harmony type
    if (colors.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'Add colors to your collection to see color harmony examples';
        container.appendChild(emptyMessage);
        return container;
    }
    
    // Get up to 5 colors to use as examples
    const sampleColors = colors.slice(0, Math.min(colors.length, 5));
    
    // Complementary
    const complementarySection = createHarmonySection(
        'Complementary Colors',
        'Colors directly opposite each other on the color wheel. They create maximum contrast and vibrance.',
        sampleColors,
        getComplementaryColors
    );
    container.appendChild(complementarySection);
    
    // Analogous
    const analogousSection = createHarmonySection(
        'Analogous Colors',
        'Colors adjacent to each other on the color wheel. They create harmonious, serene combinations.',
        sampleColors,
        getAnalogousColors
    );
    container.appendChild(analogousSection);
    
    // Triadic
    const triadicSection = createHarmonySection(
        'Triadic Colors',
        'Three colors equally spaced around the color wheel. They create a balanced, vibrant combination.',
        sampleColors,
        getTriadicColors
    );
    container.appendChild(triadicSection);
    
    // Split Complementary
    const splitSection = createHarmonySection(
        'Split Complementary',
        'A base color plus two colors adjacent to its complement. Creates high contrast with less tension than complementary.',
        sampleColors,
        getSplitComplementaryColors
    );
    container.appendChild(splitSection);
    
    // Monochromatic
    const monoSection = createHarmonySection(
        'Monochromatic',
        'Different shades, tints, and tones of a single color. Creates a cohesive, elegant look.',
        sampleColors,
        getMonochromaticColors
    );
    container.appendChild(monoSection);
    
    return container;
}

// Create a harmony section with examples
function createHarmonySection(title, description, baseColors, harmoniesFunc) {
    const section = document.createElement('div');
    section.className = 'theory-section';
    
    // Title and description
    const sectionTitle = document.createElement('h3');
    sectionTitle.className = 'theory-section-title';
    sectionTitle.textContent = title;
    
    const sectionDesc = document.createElement('p');
    sectionDesc.className = 'theory-description';
    sectionDesc.textContent = description;
    
    section.appendChild(sectionTitle);
    section.appendChild(sectionDesc);
    
    // Color combinations
    const combinations = document.createElement('div');
    combinations.className = 'color-combinations';
    
    baseColors.forEach(color => {
        const relatedColors = harmoniesFunc(color.hex);
        
        // Create combination
        const combo = document.createElement('div');
        combo.className = 'color-combination';
        
        // Color stripe
        const colorStripe = document.createElement('div');
        colorStripe.className = 'combination-colors';
        
        // Base color
        const baseColorEl = document.createElement('div');
        baseColorEl.className = 'combination-color';
        baseColorEl.style.backgroundColor = color.hex;
        colorStripe.appendChild(baseColorEl);
        
        // Related colors
        relatedColors.forEach(relatedHex => {
            const relatedColorEl = document.createElement('div');
            relatedColorEl.className = 'combination-color';
            relatedColorEl.style.backgroundColor = relatedHex;
            colorStripe.appendChild(relatedColorEl);
        });
        
        // Info
        const infoEl = document.createElement('div');
        infoEl.className = 'combination-info';
        infoEl.textContent = `${getBasicColorName(color.hex)} with ${title}`;
        
        combo.appendChild(colorStripe);
        combo.appendChild(infoEl);
        combinations.appendChild(combo);
    });
    
    section.appendChild(combinations);
    return section;
}

// Get complementary color
function getComplementaryColors(baseHex) {
    const hue = getHue(baseHex);
    const complementaryHue = (hue + 180) % 360;
    return [getColorFromHue(complementaryHue)];
}

// Get analogous colors
function getAnalogousColors(baseHex) {
    const hue = getHue(baseHex);
    const hue1 = (hue + 30) % 360;
    const hue2 = (hue + 330) % 360;
    return [getColorFromHue(hue1), getColorFromHue(hue2)];
}

// Get triadic colors
function getTriadicColors(baseHex) {
    const hue = getHue(baseHex);
    const hue1 = (hue + 120) % 360;
    const hue2 = (hue + 240) % 360;
    return [getColorFromHue(hue1), getColorFromHue(hue2)];
}

// Get split complementary colors
function getSplitComplementaryColors(baseHex) {
    const hue = getHue(baseHex);
    const complementaryHue = (hue + 180) % 360;
    const hue1 = (complementaryHue + 30) % 360;
    const hue2 = (complementaryHue + 330) % 360;
    return [getColorFromHue(hue1), getColorFromHue(hue2)];
}

// Get monochromatic colors
function getMonochromaticColors(baseHex) {
    const hue = getHue(baseHex);
    const sat = getSaturation(baseHex);
    const light = getLightness(baseHex);
    
    // Create lighter and darker versions
    const lighter = hslToHex(hue, Math.min(sat, 100), Math.min(light + 30, 100));
    const darker = hslToHex(hue, Math.min(sat, 100), Math.max(light - 30, 0));
    
    return [lighter, darker];
}

// Create a color from a hue value
function getColorFromHue(hue) {
    return hslToHex(hue, 70, 50);
}

// Convert HSL to hex
function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// Create content for Color Psychology tab
function createPsychologyContent() {
    const container = document.createElement('div');
    
    // Header
    const header = document.createElement('div');
    header.className = 'theory-header';
    header.innerHTML = `
        <h2 class="theory-title">Color Psychology</h2>
        <p class="theory-description">
            Colors evoke emotional and psychological responses. Understanding these associations can help you use color more effectively in your projects.
            Each culture may interpret colors differently, but there are some common associations in Western culture.
        </p>
    `;
    container.appendChild(header);
    
    // Psychology grid
    const psychologyGrid = document.createElement('div');
    psychologyGrid.className = 'psychology-grid';
    
    // Color psychology data
    const psychologyData = [
        { 
            name: 'Red', 
            hex: '#FF0000', 
            meaning: 'Passion, energy, danger, excitement, urgency, attention-grabbing' 
        },
        { 
            name: 'Orange', 
            hex: '#FF7F00', 
            meaning: 'Creativity, enthusiasm, warmth, playfulness, affordability, approachable' 
        },
        { 
            name: 'Yellow', 
            hex: '#FFFF00', 
            meaning: 'Optimism, happiness, caution, clarity, warmth, intellect' 
        },
        { 
            name: 'Green', 
            hex: '#00FF00', 
            meaning: 'Growth, nature, renewal, wealth, health, balance, harmony' 
        },
        { 
            name: 'Blue', 
            hex: '#0000FF', 
            meaning: 'Trust, calm, dependability, peace, logic, security, sadness' 
        },
        { 
            name: 'Purple', 
            hex: '#800080', 
            meaning: 'Luxury, mystery, spirituality, imagination, wisdom, royalty' 
        },
        { 
            name: 'Pink', 
            hex: '#FFC0CB', 
            meaning: 'Gentleness, romance, playfulness, femininity, nurturing' 
        },
        { 
            name: 'Brown', 
            hex: '#964B00', 
            meaning: 'Reliability, stability, earthiness, comfort, security, tradition' 
        },
        { 
            name: 'Black', 
            hex: '#000000', 
            meaning: 'Power, elegance, formality, death, evil, mystery, sophistication' 
        },
        { 
            name: 'White', 
            hex: '#FFFFFF', 
            meaning: 'Purity, cleanliness, simplicity, innocence, minimalism, sterility' 
        },
        { 
            name: 'Gray', 
            hex: '#808080', 
            meaning: 'Neutrality, formality, sophistication, reliability, practicality' 
        },
        { 
            name: 'Teal', 
            hex: '#008080', 
            meaning: 'Balance, rejuvenation, sophistication, calm, depth, clarity' 
        }
    ];
    
    // Create psychology items
    psychologyData.forEach(color => {
        const item = document.createElement('div');
        item.className = 'psychology-item';
        
        const colorSwatch = document.createElement('div');
        colorSwatch.className = 'psychology-color';
        colorSwatch.style.backgroundColor = color.hex;
        
        const info = document.createElement('div');
        info.className = 'psychology-info';
        info.innerHTML = `
            <div class="psychology-name">${color.name}</div>
            <div class="psychology-meaning">${color.meaning}</div>
        `;
        
        item.appendChild(colorSwatch);
        item.appendChild(info);
        psychologyGrid.appendChild(item);
    });
    
    container.appendChild(psychologyGrid);
    
    // Show your collection's psychological impact
    if (colors.length > 0) {
        const collectionSection = document.createElement('div');
        collectionSection.className = 'theory-section color-psychology';
        
        const sectionTitle = document.createElement('h3');
        sectionTitle.className = 'theory-section-title';
        sectionTitle.textContent = 'Your Collection\'s Psychological Impact';
        
        const description = document.createElement('p');
        description.className = 'theory-description';
        description.textContent = 'Based on the dominant colors in your collection, here are the potential psychological effects:';
        
        collectionSection.appendChild(sectionTitle);
        collectionSection.appendChild(description);
        
        // Analyze collection's dominant hues
        const hueGroups = analyzeCollectionHues();
        const dominantSection = document.createElement('div');
        
        if (Object.keys(hueGroups).length > 0) {
            // Create list of dominant colors and their meanings
            const dominantList = document.createElement('ul');
            dominantList.style.listStyleType = 'none';
            dominantList.style.padding = '0';
            dominantList.style.marginTop = '15px';
            
            Object.entries(hueGroups).sort((a, b) => b[1].count - a[1].count).forEach(([group, data]) => {
                const listItem = document.createElement('li');
                listItem.style.display = 'flex';
                listItem.style.alignItems = 'center';
                listItem.style.marginBottom = '10px';
                
                const colorSwatch = document.createElement('div');
                colorSwatch.style.width = '20px';
                colorSwatch.style.height = '20px';
                colorSwatch.style.backgroundColor = data.sample;
                colorSwatch.style.marginRight = '10px';
                colorSwatch.style.borderRadius = '50%';
                colorSwatch.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                
                const infoText = document.createElement('div');
                const matchingPsychology = psychologyData.find(p => p.name.toLowerCase() === group.toLowerCase());
                infoText.innerHTML = `<strong>${group}</strong> (${Math.round(data.percentage)}%): ${matchingPsychology ? matchingPsychology.meaning : 'Varies in psychological impact'}`;
                
                listItem.appendChild(colorSwatch);
                listItem.appendChild(infoText);
                dominantList.appendChild(listItem);
            });
            
            dominantSection.appendChild(dominantList);
        } else {
            dominantSection.textContent = 'Add more colors to see psychological analysis of your collection.';
        }
        
        collectionSection.appendChild(dominantSection);
        container.appendChild(collectionSection);
    }
    
    return container;
}

// Analyze collection's dominant hues
function analyzeCollectionHues() {
    if (colors.length === 0) return {};
    
    const hueGroups = {
        'Red': { count: 0, percentage: 0, sample: '#FF0000' },
        'Orange': { count: 0, percentage: 0, sample: '#FF7F00' },
        'Yellow': { count: 0, percentage: 0, sample: '#FFFF00' },
        'Green': { count: 0, percentage: 0, sample: '#00FF00' },
        'Blue': { count: 0, percentage: 0, sample: '#0000FF' },
        'Purple': { count: 0, percentage: 0, sample: '#800080' },
        'Pink': { count: 0, percentage: 0, sample: '#FFC0CB' },
        'Brown': { count: 0, percentage: 0, sample: '#964B00' },
        'Black': { count: 0, percentage: 0, sample: '#000000' },
        'White': { count: 0, percentage: 0, sample: '#FFFFFF' },
        'Gray': { count: 0, percentage: 0, sample: '#808080' }
    };
    
    // Count colors by hue group
    colors.forEach(color => {
        const hue = getHue(color.hex);
        const sat = getSaturation(color.hex);
        const light = getLightness(color.hex);
        
        // Determine color group
        let group;
        
        if (light < 10) {
            group = 'Black';
        } else if (light > 90 && sat < 10) {
            group = 'White';
        } else if (sat < 15) {
            group = 'Gray';
        } else {
            if (hue >= 0 && hue < 30) {
                group = 'Red';
            } else if (hue >= 30 && hue < 60) {
                group = 'Orange';
            } else if (hue >= 60 && hue < 90) {
                group = 'Yellow';
            } else if (hue >= 90 && hue < 150) {
                group = 'Green';
            } else if (hue >= 150 && hue < 210) {
                group = 'Blue';
            } else if (hue >= 210 && hue < 270) {
                group = 'Blue';
            } else if (hue >= 270 && hue < 330) {
                group = 'Purple';
            } else {
                group = 'Red';
            }
            
            // Special case for pink
            if (group === 'Red' && light > 70) {
                group = 'Pink';
            }
            
            // Special case for brown
            if ((group === 'Red' || group === 'Orange') && light < 40 && sat < 60) {
                group = 'Brown';
            }
        }
        
        // Increment count and set sample
        hueGroups[group].count++;
        hueGroups[group].sample = color.hex;
    });
    
    // Calculate percentages and filter out zero counts
    const filteredGroups = {};
    Object.entries(hueGroups).forEach(([group, data]) => {
        if (data.count > 0) {
            data.percentage = (data.count / colors.length) * 100;
            filteredGroups[group] = data;
        }
    });
    
    return filteredGroups;
}

// Create content for Color Wheel
function createColorWheelContent() {
    const container = document.createElement('div');
    
    // Header
    const header = document.createElement('div');
    header.className = 'theory-header';
    header.innerHTML = `
        <h2 class="theory-title">Interactive Color Wheel</h2>
        <p class="theory-description">
            The color wheel is a visual representation of color relationships. It shows how colors relate to each other 
            and helps in creating harmonious color combinations. Your collected colors are highlighted on the wheel.
        </p>
    `;
    container.appendChild(header);
    
    // Color wheel container
    const wheelContainer = document.createElement('div');
    wheelContainer.className = 'color-wheel-container';
    
    // Canvas for wheel
    const canvas = document.createElement('canvas');
    canvas.className = 'color-wheel-canvas';
    canvas.width = 600;
    canvas.height = 600;
    canvas.style.maxWidth = '100%';
    wheelContainer.appendChild(canvas);
    
    container.appendChild(wheelContainer);
    
    // Add script to draw color wheel when tab is shown
    setTimeout(() => {
        const ctx = canvas.getContext('2d');
        drawColorWheel(ctx, canvas.width, canvas.height);
    }, 200);
    
    return container;
}

// Draw color wheel with collection colors highlighted
function drawColorWheel(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    // Draw color wheel
    for (let angle = 0; angle < 360; angle += 1) {
        const startAngle = (angle - 0.5) * Math.PI / 180;
        const endAngle = (angle + 0.5) * Math.PI / 180;
        
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );
        
        // White at center, full color at edge
        gradient.            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
        }
        
        .stream-segment:hover {
            transform: translate(-50%, -50%) scale(1.2);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
            z-index: 2;
        }
        
        .stream-time-markers {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }
        
        .stream-time-marker {
            position: absolute;
            transform: translate(-50%, -50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: cyan;
            padding: 3px 8px;
            border-radius: 10px;
            font-size: 12px;
            white-space: nowrap;
            border: 1px solid rgba(0, 255, 255, 0.3);
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
        }
        
        .empty-message {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: rgba(0, 255, 255, 0.5);
            font-style: italic;
        }
        
        /* Make sure on mobile the stream is still visible */
        @media (max-width: 600px) {
            .color-stream-canvas {
                height: 300px;
            }
            
            .stream-controls {
                flex-direction: column;
                align-items: center;
            }
        }
    `;
    document.head.appendChild(styleEl);
}

// Add styles for map view
function addMapStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        .map-container {
            height: 500px;
            border-radius: 10px;
            overflow: hidden;
            margin: 20px 0;
            border: 1px solid rgba(0, 255, 255, 0.3);
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
        }
        
        .map-loading {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: cyan;
            font-size: 16px;
            background-color: rgba(0, 0, 0, 0.7);
        }
        
        .map-controls {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        
        /* Override Leaflet styles to match our theme */
        .leaflet-container {
            background-color: #000 !important;
        }
        
        .leaflet-control-zoom a {
            background-color: rgba(0, 0, 0, 0.7) !important;
            color: cyan !important;
            border-color: rgba(0, 255, 255, 0.3) !important;
        }
        
        .leaflet-control-zoom a:hover {
            background-color: rgba(0, 0, 0, 0.9) !important;
            color: #fff !important;
        }
        
        .leaflet-popup-content-wrapper {
            background-color: rgba(0, 0, 0, 0.8) !important;
            color: cyan !important;
            border: 1px solid rgba(0, 255, 255, 0.3) !important;
        }
        
        .leaflet-popup-tip {
            background-color: rgba(0, 0, 0, 0.8) !important;
            border: 1px solid rgba(0, 255, 255, 0.3) !important;
        }
        
        .map-color-swatch {
            width: 50px;
            height: 50px;
            border-radius: 5px;
            margin-bottom: 10px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        
        .map-color-swatch:hover {
            transform: scale(1.1);
        }
        
        .map-color-info {
            font-family: monospace;
            font-size: 12px;
        }
        
        .leaflet-custom-marker {
            border-radius: 50%;
            width: 15px !important;
            height: 15px !important;
            filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
            transition: transform 0.3s ease, filter 0.3s ease;
        }
        
        .leaflet-custom-marker:hover {
            transform: scale(1.5);
            filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.8));
            z-index: 1000 !important;
        }
        
        .proximity-legend {
            background-color: rgba(0, 0, 0, 0.7);
            padding: 10px;
            border-radius: 5px;
            border: 1px solid rgba(0, 255, 255, 0.3);
            color: cyan;
        }
        
        .proximity-legend-item {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
        }
        
        .proximity-legend-color {
            width: 15px;
            height: 15px;
            border-radius: 50%;
            margin-right: 10px;
            border: 1px solid rgba(255, 255, 255, 0.5);
        }
    `;
    document.head.appendChild(styleEl);
}

// Add styles for enhanced color theory section
function addColorTheoryStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        .color-theory-container {
            padding: 20px 0;
        }
        
        .theory-tabs {
            display: flex;
            gap: 5px;
            margin-bottom: 20px;
            overflow-x: auto;
            padding-bottom: 5px;
        }
        
        .theory-tab {
            background-color: rgba(0, 255, 255, 0.05);
            color: rgba(0, 255, 255, 0.8);
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 5px;
            padding: 8px 15px;
            cursor: pointer;
            font-family: monospace;
            transition: all 0.3s ease;
            white-space: nowrap;
        }
        
        .theory-tab:hover, .theory-tab.active {
            background-color: rgba(0, 255, 255, 0.2);
            color: cyan;
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
        
        .theory-content {
            display: none;
        }
        
        .theory-content.active {
            display: block;
            animation: fade-in 0.5s ease;
        }
        
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .theory-header {
            margin-bottom: 20px;
        }
        
        .theory-title {
            color: cyan;
            font-size: 24px;
            margin-bottom: 10px;
            text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
        }
        
        .theory-description {
            color: rgba(0, 255, 255, 0.8);
            line-height: 1.5;
            margin-bottom: 20px;
        }
        
        .theory-section {
            background-color: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(0, 255, 255, 0.2);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        }
        
        .theory-section-title {
            color: cyan;
            font-size: 18px;
            margin-bottom: 10px;
            border-bottom: 1px solid rgba(0, 255, 255, 0.2);
            padding-bottom: 5px;
        }
        
        .color-combinations {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .color-combination {
            background-color: rgba(0, 0, 0, 0.4);
            border-radius: 5px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            transition: transform 0.3s ease;
        }
        
        .color-combination:hover {
            transform: translateY(-5px);
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
        }
        
        .combination-colors {
            display: flex;
            height: 60px;
        }
        
        .combination-color {
            flex: 1;
        }
        
        .combination-info {
            padding: 10px;
            font-size: 12px;
            color: rgba(0, 255, 255, 0.8);
            text-align: center;
        }
        
        .color-wheel-container {
            height: 300px;
            position: relative;
            margin: 20px 0;
        }
        
        .color-wheel-canvas {
            width: 100%;
            height: 100%;
        }
        
        .color-mixer {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 20px;
        }
        
        .mixer-controls {
            flex: 1;
            min-width: 200px;
        }
        
        .mixer-result {
            flex: 1;
            min-width: 200px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        
        .mixer-color-selection {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .mixer-color-box {
            width: 40px;
            height: 40px;
            border-radius: 5px;
            cursor: pointer;
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: all 0.3s ease;
        }
        
        .mixer-color-box:hover, .mixer-color-box.selected {
            transform: scale(1.1);
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
        
        .mixer-slider {
            margin-bottom: 15px;
        }
        
        .mixer-slider-label {
            display: block;
            margin-bottom: 5px;
            color: rgba(0, 255, 255, 0.8);
        }
        
        .mixer-slider-input {
            width: 100%;
            -webkit-appearance: none;
            height: 5px;
            border-radius: 5px;
            background: rgba(0, 255, 255, 0.2);
            outline: none;
        }
        
        .mixer-slider-input::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 15px;
            height: 15px;
            border-radius: 50%;
            background: cyan;
            cursor: pointer;
            box-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
        }
        
        .mixer-result-color {
            width: 100px;
            height: 100px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
        }
        
        .mixer-result-info {
            text-align: center;
            color: rgba(0, 255, 255, 0.8);
            font-family: monospace;
        }
        
        .color-psychology {
            margin-top: 20px;
        }
        
        .psychology-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .psychology-item {
            background-color: rgba(0, 0, 0, 0.4);
            border-radius: 5px;
            overflow: hidden;
            transition: transform 0.3s ease;
        }
        
        .psychology-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
        }
        
        .psychology-color {
            height: 50px;
        }
        
        .psychology-info {
            padding: 10px;
            font-size: 12px;
        }
        
        .psychology-name {
            color: cyan;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        .psychology-meaning {
            color: rgba(0, 255, 255, 0.8);
            line-height: 1.4;
        }
    `;
    document.head.appendChild(styleEl);
}

// Render the current view
function renderView() {
    viewContainer.innerHTML = '';
    switch(currentView) {
        case 'grid':
            renderGridView();
            break;
        case 'spectrum':
            renderSpectrumView();
            break;
        case 'stream':
            renderColorStreamView();
            break;
        case 'map':
            renderMapView();
            break;
        case 'theory':
            renderColorTheoryView();
            break;
    }
}

// Update count with animation
function updateCount() {
    const oldCount = parseInt(countElement.textContent) || 0;
    const newCount = colors.length;
    
    // Animate count changing
    if (oldCount !== newCount) {
        countElement.textContent = oldCount;
        let current = oldCount;
        const step = newCount > oldCount ? 1 : -1;
        const interval = setInterval(() => {
            current += step;
            countElement.textContent = current;
            if (current === newCount) {
                clearInterval(interval);
            }
        }, 50);
    } else {
        countElement.textContent = newCount;
    }
}

// Render Grid View with seamless design
function renderGridView() {
    const gridContainer = document.createElement('div');
    gridContainer.className = 'color-grid-container';
    
    // Create seamless grid
    const grid = document.createElement('div');
    grid.className = 'color-grid seamless';
    
    colors.forEach((color, index) => {
        const square = document.createElement('div');
        square.className = 'color-square seamless';
        square.style.backgroundColor = color.hex;
        square.style.animationDelay = `${index * 0.05}s`;
        
        // Set data attributes for info display on hover
        square.dataset.name = color.name || getBasicColorName(color.hex);
        square.dataset.hex = color.hex;
        
        // Add click event to show modal
        square.addEventListener('click', () => {
            createColorDetailModal(color);
        });
        
        grid.appendChild(square);
    });
    
    gridContainer.appendChild(grid);
    viewContainer.appendChild(gridContainer);
    
    // Add info tooltip that follows cursor
    const tooltip = document.createElement('div');
    tooltip.className = 'grid-tooltip';
    tooltip.style.display = 'none';
    gridContainer.appendChild(tooltip);
    
    // Show tooltip on hover
    grid.addEventListener('mousemove', (e) => {
        if (e.target.classList.contains('color-square')) {
            tooltip.textContent = `${e.target.dataset.name} (${e.target.dataset.hex})`;
            tooltip.style.display = 'block';
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
        } else {
            tooltip.style.display = 'none';
        }
    });
    
    grid.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });
}

// Render Spectrum View
function renderSpectrumView() {
    const gridContainer = document.createElement('div');
    gridContainer.className = 'color-grid-container';
    
    // Create seamless grid
    const grid = document.createElement('div');
    grid.className = 'color-grid seamless';
    
    // Sort colors by hue
    const sortedColors = [...colors].sort((a, b) => {
        return getHue(a.hex) - getHue(b.hex);
    });
    
    sortedColors.forEach((color, index) => {
        const square = document.createElement('div');
        square.className = 'color-square seamless';
        square.style.backgroundColor = color.hex;
        square.style.animationDelay = `${index * 0.05}s`;
        
        // Set data attributes for info display on hover
        square.dataset.name = color.name || getBasicColorName(color.hex);
        square.dataset.hex = color.hex;
        
        // Add click event to show modal
        square.addEventListener('click', () => {
            createColorDetailModal(color);
        });
        
        grid.appendChild(square);
    });
    
    gridContainer.appendChild(grid);
    viewContainer.appendChild(gridContainer);
    
    // Add info tooltip that follows cursor
    const tooltip = document.createElement('div');
    tooltip.className = 'grid-tooltip';
    tooltip.style.display = 'none';
    gridContainer.appendChild(tooltip);
    
    // Show tooltip on hover
    grid.addEventListener('mousemove', (e) => {
        if (e.target.classList.contains('color-square')) {
            tooltip.textContent = `${e.target.dataset.name} (${e.target.dataset.hex})`;
            tooltip.style.display = 'block';
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
        } else {
            tooltip.style.display = 'none';
        }
    });
    
    grid.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });
}

// Render Color Stream View (timeline visualization)
function renderColorStreamView() {
    const streamContainer = document.createElement('div');
    streamContainer.className = 'color-stream-container';
    
    if (colors.length === 0) {
        streamContainer.innerHTML = '<div class="empty-message">No colors in the collection yet</div>';
        viewContainer.appendChild(streamContainer);
        return;
    }
    
    // Sort colors by date
    const sortedColors = [...colors].sort((a, b) => {
        const dateA = a.dateAdded instanceof Date ? a.dateAdded : new Date(a.dateAdded);
        const dateB = b.dateAdded instanceof Date ? b.dateAdded : new Date(b.dateAdded);
        return dateA - dateB;
    });
    
    // Create controls
    const streamControls = document.createElement('div');
    streamControls.className = 'stream-controls';
    streamControls.innerHTML = `
        <div class="stream-time-range">
            <button id="stream-range-all" class="view-btn active">All Time</button>
            <button id="stream-range-year" class="view-btn">Year</button>
            <button id="stream-range-month" class="view-btn">Month</button>
            <button id="stream-range-week" class="view-btn">Week</button>
        </div>
        <div class="stream-display-options">
            <button id="stream-animate-btn" class="view-btn">▶️ Animate Flow</button>
        </div>
    `;
    streamContainer.appendChild(streamControls);
    
    // Create timeline info
    const timelineInfo = document.createElement('div');
    timelineInfo.className = 'timeline-info';
    
    const startDate = sortedColors[0].dateAdded instanceof Date ? 
        sortedColors[0].dateAdded : new Date(sortedColors[0].dateAdded);
        
    const endDate = sortedColors[sortedColors.length - 1].dateAdded instanceof Date ? 
        sortedColors[sortedColors.length - 1].dateAdded : new Date(sortedColors[sortedColors.length - 1].dateAdded);
    
    timelineInfo.textContent = `Collection from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()} · ${sortedColors.length} colors`;
    streamContainer.appendChild(timelineInfo);
    
    // Create the stream canvas
    const streamCanvas = document.createElement('div');
    streamCanvas.className = 'color-stream-canvas';
    streamContainer.appendChild(streamCanvas);
    
    // Function to render the color stream based on current range
    let currentRange = 'all';
    let animationInterval = null;
    
    function renderStream(animate = false) {
        // Clear existing stream
        streamCanvas.innerHTML = '';
        
        // Filter colors based on current range
        let filteredColors = [...sortedColors];
        const now = new Date();
        
        if (currentRange !== 'all') {
            let cutoffDate = new Date(now);
            
            if (currentRange === 'year') {
                cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
            } else if (currentRange === 'month') {
                cutoffDate.setMonth(cutoffDate.getMonth() - 1);
            } else if (currentRange === 'week') {
                cutoffDate.setDate(cutoffDate.getDate() - 7);
            }
            
            filteredColors = sortedColors.filter(color => {
                const colorDate = color.dateAdded instanceof Date ? 
                    color.dateAdded : new Date(color.dateAdded);
                return colorDate >= cutoffDate;
            });
        }
        
        if (filteredColors.length === 0) {
            streamCanvas.innerHTML = '<div class="empty-message">No colors in the selected time range</div>';
            return;
        }
        
        // Create stream path
        const streamPath = document.createElement('div');
        streamPath.className = 'color-stream-path';
        
        // Add time markers
        const timeMarkers = document.createElement('div');
        timeMarkers.className = 'stream-time-markers';
        
        // Generate a meandering path for the stream
        const pathPoints = generateStreamPath(filteredColors.length);
        
        // Create segments for each color
        filteredColors.forEach((color, index) => {
            const colorDate = color.dateAdded instanceof Date ? 
                color.dateAdded : new Date(color.dateAdded);
            
            // Create color segment
            const segment = document.createElement('div');
            segment.className = 'stream-segment';
            segment.style.backgroundColor = color.hex;
            
            // Position segment along the path
            const point = pathPoints[index];
            segment.style.left = `${point.x}%`;
            segment.style.top = `${point.y}%`;
            
            // Size segment based on time density (more colors in a time period = larger)
            const density = calculateTimeDensity(filteredColors, index);
            const size = 30 + (density * 20); // Base size plus density factor
            segment.style.width = `${size}px`;
            segment.style.height = `${size}px`;
            
            // For animation effect, delay appearance
            if (animate) {
                segment.style.opacity = '0';
                segment.style.transform = 'translate(-50%, -50%) scale(0.2)';
                segment.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                segment.style.transitionDelay = `${index * 100}ms`;
            }
            
            // Add data and event for interactive display
            segment.dataset.index = index;
            segment.dataset.name = color.name || getBasicColorName(color.hex);
            segment.dataset.date = colorDate.toLocaleDateString();
            segment.dataset.hex = color.hex;
            
            segment.addEventListener('click', () => {
                createColorDetailModal(color);
            });
            
            streamPath.appendChild(segment);
            
            // Add time marker at regular intervals
            if (index % Math.max(1, Math.floor(filteredColors.length / 5)) === 0) {
                const marker = document.createElement('div');
                marker.className = 'stream-time-marker';
                marker.textContent = colorDate.toLocaleDateString();
                marker.style.left = `${point.x}%`;
                marker.style.top = `${point.y + 15}%`;
                timeMarkers.appendChild(marker);
            }
        });
        
        streamCanvas.appendChild(streamPath);
        streamCanvas.appendChild(timeMarkers);
        
        // Animate the appearance if requested
        if (animate) {
            let currentIndex = 0;
            clearInterval(animationInterval);
            
            animationInterval = setInterval(() => {
                if (currentIndex >= filteredColors.length) {
                    clearInterval(animationInterval);
                    return;
                }
                
                const segment = streamPath.querySelector(`.stream-segment[data-index="${currentIndex}"]`);
                if (segment) {
                    segment.style.opacity = '1';
                    segment.style.transform = 'translate(-50%, -50%) scale(1)';
                }
                
                currentIndex++;
            }, 100);
        }
    }
    
    // Generate a natural-looking stream path
    function generateStreamPath(pointCount) {
        const points = [];
        
        // Create control points for the path
        const controlPoints = [
            { x: 5, y: 50 },
            { x: 20, y: 30 },
            { x: 40, y: 60 },
            { x: 60, y: 40 },
            { x: 80, y: 70 },
            { x: 95, y: 50 }
        ];
        
        // Generate points along the path
        for (let i = 0; i < pointCount; i++) {
            const t = i / (pointCount - 1 || 1);
            const point = getBezierPoint(controlPoints, t);
            
            // Add slight randomness for organic feel
            const jitter = 5;
            point.x += (Math.random() - 0.5) * jitter;
            point.y += (Math.random() - 0.5) * jitter;
            
            points.push(point);
        }
        
        return points;
    }
    
    // Calculate a point along a bezier curve
    function getBezierPoint(points, t) {
        if (points.length === 1) {
            return points[0];
        }
        
        const newPoints = [];
        for (let i = 0; i < points.length - 1; i++) {
            newPoints.push({
                x: (1 - t) * points[i].x + t * points[i + 1].x,
                y: (1 - t) * points[i].y + t * points[i + 1].y
            });
        }
        
        return getBezierPoint(newPoints, t);
    }
    
    // Calculate time density (how many colors were added in a similar timeframe)
    function calculateTimeDensity(colors, index) {
        const currentDate = colors[index].dateAdded instanceof Date ? 
            colors[index].dateAdded : new Date(colors[index].dateAdded);
        
        // Look at colors added within 24 hours
        const timeWindow = 24 * 60 * 60 * 1000; // 24 hours in ms
        
        let count = 0;
        colors.forEach(color => {
            const colorDate = color.dateAdded instanceof Date ? 
                color.dateAdded : new Date(color.dateAdded);
            
            if (Math.abs(colorDate - currentDate) <= timeWindow) {
                count++;
            }
        });
        
        // Normalize to 0-1 range
        return Math.min(1, count / 10); // Cap at 10 colors for max density
    }
    
    // Initial render
    renderStream();
    
    // Add event listeners for controls
    document.getElementById('stream-range-all').addEventListener('click', function() {
        document.querySelectorAll('.stream-time-range .view-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        currentRange = 'all';
        renderStream();
    });
    
    document.getElementById('stream-range-year').addEventListener('click', function() {
        document.querySelectorAll('.stream-time-range .view-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        currentRange = 'year';
        renderStream();
    });
    
    document.getElementById('stream-range-month').addEventListener('click', function() {
        document.querySelectorAll('.stream-time-range .view-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        currentRange = 'month';
        renderStream();
    });
    
    document.getElementById('stream-range-week').addEventListener('click', function() {
        document.querySelectorAll('.stream-time-range .view-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        currentRange = 'week';
        renderStream();
    });
    
    document.getElementById('stream-animate-btn').addEventListener('click', function() {
        renderStream(true);
    });
    
    viewContainer.appendChild(streamContainer);
}

// Load Leaflet.js for map view
function loadLeafletJS() {
    // Check if Leaflet is already loaded
    if (window.L) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
        // Load CSS
        const linkEl = document.createElement('link');
        linkEl.rel = 'stylesheet';
        linkEl.href = 'https://unpkg.com/leaf        // Convert to hex for preview
        const hexColor = convertToHex(normalizedCode, format);
        if (hexColor) {
            preview.style.backgroundColor = hexColor;
        }
    }
}

// Detect color code format
function detectFormat(code) {
    for (const format of formatPatterns) {
        if (format.pattern.test(code)) {
            return format;
        }
    }
    return null;
}

// Convert color code to hex based on format
function convertToHex(code, format) {
    // If it's already a hex code
    if (format.name === "HEX") {
        return "#" + code.toUpperCase();
    }
    
    // Check if it exists in our mapping
    if (colorCodeMappings[code]) {
        return colorCodeMappings[code];
    }
    
    // If not found in mapping, try to approximate based on the format
    switch (format.name) {
        case "VALSPAR":
            return approximateValsparColor(code);
        case "NISSAN":
            return approximateNissanColor(code);
        default:
            return null;
    }
}

// Approximate Valspar color when not in mapping
function approximateValsparColor(code) {
    // Format: XXXX-XXX (e.g., 8002-45C)
    const parts = code.split('-');
    if (parts.length !== 2) return '#CCCCCC';
    
    const baseCode = parts[0]; // e.g., "8002"
    const colorCode = parts[1]; // e.g., "45C"
    
    // Extract number and letter
    const number = parseInt(colorCode.slice(0, -1)) || 50;
    const letter = colorCode.slice(-1).toUpperCase();
    
    // Basic color approximation based on the letter
    let r = 128, g = 128, b = 128;
    
    // Letter indicates color family
    switch (letter) {
        case 'A': // Reds
            r = 200; g = 100; b = 100;
            break;
        case 'B': // Greens
            r = 100; g = 200; b = 100;
            break;
        case 'C': // Blues
            r = 100; g = 100; b = 200;
            break;
        case 'D': // Yellows
            r = 200; g = 200; b = 100;
            break;
        case 'E': // Purples
            r = 150; g = 100; b = 200;
            break;
        case 'F': // Oranges
            r = 200; g = 150; b = 100;
            break;
        case 'G': // Light Blues
            r = 100; g = 150; b = 200;
            break;
        default: // Neutral color
            r = g = b = 150;
    }
    
    // Use the number to adjust intensity/lightness
    const intensity = Math.min(100, number) / 100;
    r = Math.floor(r * intensity + (255 - r * intensity) * (1 - intensity));
    g = Math.floor(g * intensity + (255 - g * intensity) * (1 - intensity));
    b = Math.floor(b * intensity + (255 - b * intensity) * (1 - intensity));
    
    // Convert to hex
    return rgbToHex(r, g, b);
}

// Approximate Nissan color when not in mapping
function approximateNissanColor(code) {
    // For Nissan codes, use a hash-based approach for more consistent results
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
        hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate RGB components from hash
    let r = (hash & 0xFF0000) >> 16;
    let g = (hash & 0x00FF00) >> 8;
    let b = hash & 0x0000FF;
    
    // Make sure they're in range 0-255
    r = Math.abs(r % 256);
    g = Math.abs(g % 256);
    b = Math.abs(b % 256);
    
    // Convert to hex
    return rgbToHex(r, g, b);
}

// Convert RGB to hex
function rgbToHex(r, g, b) {
    r = Math.min(255, Math.max(0, Math.round(r)));
    g = Math.min(255, Math.max(0, Math.round(g)));
    b = Math.min(255, Math.max(0, Math.round(b)));
    
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
}

// Add a new color
function addNewColor() {
    const code = colorInput.value.trim();
    if (!code) {
        showNotification('Please enter a color code');
        return;
    }
    
    // Normalize input by removing '#' if present for hex codes
    const normalizedCode = code.startsWith('#') ? code.substring(1) : code;
    
    // Detect format
    const format = detectFormat(normalizedCode);
    if (!format) {
        showNotification('Unknown color code format');
        return;
    }
    
    // Convert to hex
    const hexColor = convertToHex(normalizedCode, format);
    if (!hexColor) {
        showNotification('Could not convert color code to hex');
        return;
    }
    
    // Get color name
    let colorName = getColorName(hexColor, normalizedCode, format.name);
    
    // Create a new color object with metadata
    const newColor = {
        hex: hexColor,
        originalCode: normalizedCode,
        name: colorName
    };
    
    // Show the color spotlight with proximity question
    showColorSpotlight(newColor);
    
    // Clear input and preview
    colorInput.value = '';
    preview.style.backgroundColor = '';
    formatDisplay.textContent = '';
}

// Show notification
function showNotification(message) {
    // Check if notification element exists, create if not
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Get a descriptive name for a color
function getColorName(hex, originalCode, formatName) {
    if (formatName !== "HEX") {
        return originalCode + ' - ' + getBasicColorName(hex);
    }
    return getBasicColorName(hex);
}

// Get a basic color name based on HSL values
function getBasicColorName(hex) {
    const hue = getHue(hex);
    const sat = getSaturation(hex);
    const light = getLightness(hex);
    
    // Create a descriptive name based on HSL values
    let prefix = '';
    let name = '';
    
    // Brightness prefix
    if (light < 20) {
        prefix = 'Dark';
    } else if (light > 80) {
        prefix = 'Light';
    } else if (sat < 20) {
        prefix = 'Grayish';
    } else if (sat > 80) {
        prefix = 'Vivid';
    }
    
    // Hue name
    if (hue >= 0 && hue < 30) {
        name = 'Red';
    } else if (hue >= 30 && hue < 60) {
        name = 'Orange';
    } else if (hue >= 60 && hue < 90) {
        name = 'Yellow';
    } else if (hue >= 90 && hue < 150) {
        name = 'Green';
    } else if (hue >= 150 && hue < 210) {
        name = 'Cyan';
    } else if (hue >= 210 && hue < 270) {
        name = 'Blue';
    } else if (hue >= 270 && hue < 330) {
        name = 'Purple';
    } else {
        name = 'Pink';
    }
    
    return prefix ? `${prefix} ${name}` : name;
}

// Get hue value (0-360) from hex color
function getHue(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    let hue = 0;
    if (delta === 0) {
        return 0;
    }
    
    if (max === r) {
        hue = ((g - b) / delta) % 6;
    } else if (max === g) {
        hue = (b - r) / delta + 2;
    } else {
        hue = (r - g) / delta + 4;
    }
    
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
    
    return hue;
}

// Get saturation (0-100) from hex color
function getSaturation(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    const lightness = (max + min) / 2;
    let saturation = 0;
    
    if (delta !== 0) {
        saturation = delta / (1 - Math.abs(2 * lightness - 1));
    }
    
    return Math.round(saturation * 100);
}

// Get lightness (0-100) from hex color
function getLightness(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    const lightness = (max + min) / 2;
    
    return Math.round(lightness * 100);
}

// Convert hex to RGB
function hexToRgb(hex) {
    try {
        // Remove # if present
        hex = hex.replace(/^#/, '');
        
        // Parse hex values
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        
        return { r, g, b };
    } catch (e) {
        console.error('Error parsing hex color:', e, hex);
        return { r: 0, g: 0, b: 0 };
    }
}

// Add CSS for color spotlight
function addSpotlightStyles() {
    // Check if styles already exist
    if (document.getElementById('spotlight-styles')) return;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'spotlight-styles';
    styleSheet.textContent = `
        /* Color spotlight styles */
        .color-spotlight {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease-out;
            background-color: rgba(0, 0, 0, 0.7);
        }
        
        .proximity-question {
            background: rgba(0, 0, 0, 0.7);
            color: cyan;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            max-width: 500px;
            font-family: monospace;
            border: 1px solid rgba(0, 255, 255, 0.3);
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
            animation: pulse-glow 3s infinite alternate;
        }
        
        .proximity-options {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        
        .proximity-options button {
            background: rgba(0, 255, 255, 0.1);
            color: cyan;
            border: 1px solid cyan;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: monospace;
        }
        
        .proximity-options button:hover {
            background: rgba(0, 255, 255, 0.3);
            transform: translateY(-2px);
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
        
        .animated-square {
            position: fixed;
            width: 200px;
            height: 200px;
            z-index: 999;
            transition: all 0.5s ease;
            border-radius: 5px;
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
        }
    `;
    document.head.appendChild(styleSheet);
}

// Color spotlight animation and proximity question
function showColorSpotlight(color) {
    // Create spotlight container
    const spotlight = document.createElement('div');
    spotlight.className = 'color-spotlight';
    
    // Create animated color patch
    const colorPatch = document.createElement('div');
    colorPatch.style.width = '200px';
    colorPatch.style.height = '200px';
    colorPatch.style.backgroundColor = color.hex;
    colorPatch.style.borderRadius = '10px';
    colorPatch.style.boxShadow = '0 0 40px ' + color.hex;
    colorPatch.style.animation = 'pulse-glow 3s infinite alternate';
    colorPatch.style.marginBottom = '30px';
    
    // Create proximity question
    const question = document.createElement('div');
    question.className = 'proximity-question';
    question.innerHTML = `
        <h3>How do you feel about this color?</h3>
        <p>Does this color feel emotionally near or far to you?</p>
        <div class="proximity-options">
            <button data-proximity="very-close">Very Close</button>
            <button data-proximity="somewhat-close">Somewhat Close</button>
            <button data-proximity="neutral">Neutral</button>
            <button data-proximity="somewhat-distant">Somewhat Distant</button>
            <button data-proximity="very-distant">Very Distant</button>
        </div>
    `;
    
    // Create container for both
    const contentContainer = document.createElement('div');
    contentContainer.style.display = 'flex';
    contentContainer.style.flexDirection = 'column';
    contentContainer.style.alignItems = 'center';
    contentContainer.appendChild(colorPatch);
    contentContainer.appendChild(question);
    
    spotlight.appendChild(contentContainer);
    document.body.appendChild(spotlight);
    
    // Add event listeners to buttons
    const buttons = spotlight.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const proximity = button.dataset.proximity;
            console.log('Proximity button clicked:', proximity);
            
            // Request location and proceed with color addition
            requestLocationForColor(color, proximity);
            
            // Remove spotlight
            spotlight.remove();
        });
    });
}

// Animate color joining the collection
function animateColorJoining(spotlight, color) {
    // Get position of the color grid
    const grid = document.querySelector('.color-grid') || viewContainer;
    const gridRect = grid.getBoundingClientRect();
    
    // Create a small square that will animate
    const animatedSquare = document.createElement('div');
    animatedSquare.className = 'animated-square';
    animatedSquare.style.backgroundColor = color.hex;
    document.body.appendChild(animatedSquare);
    
    // Set initial position (center of spotlight)
    const spotlightRect = spotlight.getBoundingClientRect();
    animatedSquare.style.top = `${spotlightRect.top + spotlightRect.height/2}px`;
    animatedSquare.style.left = `${spotlightRect.left + spotlightRect.width/2}px`;
    
    // Animate to final position
    setTimeout(() => {
        animatedSquare.style.transform = 'scale(0.2)';
        animatedSquare.style.top = `${gridRect.top + 25}px`;
        animatedSquare.style.left = `${gridRect.left + 25}px`;
        
        // Remove element after animation
        setTimeout(() => {
            animatedSquare.remove();
        }, 500);
    }, 100);
}

// Add styles for color detail modal
function addColorDetailStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        .color-detail-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .color-detail-modal.show {
            opacity: 1;
        }
        
        .color-detail-content {
            background-color: #111;
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 10px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow: auto;
            position: relative;
            display: flex;
            flex-direction: column;
            transform: translateY(20px);
            transition: transform 0.3s ease;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
        }
        
        .color-detail-modal.show .color-detail-content {
            transform: translateY(0);
        }
        
        .color-detail-close {
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            color: cyan;
            font-size: 24px;
            cursor: pointer;
            z-index: 1;
            text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
        }
        
        .color-detail-swatch {
            height: 200px;
            border-radius: 10px 10px 0 0;
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.2) inset;
        }
        
        .color-detail-info {
            padding: 20px;
            color: cyan;
        }
        
        .color-detail-name {
            margin: 0 0 10px 0;
            font-size: 24px;
            text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
        }
        
        .color-detail-hex {
            font-family: monospace;
            font-size: 18px;
            padding: 5px 10px;
            background-color: rgba(0, 255, 255, 0.1);
            border-radius: 5px;
            display: inline-block;
            margin-bottom: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid rgba(0, 255, 255, 0.3);
        }
        
        .color-detail-hex:hover {
            background-color: rgba(0, 255, 255, 0.2);
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
        
        .color-detail-original {
            font-family: monospace;
            font-size: 14px;
            padding: 5px 10px;
            background-color: rgba(0, 255, 255, 0.1);
            border-radius: 5px;
            display: inline-block;
            margin-bottom: 15px;
            margin-left: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid rgba(0, 255, 255, 0.3);
        }
        
        .color-detail-original:hover {
            background-color: rgba(0, 255, 255, 0.2);
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
        
        .color-detail-date, .color-detail-location, .color-detail-rgb, .color-detail-hsl {
            margin-bottom: 10px;
            font-size: 14px;
            opacity: 0.8;
        }
        
        .color-detail-location {
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .color-detail-location:hover {
            opacity: 1;
            text-shadow: 0 0 5px rgba(0, 255, 255, 0.7);
        }
        
        /* Mobile adjustments */
        @media (max-width: 600px) {
            .color-detail-content {
                width: 95%;
            }
            
            .color-detail-swatch {
                height: 150px;
            }
            
            .color-detail-name {
                font-size: 20px;
            }
        }
    `;
    document.head.appendChild(styleEl);
}

// Create color detail modal
function createColorDetailModal(color) {
    // Check if a modal already exists and remove it
    const existingModal = document.querySelector('.color-detail-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create the modal
    const modal = document.createElement('div');
    modal.className = 'color-detail-modal';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'color-detail-content';
    
    // Create color swatch - large display of the color
    const colorSwatch = document.createElement('div');
    colorSwatch.className = 'color-detail-swatch';
    colorSwatch.style.backgroundColor = color.hex;
    
    // Create color information section
    const colorInfo = document.createElement('div');
    colorInfo.className = 'color-detail-info';
    
    // Color name and hex
    const colorName = document.createElement('h2');
    colorName.className = 'color-detail-name';
    colorName.textContent = color.name || getBasicColorName(color.hex);
    
    const colorHex = document.createElement('div');
    colorHex.className = 'color-detail-hex';
    colorHex.textContent = color.hex;
    colorHex.addEventListener('click', () => {
        navigator.clipboard.writeText(color.hex.substring(1));
        showNotification('Copied: ' + color.hex.substring(1));
    });
    
    // Original code if different from hex
    let colorOriginal = null;
    if (color.originalCode && color.originalCode !== color.hex.substring(1)) {
        colorOriginal = document.createElement('div');
        colorOriginal.className = 'color-detail-original';
        colorOriginal.textContent = `Original: ${color.originalCode}`;
        colorOriginal.addEventListener('click', () => {
            navigator.clipboard.writeText(color.originalCode);
            showNotification('Copied: ' + color.originalCode);
        });
    }
    
    // Date added
    const colorDate = document.createElement('div');
    colorDate.className = 'color-detail-date';
    const dateObj = color.dateAdded instanceof Date ? color.dateAdded : new Date(color.dateAdded);
    colorDate.textContent = `Added: ${dateObj.toLocaleDateString()} at ${dateObj.toLocaleTimeString()}`;
    
    // Location
    const colorLocation = document.createElement('div');
    colorLocation.className = 'color-detail-location';
    if (color.location) {
        colorLocation.textContent = `Location: ${color.location.locationName || 'Unknown'} (${color.location.latitude.toFixed(4)}, ${color.location.longitude.toFixed(4)})`;
        colorLocation.addEventListener('click', () => {
            // Switch to map view and focus on this color
            viewButtons.forEach(btn => {
                if (btn.getAttribute('data-view') === 'map') {
                    btn.click();
                    setTimeout(() => {
                        focusMapOnColor(color);
                    }, 500);
                }
            });
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });
    } else {
        colorLocation.textContent = 'Location: Not recorded';
    }
    
    // Add RGB and HSL values
    const rgb = hexToRgb(color.hex);
    const colorRgb = document.createElement('div');
    colorRgb.className = 'color-detail-rgb';
    colorRgb.textContent = `RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}`;
    
    const hue = getHue(color.hex);
    const sat = getSaturation(color.hex);
    const light = getLightness(color.hex);
    const colorHsl = document.createElement('div');
    colorHsl.className = 'color-detail-hsl';
    colorHsl.textContent = `HSL: ${Math.round(hue)}°, ${Math.round(sat)}%, ${Math.round(light)}%`;
    
    // Proximity feeling
    const colorProximity = document.createElement('div');
    colorProximity.className = 'color-detail-proximity';
    colorProximity.style.marginBottom = '10px';
    colorProximity.style.fontSize = '14px';
    colorProximity.style.opacity = '0.8';
    
    if (color.proximity) {
        let proximityText;
        switch(color.proximity) {
            case 'very-close':
                proximityText = 'Very emotionally close';
                break;
            case 'somewhat-close':
                proximityText = 'Somewhat emotionally close';
                break;
            case 'neutral':
                proximityText = 'Emotionally neutral';
                break;
            case 'somewhat-distant':
                proximityText = 'Somewhat emotionally distant';
                break;
            case 'very-distant':
                proximityText = 'Very emotionally distant';
                break;
            default:
                proximityText = 'Emotional proximity not recorded';
        }
        colorProximity.textContent = `Emotional Proximity: ${proximityText}`;
    } else {
        colorProximity.textContent = 'Emotional Proximity: Not recorded';
    }
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'color-detail-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });
    
    // Assemble the modal
    colorInfo.appendChild(colorName);
    colorInfo.appendChild(colorHex);
    if (colorOriginal) colorInfo.appendChild(colorOriginal);
    colorInfo.appendChild(colorDate);
    colorInfo.appendChild(colorLocation);
    colorInfo.appendChild(colorProximity);
    colorInfo.appendChild(colorRgb);
    colorInfo.appendChild(colorHsl);
    
    modalContent.appendChild(closeButton);
    modalContent.appendChild(colorSwatch);
    modalContent.appendChild(colorInfo);
    modal.appendChild(modalContent);
    
    // Add to body and show with animation
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Close when clicking outside the modal content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    });
}

// Add styles for color stream visualization
function addColorStreamStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        .color-stream-container {
            padding: 20px 0;
            position: relative;
        }
        
        .stream-controls {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .stream-time-range, .stream-display-options {
            display: flex;
            gap: 5px;
        }
        
        .timeline-info {
            text-align: center;
            color: rgba(0, 255, 255, 0.7);
            margin-bottom: 20px;
            font-size: 14px;
        }
        
        .color-stream-canvas {
            position: relative;
            height: 400px;
            background-color: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 20px;
            border: 1px solid rgba(0, 255, 255, 0.1);
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5) inset, 0 0 15px rgba(0, 255, 255, 0.2);
        }
        
        .color-stream-path {
            position: relative;
            width: 100%;
            height: 100%;
        }
        
        .stream-segment {
            position: absolute;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            cursor: pointer;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow // Default color collection with initial samples
let colors = [ 
    { 
        hex: "#FF0000", 
        name: "Red", 
        dateAdded: new Date(2025, 0, 1), 
        proximity: "somewhat-close", 
        originalCode: "FF0000",
        location: {
            latitude: 41.8240,
            longitude: -71.4128,
            locationName: "Providence",
            accuracy: 100
        }
    }, 
    { 
        hex: "#FF7F00", 
        name: "Orange", 
        dateAdded: new Date(2025, 0, 3), 
        proximity: "neutral", 
        originalCode: "FF7F00",
        location: {
            latitude: 41.8300,
            longitude: -71.4200,
            locationName: "Downtown",
            accuracy: 100
        }
    }, 
    { 
        hex: "#FFFF00", 
        name: "Yellow", 
        dateAdded: new Date(2025, 0, 5), 
        proximity: "very-close", 
        originalCode: "FFFF00",
        location: {
            latitude: 41.8190,
            longitude: -71.4250,
            locationName: "College Hill",
            accuracy: 100
        }
    }, 
    { 
        hex: "#00FF00", 
        name: "Green", 
        dateAdded: new Date(2025, 0, 7), 
        proximity: "somewhat-distant", 
        originalCode: "00FF00",
        location: {
            latitude: 41.8270,
            longitude: -71.4050,
            locationName: "Fox Point",
            accuracy: 100
        }
    }, 
    { 
        hex: "#0000FF", 
        name: "Blue", 
        dateAdded: new Date(2025, 0, 9), 
        proximity: "very-distant", 
        originalCode: "0000FF",
        location: {
            latitude: 41.8350,
            longitude: -71.4150,
            locationName: "Smith Hill",
            accuracy: 100
        }
    } 
];

// Color code conversion database
const colorCodeMappings = {
    // Valspar paint color codes (format: XXXX-XXX)
    "8002-45C": "#92B2D1", // Moonglow - Light Blue
    "8002-30B": "#AEDE9E", // Cool Peridot - Light Green
    "8002-45G": "#7B9ECF", // Encore - Medium Blue
    "8002-20A": "#FFD493", // Example Orange
    "8002-10B": "#FFAFAF", // Example Pink
    "7006-12": "#6B8E8E",  // Sharkfin - Gray Blue
    "8003-38D": "#D8AC67", // Golden Straw - Warm Gold
    
    // Nissan paint color codes
    "K23": "#C0C0C0",    // Brilliant Silver Metallic
    "QAB": "#FFFFFF",    // Pearl White
    "NAH": "#B22222",    // Cayenne Red Pearl
    "NV245C": "#2B4B65", // Dark Blue Metallic
    "RAY": "#000000",    // Super Black
    "KAD": "#808080",    // Gun Metallic
    "EBL": "#003399"     // Coulis Blue
};

// Format detection patterns
const formatPatterns = [
    { name: "HEX", pattern: /^[0-9A-Fa-f]{6}$/i, prefix: "#" },
    { name: "VALSPAR", pattern: /^\d{4}-\d{2}[A-Z]$/i, prefix: "" },
    { name: "NISSAN", pattern: /^(NV)?\d{3}[A-Z]$|^[A-Z]{2,3}$/i, prefix: "" }
];

// Proximity values for color galaxy
const proximityValues = {
    "very-close": 0.2,
    "somewhat-close": 0.4,
    "neutral": 0.6,
    "somewhat-distant": 0.8,
    "very-distant": 1.0
};

// DOM elements
let preview, colorInput, formatDisplay, addBtn, viewContainer, countElement, viewButtons, notification;

// Current view
let currentView = 'grid';

// Map instance (for location view)
let colorMap = null;
let mapInitialized = false;

// Helper function to generate a random location for the galaxy view
function getRandomLocation() {
  const locations = [
    { name: "Inner Core", x: 0.2, y: 0.3 },
    { name: "Middle Ring", x: 0.3, y: 0.4 },
    { name: "Outer Reaches", x: 0.4, y: 0.5 },
    { name: "Tech Sector", x: 0.5, y: 0.2 },
    { name: "Artistic District", x: 0.7, y: 0.3 },
    { name: "Historic Region", x: 0.8, y: 0.2 }
  ];
  
  return locations[Math.floor(Math.random() * locations.length)];
}

// LocalStorage functions
function saveColorsToStorage() {
    try {
        localStorage.setItem('colorCollective', JSON.stringify(colors));
        console.log('Saved', colors.length, 'colors to localStorage');
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadColorsFromStorage() {
    try {
        const stored = localStorage.getItem('colorCollective');
        if (stored) {
            const parsed = JSON.parse(stored);
            console.log('Loaded', parsed.length, 'colors from localStorage');
            
            // Convert date strings back to Date objects
            return parsed.map(color => ({
                ...color,
                dateAdded: new Date(color.dateAdded)
            }));
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
    return null;
}

// Function to fetch colors from the database
async function fetchColors() {
    try {
        console.log('Attempting to fetch colors from Firebase...');
        
        // Try to get colors from Firebase
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            console.log('Firebase is defined, getting colors collection...');
            const snapshot = await db.collection('colors').orderBy('dateAdded').get();
            
            if (!snapshot.empty) {
                console.log('Successfully fetched', snapshot.size, 'colors from Firebase');
                
                // Convert to the format expected by the app
                const fetchedColors = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    console.log('Processing color from Firebase:', data);
                    fetchedColors.push({
                        hex: data.hex,
                        originalCode: data.originalCode,
                        name: data.name,
                        proximity: data.proximity || 'neutral',
                        dateAdded: data.dateAdded.toDate(), // Convert Firestore timestamp to JS Date
                        location: data.location || null
                    });
                });
                
                return fetchedColors;
            } else {
                console.log('No colors found in Firebase, using default or localStorage');
            }
        } else {
            console.log('Firebase not available, using localStorage');
        }
        
        // If Firebase failed or returned no results, try localStorage
        const storedColors = loadColorsFromStorage();
        if (storedColors && storedColors.length > 0) {
            console.log('Using', storedColors.length, 'colors from localStorage');
            return storedColors;
        }
        
        // If all else fails, use default colors
        console.log('Using default color set');
        return colors;
    } catch (error) {
        console.error('Error fetching colors:', error);
        
        // Fall back to localStorage or defaults
        const storedColors = loadColorsFromStorage();
        return storedColors && storedColors.length > 0 ? storedColors : colors;
    }
}

// Function to get geolocation for a color
function requestLocationForColor(colorData, proximity) {
    // First check if geolocation is available
    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by your browser');
        showLocationRequiredModal(colorData, proximity);
        return;
    }
    
    showNotification('Requesting location access...');
    
    navigator.geolocation.getCurrentPosition(
        // Success callback
        (position) => {
            const locationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp,
                locationName: "Unknown" // We'll use reverse geocoding later
            };
            
            // Try to get location name using reverse geocoding
            tryReverseGeocode(locationData, (locationWithName) => {
                addNewColorWithLocationAndProximity(colorData, proximity, locationWithName);
            });
        },
        // Error callback
        (error) => {
            console.error('Geolocation error:', error);
            
            if (error.code === 1) { // Permission denied
                showLocationRequiredModal(colorData, proximity);
            } else {
                // Handle other errors
                showNotification('Could not get your location. Please try again.');
            }
        },
        // Options
        {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000
        }
    );
}

// Simple mock reverse geocoding (in a real app, you'd use a service like Google Maps)
function tryReverseGeocode(locationData, callback) {
    // Simplified mock for demonstration - in reality you'd call an API
    // For now, just returning "Providence" as the location name
    setTimeout(() => {
        locationData.locationName = "Providence";
        callback(locationData);
    }, 500);
}

// Show modal explaining location is required
function showLocationRequiredModal(colorData, proximity) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'modal location-modal';
    modal.style.display = 'block';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = `
        <h2>Location Required</h2>
        <p>Chromatic Collective maps colors in both physical space and emotional space.</p>
        <p>Your location is an essential part of this color's story.</p>
        <p>Please enable location access to contribute to this collaborative art project.</p>
        <div class="modal-buttons">
            <button id="try-again-btn" class="btn">Try Again</button>
            <button id="cancel-btn" class="btn">Cancel</button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('try-again-btn').addEventListener('click', () => {
        modal.remove();
        requestLocationForColor(colorData, proximity);
    });
    
    document.getElementById('cancel-btn').addEventListener('click', () => {
        modal.remove();
    });
}

// Function to add a new color with location and proximity data
async function addNewColorWithLocationAndProximity(colorData, proximity, locationData) {
    try {
        console.log('Adding new color:', colorData.hex, 'with proximity:', proximity, 'at location:', locationData);
        
        // Create a new color object with all data
        const newColor = {
            ...colorData,
            proximity,
            dateAdded: new Date(),
            location: locationData
        };
        
        // Add to our local array
        colors.push(newColor);
        
        // Save to localStorage as backup
        saveColorsToStorage();
        
        // Try to save to Firebase if available
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            try {
                console.log('Firebase available, attempting to save color with location...');
                
                // Prepare the color data for Firebase
                const firestoreData = {
                    hex: colorData.hex,
                    originalCode: colorData.originalCode,
                    name: colorData.name,
                    proximity: proximity,
                    dateAdded: firebase.firestore.Timestamp.fromDate(new Date()),
                    location: locationData
                };
                
                // Add to Firestore
                await db.collection('colors').add(firestoreData);
                console.log('Color successfully saved to Firebase with location');
            } catch (firebaseError) {
                console.error('Firebase save error:', firebaseError);
                console.warn('Firebase save failed, but color was added locally');
            }
        }
        
        // Show success notification and animate color joining
        showNotification('Color added to collective!');
        animateColorJoining(document.body, newColor);
        
        // Update UI
        renderView();
        updateCount();
        
        return newColor;
    } catch (error) {
        console.error('Error adding color with location:', error);
        // Still return the color data for local use
        return colorData;
    }
}

// Initialize
window.onload = async function() {
    console.log('Initializing Enhanced Color Collective...');
    
    // Add enhanced styles
    addEnhancedStyles();
    
    // Fix UI layout
    fixUILayout();
    
    // Get DOM elements
    preview = document.getElementById('preview');
    colorInput = document.getElementById('color-code');
    formatDisplay = document.getElementById('format-display');
    addBtn = document.getElementById('add-btn');
    viewContainer = document.getElementById('view-container');
    countElement = document.getElementById('count');
    
    // Update navigation controls to include new views
    const viewControls = document.querySelector('.view-controls');
    if (viewControls) {
        viewControls.innerHTML = `
            <button class="view-btn active" data-view="grid">Grid View</button>
            <button class="view-btn" data-view="spectrum">Spectrum</button>
            <button class="view-btn" data-view="stream">Color Stream</button>
            <button class="view-btn" data-view="map">Location Map</button>
            <button class="view-btn" data-view="theory">Color Theory</button>
        `;
        
        // Update view buttons
        viewButtons = document.querySelectorAll('.view-btn');
    }
    
    // Add CSS for color spotlight to head
    addSpotlightStyles();
    addColorDetailStyles();
    addColorStreamStyles();
    addMapStyles();
    addColorTheoryStyles();
    
    // Try to fetch from Firebase first
    console.log('Trying to fetch colors from Firebase first...');
    const serverColors = await fetchColors();
    if (serverColors && serverColors.length > 0) {
        colors = serverColors;
        console.log('Using colors from Firebase');
        // Save to localStorage as backup
        saveColorsToStorage();
    } else {
        // If Firebase failed, try localStorage
        const storedColors = loadColorsFromStorage();
        if (storedColors && storedColors.length > 0) {
            colors = storedColors;
            console.log('Using colors from localStorage');
        } else {
            console.log('Using default color set');
        }
    }
    
    // Render the initial view - skip title page
    renderView();
    updateCount();
    
    // Set up event listeners
    colorInput.addEventListener('input', updatePreviewAndFormat);
    
    addBtn.addEventListener('click', addNewColor);
    
    colorInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            addNewColor();
        }
    });
    
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.getAttribute('data-view');
            
            // Add animation to container
            viewContainer.style.opacity = 0;
            setTimeout(() => {
                renderView();
                viewContainer.style.opacity = 1;
            }, 300);
        });
    });
    
    // Load Leaflet.js for map view if needed
    if (!window.L && currentView === 'map') {
        loadLeafletJS();
    }
    
    // Test Firebase connection at the end
    console.log('Testing Firebase connection directly...');
    if (typeof firebase !== 'undefined' && firebase.firestore) {
        try {
            const testResult = await db.collection('colors').limit(1).get();
            console.log('Firebase test successful, document count:', testResult.size);
        } catch (testError) {
            console.error('Firebase test failed:', testError);
        }
    } else {
        console.log('Firebase not available for testing');
    }
    
    console.log('Enhanced initialization complete');
};

// Fix layout issues
function fixUILayout() {
    // Remove the title
    const title = document.querySelector('.title');
    if (title) {
        title.remove();
    }
    
    // Adjust header layout
    const header = document.querySelector('.header');
    if (header) {
        header.style.justifyContent = 'flex-end';
        
        // Add a subtle logo/icon
        const logo = document.createElement('div');
        logo.className = 'app-logo';
        logo.innerHTML = '<span>C</span>';
        header.insertBefore(logo, header.firstChild);
    }
    
    // Fix input container layout
    const inputContainer = document.querySelector('.input-container');
    if (inputContainer) {
        inputContainer.style.display = 'grid';
        inputContainer.style.gridTemplateColumns = '40px 1fr auto';
        inputContainer.style.gap = '10px';
        inputContainer.style.alignItems = 'center';
        
        // Fix input field width
        const inputGroup = document.querySelector('.input-group');
        if (inputGroup) {
            inputGroup.style.width = '100%';
            inputGroup.style.minWidth = 'unset';
        }
        
        // Ensure button doesn't get squished
        const addBtn = document.getElementById('add-btn');
        if (addBtn) {
            addBtn.style.whiteSpace = 'nowrap';
            addBtn.style.minWidth = '120px';
        }
    }
}

// Add enhanced styles with glowing effects
function addEnhancedStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'enhanced-styles';
    styleSheet.textContent = `
        /* Enhanced UI effects */
        body {
            background-color: #111;
            color: cyan;
            font-family: monospace;
            margin: 0;
            padding: 20px;
            overflow-x: hidden;
            position: relative;
        }
        
        body:after {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 50% 50%, transparent 90%, rgba(0, 255, 255, 0.05) 100%);
            pointer-events: none;
            animation: background-pulse 8s infinite alternate;
            z-index: -1;
        }
        
        @keyframes background-pulse {
            0% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .app-logo {
            display: flex;
            align-items: center;
            color: cyan;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
        }
        
        .app-logo span {
            display: inline-block;
            animation: logo-pulse 3s infinite alternate;
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.7);
        }
        
        @keyframes logo-pulse {
            0% { text-shadow: 0 0 5px rgba(0, 255, 255, 0.5); }
            100% { text-shadow: 0 0 15px rgba(0, 255, 255, 1); }
        }
        
        .btn, .view-btn {
            background-color: rgba(0, 255, 255, 0.1);
            color: cyan;
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 5px;
            cursor: pointer;
            font-family: monospace;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            box-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
        }
        
        .btn:hover, .view-btn:hover, .view-btn.active {
            background-color: rgba(0, 255, 255, 0.2);
            transform: translateY(-2px);
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.7);
            text-shadow: 0 0 5px rgba(0, 255, 255, 0.8);
        }
        
        .btn:after, .view-btn:after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
                to bottom right, 
                rgba(0, 255, 255, 0) 0%,
                rgba(0, 255, 255, 0.1) 50%,
                rgba(0, 255, 255, 0) 100%
            );
            transform: rotate(30deg);
            animation: shimmer 4s infinite linear;
            pointer-events: none;
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%) rotate(30deg); }
            100% { transform: translateX(100%) rotate(30deg); }
        }
        
        .color-preview {
            width: 40px;
            height: 40px;
            border-radius: 5px;
            border: 1px solid rgba(0, 255, 255, 0.3);
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.4);
            transition: all 0.3s ease;
            animation: pulse-subtle 3s infinite alternate;
        }
        
        @keyframes pulse-subtle {
            0% { box-shadow: 0 0 5px rgba(0, 255, 255, 0.4); }
            100% { box-shadow: 0 0 15px rgba(0, 255, 255, 0.8); }
        }
        
        #color-code {
            width: 100%;
            padding: 10px;
            background-color: rgba(0, 255, 255, 0.05);
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 5px;
            color: cyan;
            font-family: monospace;
            font-size: 16px;
            box-shadow: 0 0 8px rgba(0, 255, 255, 0.2) inset;
            transition: all 0.3s ease;
        }
        
        #color-code:focus {
            border-color: rgba(0, 255, 255, 0.8);
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.4) inset;
            outline: none;
        }
        
        #format-display {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 12px;
            opacity: 0.7;
            text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
        }
        
        .count {
            background-color: rgba(0, 255, 255, 0.1);
            padding: 5px 10px;
            border-radius: 5px;
            border: 1px solid rgba(0, 255, 255, 0.3);
            font-size: 16px;
            animation: pulse-glow 4s infinite alternate;
        }
        
        @keyframes pulse-glow {
            0% { box-shadow: 0 0 5px rgba(0, 255, 255, 0.3); }
            100% { box-shadow: 0 0 15px rgba(0, 255, 255, 0.7); }
        }
        
        .color-grid.seamless {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 0;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
        }
        
        .color-square.seamless {
            height: 80px;
            border-radius: 0;
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
            animation: fadeIn 0.5s ease-out forwards;
            opacity: 0;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        }
        
        .color-square.seamless:hover {
            transform: scale(1.1);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.7);
            z-index: 10;
        }
        
        .grid-tooltip {
            position: absolute;
            background-color: rgba(0, 0, 0, 0.8);
            color: cyan;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 12px;
            pointer-events: none;
            z-index: 10;
            border: 1px solid rgba(0, 255, 255, 0.3);
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
        
        .notification {
            position: fixed;
            bottom: -50px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 255, 255, 0.1);
            border: 1px solid rgba(0, 255, 255, 0.3);
            padding: 10px 20px;
            border-radius: 5px;
            color: cyan;
            font-family: monospace;
            transition: bottom 0.3s ease;
            z-index: 1000;
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
        
        .notification.show {
            bottom: 20px;
            animation: slide-up 0.3s ease forwards, glow-pulse 2s infinite alternate;
        }
        
        @keyframes slide-up {
            from { bottom: -50px; opacity: 0; }
            to { bottom: 20px; opacity: 1; }
        }
        
        @keyframes glow-pulse {
            0% { box-shadow: 0 0 5px rgba(0, 255, 255, 0.3); }
            100% { box-shadow: 0 0 15px rgba(0, 255, 255, 0.7); }
        }
        
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        
        .modal-content {
            background-color: #111;
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 10px;
            padding: 20px;
            max-width: 500px;
            width: 90%;
            color: cyan;
            position: relative;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
            animation: modal-appear 0.3s ease-out;
        }
        
        @keyframes modal-appear {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        
        .modal-buttons {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 20px;
        }
        
        /* Mobile adjustments */
        @media (max-width: 600px) {
            .input-container {
                grid-template-columns: 40px 1fr !important;
                grid-template-rows: auto auto !important;
            }
            
            #add-btn {
                grid-column: 1 / 3;
                width: 100%;
                margin-top: 10px;
            }
            
            .view-controls {
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .view-btn {
                margin-bottom: 5px;
            }
        }
    `;
    document.head.appendChild(styleSheet);
}

// Update color preview and detect format
function updatePreviewAndFormat() {
    const code = colorInput.value.trim();
    
    // Reset preview and format display
    preview.style.backgroundColor = '';
    formatDisplay.textContent = '';
    
    if (!code) return;
    
    // Normalize input by removing '#' if present for hex codes
    const normalizedCode = code.startsWith('#') ? code.substring(1) : code;
    
    // Detect format
    const format = detectFormat(normalizedCode);
    if (format) {
        formatDisplay.textContent = format.name + " FORMAT";
        
        // Convert to hex for preview
        const hexColor
