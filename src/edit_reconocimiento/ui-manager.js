// === FUNCIONES DE UI PARA EDICIÓN DE GESTOS ===

class UIManager {
  constructor(gestureSystem) {
    this.gestureSystem = gestureSystem;
  }

  // Función para limpiar los frames actuales (no eliminar el gesto de BD)
  clearCurrentFrames() {
    if (confirm("¿Estás seguro de que quieres limpiar los frames capturados? Esto no afectará el gesto original en la base de datos.")) {
      this.gestureSystem.currentFrames = [];
      this.gestureSystem.captureManager.resetSequenceState();
      this.updateDisplay();
      this.gestureSystem.statusText.textContent = "Frames limpiados - puedes capturar nuevos frames";
    }
  }

  // === FUNCIONES DE MODO ===
  switchMode(mode) {
    this.gestureSystem.currentMode = mode;

    // Detener cualquier proceso activo
    this.gestureSystem.recognitionManager.stopRecognition();
    this.gestureSystem.practiceManager.stopPractice();
    this.gestureSystem.captureManager.resetSequenceState();

    // Actualizar botones de modo
    document
      .querySelectorAll(".mode-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelectorAll(".mode-content")
      .forEach((content) => content.classList.remove("active"));

    // Activar modo seleccionado
    document.getElementById(mode + "Mode").classList.add("active");
    document.getElementById(mode + "ModeContent").classList.add("active");

    // Mostrar/ocultar elementos según el modo
    if (mode === "capture") {
      document.getElementById("captureInfo").style.display = "block";
      // En edición no mostramos la lista de gestos guardados
      const gestureListSection = document.getElementById("gestureListSection");
      if (gestureListSection) {
        gestureListSection.style.display = "none";
      }
      document.getElementById("recognitionResults").classList.remove("active");
      this.gestureSystem.statusText.textContent =
        "Modo edición activado - Modifica el gesto capturando nuevos frames";
    } else if (mode === "practice") {
      document.getElementById("captureInfo").style.display = "none";
      const gestureListSection = document.getElementById("gestureListSection");
      if (gestureListSection) {
        gestureListSection.style.display = "none";
      }
      document.getElementById("recognitionResults").classList.remove("active");
      this.gestureSystem.practiceManager.updatePracticeGestureList();

      if (this.gestureSystem.savedGestures.length === 0) {
        this.gestureSystem.statusText.textContent = "No hay gestos guardados para practicar";
      } else {
        this.gestureSystem.statusText.textContent =
          "Modo práctica activado - Selecciona un gesto para practicar";
      }
    } else if (mode === "recognize") {
      document.getElementById("captureInfo").style.display = "none";
      document.getElementById("gestureListSection").style.display = "none";
      document.getElementById("recognitionResults").classList.add("active");
      this.gestureSystem.statusText.textContent = "Modo reconocimiento activado";

      if (this.gestureSystem.savedGestures.length === 0) {
        this.gestureSystem.statusText.textContent = "No hay gestos guardados para reconocer";
      }
    }
  }

  updateDisplay() {
    // Actualizar contador de frames
    this.gestureSystem.frameCountSpan.textContent = this.gestureSystem.currentFrames.length;

    // Habilitar/deshabilitar botón de finalizar secuencia
    if (document.getElementById("finishSequenceBtn")) {
      document.getElementById("finishSequenceBtn").disabled =
        this.gestureSystem.currentFrames.length === 0 || !this.gestureSystem.isRecordingSequence;
    }

    // Actualizar lista de frames actuales
    const currentFramesDiv = document.getElementById("currentFrames");
    if (this.gestureSystem.currentFrames.length === 0) {
      currentFramesDiv.innerHTML = "No hay frames capturados";
    } else {
      currentFramesDiv.innerHTML = this.gestureSystem.currentFrames
        .map(
          (frame, index) =>
            `<div class="gesture-item">
                            <span>Frame ${index + 1}</span>
                            <span class="frame-info">${new Date(
                              frame.timestamp
                            ).toLocaleTimeString()}</span>
                        </div>`
        )
        .join("");
    }

    // Actualizar información del gesto si la función está disponible
    if (window.updateGestureInfoDisplay) {
      window.updateGestureInfoDisplay();
    }
  }

  // === FUNCIONES DEL MODAL DE NORMALIZACIÓN ===
  showNormalizationModal() {
    const modal = document.getElementById("normalizationModal");
    modal.style.display = "block";
    
    // Añadir información en tiempo real si hay manos detectadas
    if (this.gestureSystem.lastResults && this.gestureSystem.lastResults.multiHandLandmarks) {
      this.showLiveNormalizationDemo();
    }
  }

  hideNormalizationModal() {
    const modal = document.getElementById("normalizationModal");
    modal.style.display = "none";
  }

  showLiveNormalizationDemo() {
    // Esta función podría mostrar en tiempo real cómo se ven los landmarks 
    // antes y después de la normalización
    console.log("🔬 Demostración de normalización en tiempo real");
    
    if (this.gestureSystem.lastResults && this.gestureSystem.lastResults.multiHandLandmarks) {
      const landmarks = this.gestureSystem.lastResults.multiHandLandmarks[0];
      const centroide = this.gestureSystem.landmarkNormalizer.calcularCentroide(landmarks);
      const landmarksNormalizados = this.gestureSystem.landmarkNormalizer.normalizarLandmarks(landmarks);
      
      console.log("📍 Centroide calculado:", centroide);
      console.log("📊 Landmarks originales (primeros 3):", landmarks.slice(0, 3));
      console.log("🎯 Landmarks normalizados (primeros 3):", landmarksNormalizados.slice(0, 3));
      
      // Mostrar estadísticas en la consola
      const rangoOriginalX = {
        min: Math.min(...landmarks.map(lm => lm.x)),
        max: Math.max(...landmarks.map(lm => lm.x))
      };
      const rangoNormalizadoX = {
        min: Math.min(...landmarksNormalizados.map(lm => lm.x)),
        max: Math.max(...landmarksNormalizados.map(lm => lm.x))
      };
      
      console.log("📏 Rango X original:", rangoOriginalX);
      console.log("🎯 Rango X normalizado:", rangoNormalizadoX);
    }
  }
}
