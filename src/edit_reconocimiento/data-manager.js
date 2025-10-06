// === FUNCIONES PARA EDITAR GESTOS DESDE BASE DE DATOS ===

class DataManager {
  constructor(gestureSystem) {
    this.gestureSystem = gestureSystem;
    this.apiBaseUrl = '/api';
    this.authToken = this.getAuthToken();
    this.currentEditingGesture = null; // Gesto que se está editando
  }

  getAuthToken() {
    // Intentar múltiples fuentes para el token
    let token = localStorage.getItem('auth_token') || 
                sessionStorage.getItem('auth_token') || 
                document.querySelector('meta[name="api-token"]')?.getAttribute('content');
    
    // Para edición, es menos crítico tener token si la app no lo requiere
    if (!token) {
      console.warn('No se encontró token de autenticación. Continuando sin autenticación.');
    }
    
    return token;
  }

  // Establecer el gesto que se está editando
  setCurrentEditingGesture(gestureData) {
    this.currentEditingGesture = gestureData;
    console.log('Gesto establecido para edición:', gestureData);
  }

  // Exportar el gesto actual que se está editando
  exportCurrentGesture() {
    if (!this.currentEditingGesture) {
      alert("No hay gesto cargado para exportar.");
      return;
    }

    // Determinar si usar los frames actuales (modificados) o los originales
    const hasModifiedFrames = this.gestureSystem.currentFrames && this.gestureSystem.currentFrames.length > 0;
    const framesToExport = hasModifiedFrames ? this.gestureSystem.currentFrames : this.currentEditingGesture.gesture_data.frames;
    const frameCountToExport = hasModifiedFrames ? this.gestureSystem.currentFrames.length : this.currentEditingGesture.gesture_data.frameCount;
    
    // Obtener el nombre actualizado del input si existe
    const gestureNameInput = document.getElementById('gestureName');
    const gestureName = (gestureNameInput?.value?.trim()) || this.currentEditingGesture.gesture_data.name;

    const gestureData = {
      version: "1.0",
      createdAt: new Date().toISOString(),
      gesture: {
        id: this.currentEditingGesture.gesture_data.id,
        name: gestureName,
        frames: framesToExport,
        frameCount: frameCountToExport,
        isSequential: this.currentEditingGesture.gesture_data.isSequential,
        createdAt: this.currentEditingGesture.created_at,
        // Información adicional sobre la edición
        editInfo: {
          originalDbId: this.currentEditingGesture.id,
          hasModifications: hasModifiedFrames,
          exportedAt: new Date().toISOString()
        }
      }
    };

    const blob = new Blob([JSON.stringify(gestureData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    // Nombre del archivo más descriptivo
    const suffix = hasModifiedFrames ? "modificado" : "original";
    a.download = `gesto_${gestureName}_${suffix}_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    const statusMsg = hasModifiedFrames 
      ? `Gesto "${gestureName}" exportado con modificaciones` 
      : `Gesto "${gestureName}" exportado (original)`;
    
    this.gestureSystem.statusText.textContent = statusMsg;
  }

  exportAllGestures() {
    if (this.gestureSystem.savedGestures.length === 0) {
      alert("No hay gestos para exportar.");
      return;
    }

    this.gestureSystem.savedGestures.forEach((gesture, index) => {
      setTimeout(() => {
        this.exportGesture(index);
      }, index * 100); // Pequeño delay para evitar problemas con múltiples descargas
    });

    this.gestureSystem.statusText.textContent = `${this.gestureSystem.savedGestures.length} gestos exportados individualmente`;
  }

  importGesture(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        // Validar si es un gesto individual o un dataset
        let gestureToImport = null;
        
        if (data.gesture) {
          // Formato individual
          gestureToImport = data.gesture;
        } else if (data.gestures && Array.isArray(data.gestures) && data.gestures.length === 1) {
          // Dataset con un solo gesto
          gestureToImport = data.gestures[0];
        } else if (data.gestures && Array.isArray(data.gestures)) {
          // Dataset múltiple - preguntar si quiere importar todos
          const importAll = confirm(
            `Este archivo contiene ${data.gestures.length} gestos. ¿Quieres importar todos? (Cancelar para importar solo el primero)`
          );
          
          if (importAll) {
            return this.importMultipleGestures(data.gestures);
          } else {
            gestureToImport = data.gestures[0];
          }
        } else {
          alert("Formato de archivo inválido. El archivo debe contener un gesto válido.");
          return;
        }

        if (gestureToImport) {
          // Verificar si ya existe un gesto con el mismo nombre
          const existingIndex = this.gestureSystem.savedGestures.findIndex(
            (g) => g.name === gestureToImport.name
          );
          
          if (existingIndex !== -1) {
            const replace = confirm(
              `Ya existe un gesto llamado "${gestureToImport.name}". ¿Quieres reemplazarlo?`
            );
            
            if (replace) {
              this.gestureSystem.savedGestures[existingIndex] = gestureToImport;
            } else {
              return;
            }
          } else {
            this.gestureSystem.savedGestures.push(gestureToImport);
          }

          this.saveSavedGestures();
          this.gestureSystem.uiManager.updateDisplay();
          this.gestureSystem.statusText.textContent = `Gesto "${gestureToImport.name}" importado`;
        }
      } catch (error) {
        alert("Error al leer el archivo. Asegúrate de que sea un archivo JSON válido.");
        console.error("Error importing gesture:", error);
      }
    };
    reader.readAsText(file);

    // Limpiar input para permitir importar el mismo archivo nuevamente
    event.target.value = "";
  }

  importMultipleGestures(gestures) {
    const replace = confirm(
      "¿Quieres reemplazar los gestos actuales? (Cancelar para agregar a los gestos existentes)"
    );

    if (replace) {
      this.gestureSystem.savedGestures = gestures;
    } else {
      // Agregar gestos nuevos, evitando duplicados por nombre
      gestures.forEach((newGesture) => {
        const existingIndex = this.gestureSystem.savedGestures.findIndex(
          (g) => g.name === newGesture.name
        );
        if (existingIndex !== -1) {
          // Reemplazar gesto existente
          this.gestureSystem.savedGestures[existingIndex] = newGesture;
        } else {
          // Agregar nuevo gesto
          this.gestureSystem.savedGestures.push(newGesture);
        }
      });
    }

    this.saveSavedGestures();
    this.gestureSystem.uiManager.updateDisplay();
    this.gestureSystem.statusText.textContent = `${gestures.length} gestos importados`;
  }

  // === FUNCIONES PARA API (SIMPLIFICADAS PARA EDICIÓN) ===

  async loadCourses() {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Solo agregar Authorization si hay token
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(`${this.apiBaseUrl}/courses`, {
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error loading courses:', error);
      return [];
    }
  }

  async loadLessons(courseId = null) {
    try {
      const url = courseId 
        ? `${this.apiBaseUrl}/courses/${courseId}/lessons`
        : `${this.apiBaseUrl}/lessons`;
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Solo agregar Authorization si hay token
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(url, {
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error loading lessons:', error);
      return [];
    }
  }

  // Función específica para actualizar gestos (PUT)
  async updateGestureInAPI(gestureId, gestureData) {
    try {
      const formData = {
        lesson_id: this.currentEditingGesture?.lesson_id,
        gesture_data: {
          id: gestureData.id,
          name: gestureData.name,
          frames: gestureData.frames,
          frameCount: gestureData.frameCount,
          isSequential: gestureData.isSequential
        }
      };

      const headers = {
        'Content-Type': 'application/json'
      };

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(`${this.apiBaseUrl}/gestures/${gestureId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar el gesto');
      }

      return {
        success: true,
        message: result.message || 'Gesto actualizado exitosamente',
        data: result.data
      };
    } catch (error) {
      console.error('Error updating gesture:', error);
      return {
        success: false,
        message: error.message || 'Error al conectar con el servidor'
      };
    }
  }

  async saveGestureToAPI(gestureData, lessonId) {
    try {
      const formData = {
        lesson_id: parseInt(lessonId),
        gesture_data: {
          id: gestureData.id,
          name: gestureData.name,
          frames: gestureData.frames,
          frameCount: gestureData.frameCount,
          isSequential: gestureData.isSequential
        }
      };

      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Solo agregar Authorization si hay token
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(`${this.apiBaseUrl}/gestures`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al guardar el gesto');
      }

      return {
        success: true,
        message: result.message || 'Gesto guardado exitosamente',
        data: result.data
      };
    } catch (error) {
      console.error('Error saving gesture to API:', error);
      return {
        success: false,
        message: error.message || 'Error al conectar con el servidor'
      };
    }
  }

  showSaveGestureModal(gestureIndex) {
    if (!this.checkAuthToken()) {
      return;
    }

    if (this.gestureSystem.savedGestures.length === 0) {
      alert("No hay gestos para guardar.");
      return;
    }

    if (gestureIndex < 0 || gestureIndex >= this.gestureSystem.savedGestures.length) {
      alert("Gesto no válido para guardar.");
      return;
    }

    const gesture = this.gestureSystem.savedGestures[gestureIndex];
    
    // Crear modal dinámicamente
    const modalHtml = `
      <div id="saveGestureModal" class="modal" style="display: block;">
        <div class="modal-content">
          <span class="close" onclick="this.closeSaveModal()">&times;</span>
          <h2>💾 Guardar Gesto en Base de Datos</h2>
          <form id="saveGestureForm">
            <div class="form-group">
              <label for="gestureNameDB">Nombre del Gesto:</label>
              <input type="text" id="gestureNameDB" value="${gesture.name}" readonly>
            </div>
            
            <div class="form-group">
              <label for="coursesSelect">Curso:</label>
              <select id="coursesSelect" required>
                <option value="">Seleccionar curso...</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="lessonsSelect">Lección:</label>
              <select id="lessonsSelect" required disabled>
                <option value="">Primero selecciona un curso</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Información del gesto:</label>
              <div class="gesture-summary">
                <p><strong>Frames:</strong> ${gesture.frameCount}</p>
                <p><strong>Tipo:</strong> ${gesture.isSequential ? 'Secuencial' : 'Estático'}</p>
                <p><strong>Creado:</strong> ${new Date(gesture.createdAt).toLocaleString()}</p>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-success">💾 Guardar en BD</button>
              <button type="button" class="btn btn-secondary" onclick="this.closeSaveModal()">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Agregar modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Configurar event listeners
    this.setupSaveModalEventListeners(gesture);
    
    // Cargar cursos
    this.loadCoursesForModal();
  }

  setupSaveModalEventListeners(gesture) {
    const modal = document.getElementById('saveGestureModal');
    const form = document.getElementById('saveGestureForm');
    const coursesSelect = document.getElementById('coursesSelect');
    const lessonsSelect = document.getElementById('lessonsSelect');

    // Cerrar modal
    window.closeSaveModal = () => {
      modal.remove();
    };

    // Cerrar con escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal) {
        modal.remove();
      }
    });

    // Cerrar clickeando fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Cambio de curso
    coursesSelect.addEventListener('change', async (e) => {
      const courseId = e.target.value;
      lessonsSelect.disabled = true;
      lessonsSelect.innerHTML = '<option value="">Cargando lecciones...</option>';
      
      if (courseId) {
        const lessons = await this.loadLessons(courseId);
        lessonsSelect.innerHTML = '<option value="">Seleccionar lección...</option>';
        lessons.forEach(lesson => {
          const option = new Option(lesson.name, lesson.id);
          lessonsSelect.appendChild(option);
        });
        lessonsSelect.disabled = false;
      } else {
        lessonsSelect.innerHTML = '<option value="">Primero selecciona un curso</option>';
      }
    });

    // Submit del formulario
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const lessonId = lessonsSelect.value;
      if (!lessonId) {
        alert('Por favor selecciona una lección');
        return;
      }

      // Mostrar loading
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = '⏳ Guardando...';
      submitBtn.disabled = true;

      try {
        const result = await this.saveGestureToAPI(gesture, lessonId);
        
        if (result.success) {
          alert(result.message);
          modal.remove();
          this.gestureSystem.statusText.textContent = `Gesto "${gesture.name}" guardado en la base de datos`;
        } else {
          alert('Error: ' + result.message);
        }
      } catch (error) {
        alert('Error: ' + error.message);
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  async loadCoursesForModal() {
    const coursesSelect = document.getElementById('coursesSelect');
    coursesSelect.innerHTML = '<option value="">Cargando cursos...</option>';
    
    try {
      const courses = await this.loadCourses();
      coursesSelect.innerHTML = '<option value="">Seleccionar curso...</option>';
      
      courses.forEach(course => {
        const option = new Option(course.name, course.id);
        coursesSelect.appendChild(option);
      });
      
      if (courses.length === 0) {
        coursesSelect.innerHTML = '<option value="">No hay cursos disponibles</option>';
      }
    } catch (error) {
      coursesSelect.innerHTML = '<option value="">Error al cargar cursos</option>';
      console.error('Error:', error);
    }
  }

  showSaveAllGesturesModal() {
    if (!this.checkAuthToken()) {
      return;
    }

    if (this.gestureSystem.savedGestures.length === 0) {
      alert("No hay gestos para guardar.");
      return;
    }

    // Crear modal para guardar todos los gestos
    const modalHtml = `
      <div id="saveAllGesturesModal" class="modal" style="display: block;">
        <div class="modal-content">
          <span class="close" onclick="this.closeAllSaveModal()">&times;</span>
          <h2>💾 Guardar Todos los Gestos en Base de Datos</h2>
          <div class="gestures-list">
            <h4>Gestos a guardar: ${this.gestureSystem.savedGestures.length}</h4>
            <ul style="max-height: 200px; overflow-y: auto; background: #f8f9fa; padding: 10px; border-radius: 5px;">
              ${this.gestureSystem.savedGestures.map(gesture => 
                `<li><strong>${gesture.name}</strong> - ${gesture.frameCount} frames</li>`
              ).join('')}
            </ul>
          </div>
          
          <form id="saveAllGesturesForm">
            <div class="form-group">
              <label for="coursesSelectAll">Curso:</label>
              <select id="coursesSelectAll" required>
                <option value="">Seleccionar curso...</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="lessonsSelectAll">Lección:</label>
              <select id="lessonsSelectAll" required disabled>
                <option value="">Primero selecciona un curso</option>
              </select>
            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn btn-success">💾 Guardar Todos</button>
              <button type="button" class="btn btn-secondary" onclick="this.closeAllSaveModal()">Cancelar</button>
            </div>
          </form>
          
          <div id="saveAllProgress" style="display: none;">
            <h4>Progreso de guardado:</h4>
            <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-top: 10px;">
              <div id="progressBar" style="background: #e9ecef; height: 20px; border-radius: 10px; overflow: hidden;">
                <div id="progressFill" style="background: #28a745; height: 100%; width: 0%; transition: width 0.3s;"></div>
              </div>
              <p id="progressText" style="text-align: center; margin: 10px 0;">0 / ${this.gestureSystem.savedGestures.length}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Agregar modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Configurar event listeners
    this.setupSaveAllModalEventListeners();
    
    // Cargar cursos
    this.loadCoursesForAllModal();
  }

  setupSaveAllModalEventListeners() {
    const modal = document.getElementById('saveAllGesturesModal');
    const form = document.getElementById('saveAllGesturesForm');
    const coursesSelect = document.getElementById('coursesSelectAll');
    const lessonsSelect = document.getElementById('lessonsSelectAll');

    // Cerrar modal
    window.closeAllSaveModal = () => {
      modal.remove();
    };

    // Cerrar con escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal) {
        modal.remove();
      }
    });

