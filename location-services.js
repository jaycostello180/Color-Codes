/* CSS Styles for location-services.js */
/* You can either include these in your index.html or they'll be added dynamically by the script */

/* Location prompt modal */
.location-prompt-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.location-prompt-modal.show {
  opacity: 1;
}

.location-prompt-content {
  background-color: #111;
  color: cyan;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 10px;
  padding: 20px;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  transform: translateY(20px);
  transition: transform 0.3s ease;
}

.location-prompt-modal.show .location-prompt-content {
  transform: translateY(0);
}

.location-prompt-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.location-btn {
  padding: 10px 20px;
  border-radius: 5px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  background-color: rgba(0, 255, 255, 0.1);
  color: cyan;
  cursor: pointer;
  font-family: monospace;
  transition: all 0.3s ease;
}

.location-btn:hover {
  background-color: rgba(0, 255, 255, 0.2);
  transform: translateY(-2px);
}

.location-btn.allow {
  border-color: rgba(0, 255, 255, 0.5);
}

.location-btn.deny {
  border-color: rgba(255, 100, 100, 0.3);
  color: rgba(255, 100, 100, 0.8);
}

/* Map styles */
.map-container {
  width: 100%;
  height: 600px;
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 255, 255, 0.3);
}

.map-placeholder, .map-loading, .map-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
  color: rgba(0, 255, 255, 0.8);
}

.map-error {
  color: rgba(255, 100, 100, 0.8);
}

/* Override some Leaflet styles to match our theme */
.leaflet-container {
  background: #111;
}

.leaflet-popup-content-wrapper {
  background: rgba(0, 0, 0, 0.8);
  color: cyan;
}

.leaflet-popup-tip {
  background: rgba(0, 0, 0, 0.8);
}
