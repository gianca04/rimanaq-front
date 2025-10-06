@extends('layouts.app')

@section('title', 'Editar gesto')

@section('styles')
<link rel="stylesheet" href="{{ asset('css/reconocimiento.css') }}">
@endsection

@section('content')
<div class="py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="mb-0">Editar Gesto <small class="text-muted">(ID: {{ $id }})</small></h3>
        <a href="{{ route('web.gestures.index') }}" class="btn btn-secondary">Volver a Gestos</a>
    </div>

    <div class="card">
        <div class="container">
            <!-- Mensaje informativo sobre normalización -->
            <div class="info-banner">
                <div class="info-content">
                    <span class="info-icon">🎯</span>
                    <div class="info-text">
                        <strong>Sistema Mejorado:</strong> Ahora usa normalización de landmarks para reconocimiento independiente del tamaño y posición de la mano.
                    </div>
                    <button id="showNormalizationBannerBtn" class="info-btn">Ver Detalles</button>
                </div>
            </div>

            <!-- Selector de Modo -->
            <div class="mode-selector">
                <button id="captureMode" class="mode-btn active">Modo Registro</button>
                <button id="practiceMode" class="mode-btn">Modo Práctica</button>
                <button id="recognizeMode" class="mode-btn">Modo Reconocimiento</button>
            </div>

            <!-- Modo Captura -->
            <div id="captureModeContent" class="mode-content active">
                <div class="controls">
                    <div class="input-group">
                        <label for="gestureName">Nombre del Gesto:</label>
                        <input type="text" id="gestureName" placeholder="Ej: ¿Dónde vives?, Hola, Gracias">
                    </div>
                    <button id="startSequenceBtn" class="btn btn-primary">Iniciar Secuencia</button>
                    <button id="captureBtn" class="btn btn-success" disabled>Capturar Frame <span
                            id="frameNumber">1</span></button>
                    <button id="finishSequenceBtn" class="btn btn-success" disabled>Finalizar Secuencia</button>
                    <button id="clearFramesBtn" class="btn btn-danger">Limpiar Frames</button>
                </div>
                <div class="sequence-status" id="sequenceStatus">
                    <p><strong>Estado:</strong> <span id="sequenceStatusText">Presiona "Iniciar Secuencia" para
                            comenzar</span></p>
                    <div class="progress-bar hidden" id="progressContainer">
                        <div class="progress-fill" id="progressFill"></div>
                        <span class="progress-text" id="progressText">0/0</span>
                    </div>
                </div>
            </div>

            <!-- Modo Práctica -->
            <div id="practiceModeContent" class="mode-content">
                <div class="controls">
                    <div class="input-group">
                        <label for="practiceGesture">Seleccionar Gesto:</label>
                        <select id="practiceGesture">
                            <option value="">-- Selecciona un gesto --</option>
                        </select>
                    </div>
                    <button id="startPracticeBtn" class="btn btn-primary">Iniciar Práctica</button>
                    <button id="stopPracticeBtn" class="btn btn-danger" disabled>Detener Práctica</button>
                    <div class="input-group">
                        <label for="similarityThreshold">Umbral de Similitud:</label>
                        <input type="range" id="similarityThreshold" min="70" max="95" step="5" value="80">
                        <span id="thresholdValue">80%</span>
                    </div>
                </div>
                <div class="practice-status" id="practiceStatus">
                    <div class="current-frame-indicator" id="currentFrameIndicator">
                        <h3>Frame Objetivo: <span id="targetFrameNumber">-</span></h3>
                        <div class="frame-progress" id="frameProgress"></div>
                    </div>
                    <div class="similarity-display" id="similarityDisplay">
                        <h4>Similitud Actual: <span id="currentSimilarity">0%</span></h4>
                        <div class="similarity-bar-container">
                            <div class="similarity-bar" id="similarityBar"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modo Reconocimiento -->
            <div id="recognizeModeContent" class="mode-content">
                <div class="controls">
                    <button id="startRecognitionBtn" class="btn btn-primary">Iniciar Reconocimiento</button>
                    <button id="stopRecognitionBtn" class="btn btn-danger" disabled>Detener</button>
                    <div class="input-group">
                        <label for="toleranceSlider">Tolerancia:</label>
                        <input type="range" id="toleranceSlider" min="0.1" max="0.9" step="0.1" value="0.7">
                        <span id="toleranceValue">70%</span>
                    </div>
                </div>
            </div>
            <div class="video-container">
                <video id="video" autoplay muted></video>
                <canvas id="outputCanvas"></canvas>
            </div>

            <div class="status">
                <p>Estado: <span id="statusText">Listo para capturar</span></p>
                <p class="frame-count">Frames capturados: <span id="frameCount">0</span></p>
            </div>

            <!-- Resultados de Reconocimiento -->
            <div id="recognitionResults" class="recognition-results">
                <h3>Resultado del Reconocimiento</h3>
                <div class="result-display">
                    <div class="recognized-gesture">
                        <span id="recognizedGesture">---</span>
                    </div>
                    <div class="confidence-display">
                        <div class="confidence-bar-container">
                            <div class="confidence-bar" id="confidenceBar"></div>
                        </div>
                        <span id="confidenceText">0%</span>
                    </div>
                </div>
            </div>

            <div class="gesture-info" id="captureInfo">
                <h3>Frames del Gesto Actual</h3>
                <div id="currentFrames">No hay frames capturados</div>
            </div>

            <!-- Información del gesto actual -->
            <div class="current-gesture-info" id="currentGestureInfo">
                <h3>Información del Gesto</h3>
                <div id="gestureDetails" class="gesture-details">
                    <p><strong>Nombre:</strong> <span id="currentGestureName">Cargando...</span></p>
                    <p><strong>Lección:</strong> <span id="currentGestureLesson">Cargando...</span></p>
                    <p><strong>Frames:</strong> <span id="currentGestureFrames">Cargando...</span></p>
                    <p><strong>Tipo:</strong> <span id="currentGestureType">Cargando...</span></p>
                </div>
            </div>

            <div class="edit-section">
                <button id="updateGestureBtn" class="btn btn-success">💾 Actualizar Gesto</button>
                <button id="exportCurrentBtn" class="btn btn-primary">📤 Exportar Gesto Actual</button>
                <button id="showNormalizationBtn" class="btn" style="background: #6f42c1; color: white;">Ver Normalización</button>
            </div>

            <!-- Modal de información de normalización -->
            <div id="normalizationModal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>🔬 Normalización de Landmarks</h2>
                    <div class="normalization-info">
                        <h3>¿Por qué normalizar?</h3>
                        <p>La normalización hace que el reconocimiento de gestos sea <strong>independiente del tamaño y posición de la mano</strong>.</p>

                        <h3>Proceso de normalización:</h3>
                        <ol>
                            <li><strong>Calcular el centroide:</strong> Promedio de las coordenadas x e y de los 21 puntos de la mano</li>
                            <li><strong>Trasladar al centro:</strong> Restar el centroide a cada punto (elimina dependencia de posición)</li>
                            <li><strong>Escalar:</strong> Dividir por la distancia máxima al centro (elimina dependencia de tamaño)</li>
                        </ol>

                        <h3>Beneficios:</h3>
                        <ul>
                            <li>✅ Funciona con manos de cualquier tamaño</li>
                            <li>✅ Funciona en cualquier posición de la cámara</li>
                            <li>✅ Mayor precisión en el reconocimiento</li>
                            <li>✅ Gestos más consistentes</li>
                        </ul>

                        <div class="normalization-demo">
                            <h3>Ejemplo visual:</h3>
                            <p><strong>Sin normalización:</strong> Una mano pequeña en la esquina vs una mano grande en el centro = diferentes</p>
                            <p><strong>Con normalización:</strong> Ambas manos se ven iguales al sistema ✨</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"></script>