    // Cerrar clickeando fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Cambio de curso
    coursesSelect.addEventListener('change', async (e) => {
      const courseId = e.target.value;
      lessonsSelect.disabled = true;
      lessonsSelect.innerHTML = '<option value="">Cargando lecciones...</option>';
      
      if (courseId) {
        const lessons = await this.loadLessons(courseId);
        lessonsSelect.innerHTML = '<option value="">Seleccionar lección...</option>';
        lessons.forEach(lesson => {
          const option = new Option(lesson.name, lesson.id);
          lessonsSelect.appendChild(option);
        });
        lessonsSelect.disabled = false;
      } else {
        lessonsSelect.innerHTML = '<option value="">Primero selecciona un curso</option>';
      }
    });

    // Submit del formulario
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const lessonId = lessonsSelect.value;
      if (!lessonId) {
        alert('Por favor selecciona una lección');
        return;
      }

      await this.saveAllGesturesToAPI(lessonId, modal);
    });
  }

  async saveAllGesturesToAPI(lessonId, modal) {
    const form = document.getElementById('saveAllGesturesForm');
    const progressDiv = document.getElementById('saveAllProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    // Mostrar progreso y ocultar formulario
    form.style.display = 'none';
    progressDiv.style.display = 'block';

    let savedCount = 0;
    let errorCount = 0;
    const totalGestures = this.gestureSystem.savedGestures.length;

    for (let i = 0; i < this.gestureSystem.savedGestures.length; i++) {
      const gesture = this.gestureSystem.savedGestures[i];
      
      try {
        const result = await this.saveGestureToAPI(gesture, lessonId);
        
        if (result.success) {
          savedCount++;
        } else {
          errorCount++;
          console.error(`Error saving ${gesture.name}:`, result.message);
        }
      } catch (error) {
        errorCount++;
        console.error(`Error saving ${gesture.name}:`, error);
      }

      // Actualizar progreso
      const progress = ((i + 1) / totalGestures) * 100;
      progressFill.style.width = progress + '%';
      progressText.textContent = `${savedCount} guardados, ${errorCount} errores / ${totalGestures} gestos`;
      
      // Pequeño delay para visualizar el progreso
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Mostrar resultado final
    const successRate = (savedCount / totalGestures) * 100;
    let message = `Proceso completado:\n`;
    message += `✅ ${savedCount} gestos guardados exitosamente\n`;
    if (errorCount > 0) {
      message += `❌ ${errorCount} gestos con errores\n`;
    }
    message += `📊 Tasa de éxito: ${successRate.toFixed(1)}%`;

    alert(message);
    modal.remove();
    
    this.gestureSystem.statusText.textContent = `Guardado masivo completado: ${savedCount}/${totalGestures} gestos`;
  }

  async loadCoursesForAllModal() {
    const coursesSelect = document.getElementById('coursesSelectAll');
    coursesSelect.innerHTML = '<option value="">Cargando cursos...</option>';
    
    try {
      const courses = await this.loadCourses();
      coursesSelect.innerHTML = '<option value="">Seleccionar curso...</option>';
      
      courses.forEach(course => {
        const option = new Option(course.name, course.id);
        coursesSelect.appendChild(option);
      });
      
      if (courses.length === 0) {
        coursesSelect.innerHTML = '<option value="">No hay cursos disponibles</option>';
      }
    } catch (error) {
      coursesSelect.innerHTML = '<option value="">Error al cargar cursos</option>';
      console.error('Error:', error);
    }
  }
}
