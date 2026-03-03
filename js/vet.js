function vetModule(supabase, userId) {
    let currentAccess = null;

    async function initVet() {
        setupEventListeners();
        await loadAccessHistory();
    }

    async function loadAccessHistory() {
        try {
            const { data: logs } = await supabase
                .from('access_logs')
                .select(`
                    *,
                    pets (name),
                    profiles (full_name)
                `)
                .eq('vet_id', userId)
                .order('accessed_at', { ascending: false })
                .limit(10);

            const list = document.getElementById('access-history-list');
            if (!list) return;

            if (!logs || logs.length === 0) {
                list.innerHTML = '<p class="text-gray-500 text-center py-4">No hay accesos recientes</p>';
                return;
            }

            list.innerHTML = logs.map(log => `
                <div class="bg-white rounded-lg p-4 shadow-sm">
                    <div class="flex justify-between items-center">
                        <div>
                            <h4 class="font-semibold text-primary">${log.pets?.name || 'Mascota'}</h4>
                            <p class="text-sm text-gray-500">${new Date(log.accessed_at).toLocaleDateString('es-AR')} ${new Date(log.accessed_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <button onclick="vetModule(supabase, '${userId}').addMedicalRecord('${log.pet_id}')" class="btn-success text-sm">
                            Agregar Registro
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading access history:', error);
        }
    }

    function setupEventListeners() {
        const pinForm = document.getElementById('pin-form');
        if (pinForm) {
            pinForm.addEventListener('submit', handlePinSubmit);
        }

        const pinInput = document.getElementById('pin-input');
        if (pinInput) {
            pinInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }
    }

    async function handlePinSubmit(e) {
        e.preventDefault();
        
        const pinInput = document.getElementById('pin-input');
        const pin = pinInput.value.trim();

        if (pin.length !== 6) {
            authModule(supabase).showError('El PIN debe tener 6 dígitos');
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                authModule(supabase).showError('Debes iniciar sesión');
                return;
            }

            pinInput.disabled = true;
            pinInput.value = 'Validando...';

            const response = await fetch(
                `${getSupabaseUrl()}/functions/v1/validate-pin`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({ pin }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.valid) {
                throw new Error(result.error || 'PIN inválido');
            }

            currentAccess = result;
            pinInput.value = '';
            
            showAccessSuccess(result);
            await loadAccessHistory();
        } catch (error) {
            authModule(supabase).showError(error.message);
        } finally {
            pinInput.disabled = false;
            pinInput.value = '';
            pinInput.focus();
        }
    }

    function showAccessSuccess(access) {
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        const pet = access.pet;

        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content p-6">
                    <div class="text-center mb-4">
                        <div class="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                        </div>
                        <h2 class="font-heading font-bold text-2xl text-primary">¡Acceso Confirmado!</h2>
                        <p class="text-gray-600">Ahora puedes agregar registros médicos</p>
                    </div>

                    <div class="bg-secondary rounded-lg p-4 mb-4">
                        <h3 class="font-heading font-bold text-lg text-primary mb-2">${pet.name}</h3>
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div><span class="text-gray-500">Especie:</span> <span class="font-semibold capitalize">${pet.species}</span></div>
                            <div><span class="text-gray-500">Raza:</span> <span class="font-semibold">${pet.breed || '-'}</span></div>
                            <div><span class="text-gray-500">Género:</span> <span class="font-semibold capitalize">${pet.gender || '-'}</span></div>
                            <div><span class="text-gray-500">Peso:</span> <span class="font-semibold">${pet.weight ? pet.weight + ' kg' : '-'}</span></div>
                        </div>
                        ${access.owner ? `
                            <div class="mt-3 pt-3 border-t border-gray-300">
                                <p class="text-sm"><span class="text-gray-500">Dueño:</span> <span class="font-semibold">${access.owner.full_name}</span></p>
                                ${access.owner.phone ? `<p class="text-sm"><span class="text-gray-500">Teléfono:</span> ${access.owner.phone}</p>` : ''}
                            </div>
                        ` : ''}
                    </div>

                    <button onclick="vetModule(supabase, '${userId}').addMedicalRecord('${access.pet_id}')" class="w-full btn-success">
                        Agregar Registro Médico
                    </button>
                    
                    <button onclick="this.closest('.modal-overlay').remove()" class="w-full mt-2 text-gray-500 hover:text-gray-700 py-2">
                        Cerrar
                    </button>
                </div>
            </div>
        `;
    }

    async function addMedicalRecord(petId) {
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="modal-overlay" onclick="if(event.target === this) this.remove()">
                <div class="modal-content p-6 max-w-lg">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="font-heading font-bold text-2xl text-primary">Agregar Registro Médico</h2>
                        <button onclick="this.closest('.modal-overlay').remove()" class="text-gray-500 hover:text-gray-700">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    <form id="medical-record-form" class="space-y-4">
                        <input type="hidden" name="pet_id" value="${petId}">
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de registro *</label>
                            <select name="type" required class="input-field">
                                <option value="">Seleccionar</option>
                                <option value="consulta">Consulta</option>
                                <option value="vacuna">Vacuna</option>
                                <option value="cirugia">Cirugía</option>
                                <option value="analisis">Análisis</option>
                                <option value="tratamiento">Tratamiento</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                            <input type="date" name="date" required class="input-field" value="${new Date().toISOString().split('T')[0]}">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                            <textarea name="description" required rows="4" class="input-field" placeholder="Describe el procedimiento, diagnóstico, tratamiento, etc."></textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Próxima visita (opcional)</label>
                            <input type="date" name="next_visit" class="input-field">
                        </div>

                        <button type="submit" class="w-full btn-success">
                            Guardar Registro
                        </button>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('medical-record-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);
            
            const recordData = {
                pet_id: formData.get('pet_id'),
                type: formData.get('type'),
                description: formData.get('description'),
                date: formData.get('date'),
                next_visit: formData.get('next_visit') || null,
            };

            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    authModule(supabase).showError('Debes iniciar sesión');
                    return;
                }

                const response = await fetch(
                    `${getSupabaseUrl()}/functions/v1/add-medical-record`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`,
                        },
                        body: JSON.stringify(recordData),
                    }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Error al guardar registro');
                }

                form.closest('.modal-overlay').remove();
                authModule(supabase).showSuccess('Registro médico guardado exitosamente');
                
                const currentPetId = currentAccess?.pet_id;
                if (currentPetId === petId) {
                    showAccessSuccess(currentAccess);
                }
            } catch (error) {
                authModule(supabase).showError(error.message);
            }
        });
    }

    return {
        initVet,
        addMedicalRecord,
    };
}

window.vetModule = vetModule;