<!-- Scripts del sistema organizados por funcionalidad -->
<script src="{{ asset('js/auth-helper.js') }}"></script>
<script src="{{ asset('js/edit_reconocimiento/landmark-normalizer.js') }}"></script>
<script src="{{ asset('js/edit_reconocimiento/data-manager.js') }}"></script>
<script src="{{ asset('js/edit_reconocimiento/capture-manager.js') }}"></script>
<script src="{{ asset('js/edit_reconocimiento/practice-manager.js') }}"></script>
<script src="{{ asset('js/edit_reconocimiento/recognition-manager.js') }}"></script>
<script src="{{ asset('js/edit_reconocimiento/ui-manager.js') }}"></script>
<script src="{{ asset('js/edit_reconocimiento/mediapipe-config.js') }}"></script>
<script src="{{ asset('js/edit_reconocimiento/main.js') }}"></script>

<script type="module">
    // Configuración inicial para edición
    const gestureId = "{{ $id }}";
    const token = localStorage.getItem('auth_token') || '';
    let currentGestureData = null;

    // Referencias DOM
    const gestureNameInput = document.getElementById('gestureName');
    const currentGestureName = document.getElementById('currentGestureName');
    const currentGestureLesson = document.getElementById('currentGestureLesson');
    const currentGestureFrames = document.getElementById('currentGestureFrames');
    const currentGestureType = document.getElementById('currentGestureType');
    const updateGestureBtn = document.getElementById('updateGestureBtn');
    const exportCurrentBtn = document.getElementById('exportCurrentBtn');

    // Función para cargar los datos del gesto desde la API
    async function loadGestureData() {
        try {
            console.log('Cargando gesto ID:', gestureId);
            
            const response = await fetch(`/api/gestures/${gestureId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success && result.data) {
                currentGestureData = result.data;
                displayGestureInfo(result.data);
                loadGestureIntoInterface(result.data);
                return true;
            } else {
                throw new Error('No se pudieron cargar los datos del gesto');
            }
        } catch (error) {
            console.error('Error loading gesture:', error);
            displayError('Error al cargar el gesto: ' + error.message);
            return false;
        }
    }

    // Función para mostrar la información del gesto
    function displayGestureInfo(gestureData) {
        const originalName = gestureData.gesture_data?.name || 'Sin nombre';
        const originalFrameCount = gestureData.gesture_data?.frameCount || 0;
        
        currentGestureName.textContent = originalName;
        currentGestureLesson.textContent = gestureData.lesson?.name || 'Sin lección';
        currentGestureFrames.textContent = originalFrameCount;
        currentGestureType.textContent = gestureData.gesture_data?.isSequential ? 'Secuencial' : 'Estático';
        
        // También actualizar el input del nombre
        if (gestureNameInput && gestureData.gesture_data?.name) {
            gestureNameInput.value = gestureData.gesture_data.name;
        }

        // Función para actualizar dinámicamente la información cuando hay cambios
        window.updateGestureInfoDisplay = () => {
            const currentName = gestureNameInput?.value?.trim() || originalName;
            const currentFrameCount = window.gestureSystem?.currentFrames?.length || 0;
            const hasNameChange = currentName !== originalName;
            const hasFrameChange = currentFrameCount > 0 && currentFrameCount !== originalFrameCount;
            
            // Actualizar nombre con indicador de cambio
            currentGestureName.innerHTML = hasNameChange 
                ? `${currentName} <small style="color: #28a745;">(modificado)</small>`
                : currentName;
            
            // Actualizar frames con indicador de cambio
            if (hasFrameChange) {
                currentGestureFrames.innerHTML = `${currentFrameCount} <small style="color: #28a745;">(${originalFrameCount} original)</small>`;
            } else if (currentFrameCount === 0) {
                currentGestureFrames.textContent = originalFrameCount;
            }
            
            // Actualizar botón de actualizar
            const updateBtn = document.getElementById('updateGestureBtn');
            if (updateBtn) {
                const hasChanges = hasNameChange || hasFrameChange;
                updateBtn.disabled = !hasChanges;
                updateBtn.textContent = hasChanges 
                    ? '💾 Actualizar Gesto (Cambios detectados)' 
                    : '💾 Actualizar Gesto';
                updateBtn.style.background = hasChanges ? '#28a745' : '#6c757d';
            }
        };
        
        // Llamar la función inicialmente
        window.updateGestureInfoDisplay();
    }

    // Función para cargar el gesto en la interfaz de edición
    function loadGestureIntoInterface(gestureData) {
        if (window.gestureSystem && gestureData.gesture_data) {
            // Limpiar frames actuales
            window.gestureSystem.currentFrames = [];
            
            // Cargar los frames del gesto
            if (gestureData.gesture_data.frames) {
                window.gestureSystem.currentFrames = [...gestureData.gesture_data.frames];
            }
            
            // Cargar el gesto temporalmente en savedGestures para aprovechar el sistema de cache
            const tempGesture = {
                id: gestureData.gesture_data.id,
                name: gestureData.gesture_data.name,
                frames: gestureData.gesture_data.frames,
                frameCount: gestureData.gesture_data.frameCount,
                isSequential: gestureData.gesture_data.isSequential,
                createdAt: gestureData.created_at || new Date().toISOString(),
                // Marcador para identificar que es temporal
                isTemporary: true,
                originalDbId: gestureData.id,
                lessonId: gestureData.lesson_id
            };
            
            // Agregar temporalmente al sistema (solo para práctica/reconocimiento)
            window.gestureSystem.savedGestures = [tempGesture];
            
            // Establecer el gesto actual en el data manager
            if (window.gestureSystem.dataManager) {
                window.gestureSystem.dataManager.setCurrentEditingGesture(gestureData);
            }
            
            // Actualizar la UI
            if (window.gestureSystem.uiManager) {
                window.gestureSystem.uiManager.updateDisplay();
            }
            
            // Actualizar lista de práctica si existe
            if (window.gestureSystem.practiceManager) {
                window.gestureSystem.practiceManager.updatePracticeGestureList();
            }
            
            // Actualizar estado
            if (window.gestureSystem.statusText) {
                window.gestureSystem.statusText.textContent = `Gesto "${gestureData.gesture_data.name}" cargado para edición`;
            }

            console.log('Gesto cargado en interfaz:', gestureData.gesture_data);
            console.log('Gesto temporal creado:', tempGesture);
        }
    }

    // Función para mostrar errores
    function displayError(message) {
        currentGestureName.textContent = 'Error';
        currentGestureName.className = 'error-state';
        currentGestureLesson.textContent = message;
        currentGestureFrames.textContent = '0';
        currentGestureType.textContent = 'Error';
    }

    // Función para actualizar el gesto
    async function updateGesture() {
        if (!currentGestureData) {
            alert('No hay datos de gesto para actualizar');
            return;
        }

        const gestureName = gestureNameInput?.value?.trim() || currentGestureData.gesture_data.name;
        
        if (!gestureName) {
            alert('El nombre del gesto es obligatorio');
            return;
        }

        // Verificar si hay cambios
        const originalName = currentGestureData.gesture_data.name;
        const originalFrameCount = currentGestureData.gesture_data.frameCount;
        const currentFrameCount = window.gestureSystem?.currentFrames?.length || 0;
        
        const hasNameChange = gestureName !== originalName;
        const hasFrameChange = currentFrameCount > 0 && currentFrameCount !== originalFrameCount;
        
        if (!hasNameChange && !hasFrameChange) {
            alert('No se detectaron cambios para guardar');
            return;
        }

        // Determinar qué frames usar
        const framesToSave = hasFrameChange 
            ? window.gestureSystem.currentFrames 
            : currentGestureData.gesture_data.frames;
            
        const frameCountToSave = hasFrameChange 
            ? window.gestureSystem.currentFrames.length 
            : currentGestureData.gesture_data.frameCount;

        const formData = {
            lesson_id: currentGestureData.lesson_id,
            gesture_data: {
                id: currentGestureData.gesture_data.id,
                name: gestureName.toUpperCase(),
                frames: framesToSave,
                frameCount: frameCountToSave,
                isSequential: currentGestureData.gesture_data.isSequential
            }
        };

        try {
            updateGestureBtn.textContent = '⏳ Actualizando...';
            updateGestureBtn.disabled = true;

            const response = await fetch(`/api/gestures/${gestureId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const changesSummary = [];
                if (hasNameChange) changesSummary.push(`nombre: "${originalName}" → "${gestureName}"`);
                if (hasFrameChange) changesSummary.push(`frames: ${originalFrameCount} → ${frameCountToSave}`);
                
                alert(`Gesto actualizado exitosamente!\n\nCambios aplicados:\n• ${changesSummary.join('\n• ')}`);
                window.location.href = '/dashboard/gestures';
            } else {
                alert('Error: ' + (result.message || 'Error al actualizar el gesto'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error: ' + error.message);
        } finally {
            updateGestureBtn.textContent = '💾 Actualizar Gesto';
            updateGestureBtn.disabled = false;
        }
    }

    // Función para exportar el gesto actual
    function exportCurrentGesture() {
        if (!currentGestureData) {
            alert('No hay gesto cargado para exportar');
            return;
        }

        const gestureToExport = {
            version: "1.0",
            createdAt: new Date().toISOString(),
            gesture: {
                id: currentGestureData.gesture_data.id,
                name: currentGestureData.gesture_data.name,
                frames: window.gestureSystem?.currentFrames || currentGestureData.gesture_data.frames,
                frameCount: window.gestureSystem?.currentFrames?.length || currentGestureData.gesture_data.frameCount,
                isSequential: currentGestureData.gesture_data.isSequential,
                createdAt: currentGestureData.created_at
            }
        };

        const blob = new Blob([JSON.stringify(gestureToExport, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `gesto_${currentGestureData.gesture_data.name}_${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        if (window.gestureSystem?.statusText) {
            window.gestureSystem.statusText.textContent = `Gesto "${currentGestureData.gesture_data.name}" exportado`;
        }
    }

    // Event listeners
    updateGestureBtn?.addEventListener('click', updateGesture);
    exportCurrentBtn?.addEventListener('click', exportCurrentGesture);

    // Listener para cambios en el nombre
    if (gestureNameInput) {
        gestureNameInput.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
            // Actualizar información cuando cambie el nombre
            if (window.updateGestureInfoDisplay) {
                window.updateGestureInfoDisplay();
            }
        });
    }

    // Cargar datos cuando la página esté lista
    document.addEventListener('DOMContentLoaded', () => {
        // Esperar un momento para que se inicialice gestureSystem
        setTimeout(() => {
            loadGestureData();
        }, 1000);
    });

    // También intentar cargar después de que se inicialice gestureSystem
    window.addEventListener('gestureSystemReady', () => {
        if (!currentGestureData) {
            loadGestureData();
        }
    });
</script>
@endsection