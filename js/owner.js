function ownerModule(supabase, userId) {
    let currentPets = [];

    async function initOwner() {
        await loadPets();
        setupEventListeners();
    }

    async function loadPets() {
        try {
            const { data: pets, error } = await supabase
                .from('pets')
                .select('*')
                .eq('owner_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            currentPets = pets || [];
            renderPets();
        } catch (error) {
            console.error('Error loading pets:', error);
            authModule(supabase).showError('Error al cargar las mascotas');
        }
    }

    function renderPets() {
        const grid = document.getElementById('pets-grid');
        const noPets = document.getElementById('no-pets');
        
        if (!grid) return;

        grid.innerHTML = '';

        if (currentPets.length === 0) {
            grid.classList.add('hidden');
            if (noPets) noPets.classList.remove('hidden');
            return;
        }

        grid.classList.remove('hidden');
        if (noPets) noPets.classList.add('hidden');

        currentPets.forEach(pet => {
            const card = createPetCard(pet);
            grid.innerHTML += card;
        });
    }

    function createPetCard(pet) {
        const photoUrl = pet.photo_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="%23F5E6D3" viewBox="0 0 24 24"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/%3E%3C/svg%3E';
        
        return `
            <div class="pet-card">
                <div class="relative h-48 overflow-hidden">
                    <img src="${photoUrl}" alt="${pet.name}" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
                <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-heading font-bold text-xl text-primary">${pet.name}</h3>
                        <span class="text-xs px-2 py-1 bg-secondary rounded-full text-primary capitalize">${pet.species}</span>
                    </div>
                    <p class="text-sm text-gray-600">${pet.breed || 'Sin raza'}</p>
                    <div class="flex gap-2 mt-4">
                        <button onclick="ownerModule(supabase, '${userId}').showPetDetails('${pet.id}')" class="flex-1 bg-primary text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-brown-800 transition-colors">
                            Ver Detalles
                        </button>
                        <button onclick="ownerModule(supabase, '${userId}').generatePin('${pet.id}')" class="flex-1 bg-accent text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-orange-500 transition-colors">
                            Generar PIN
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function setupEventListeners() {
        const addBtn = document.getElementById('add-pet-btn');
        if (addBtn) {
            addBtn.addEventListener('click', showAddPetModal);
        }
    }

    function showAddPetModal() {
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="modal-overlay" onclick="if(event.target === this) this.remove()">
                <div class="modal-content p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="font-heading font-bold text-2xl text-primary">Agregar Mascota</h2>
                        <button onclick="this.closest('.modal-overlay').remove()" class="text-gray-500 hover:text-gray-700">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    <form id="add-pet-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                            <input type="text" name="name" required class="input-field" placeholder="Nombre de tu mascota">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Especie *</label>
                                <select name="species" required class="input-field">
                                    <option value="">Seleccionar</option>
                                    <option value="perro">Perro</option>
                                    <option value="gato">Gato</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Género</label>
                                <select name="gender" class="input-field">
                                    <option value="">Seleccionar</option>
                                    <option value="macho">Macho</option>
                                    <option value="hembra">Hembra</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Raza</label>
                            <input type="text" name="breed" class="input-field" placeholder="Raza de tu mascota">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
                                <input type="date" name="birth_date" class="input-field">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                                <input type="number" step="0.1" name="weight" class="input-field" placeholder="0.0">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
                            <input type="text" name="color" class="input-field" placeholder="Color del pelaje">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Microchip</label>
                            <input type="text" name="microchip" class="input-field" placeholder="Número de microchip">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                            <textarea name="notes" rows="3" class="input-field" placeholder="Información adicional"></textarea>
                        </div>
                        <button type="submit" class="w-full btn-primary">
                            Guardar Mascota
                        </button>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('add-pet-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);
            
            const petData = {
                owner_id: userId,
                name: formData.get('name'),
                species: formData.get('species'),
                gender: formData.get('gender') || null,
                breed: formData.get('breed') || null,
                birth_date: formData.get('birth_date') || null,
                weight: parseFloat(formData.get('weight')) || null,
                color: formData.get('color') || null,
                microchip: formData.get('microchip') || null,
                notes: formData.get('notes') || null,
            };

            try {
                const { data, error } = await supabase
                    .from('pets')
                    .insert(petData)
                    .select()
                    .single();

                if (error) throw error;

                form.closest('.modal-overlay').remove();
                authModule(supabase).showSuccess('Mascota agregada exitosamente');
                await loadPets();
            } catch (error) {
                authModule(supabase).showError('Error al agregar mascota: ' + error.message);
            }
        });
    }

    async function showPetDetails(petId) {
        const pet = currentPets.find(p => p.id === petId);
        if (!pet) return;

        const { data: records } = await supabase
            .from('medical_records')
            .select('*')
            .eq('pet_id', petId)
            .order('date', { ascending: false });

        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="modal-overlay" onclick="if(event.target === this) this.remove()">
                <div class="modal-content p-6 max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-start mb-4">
                        <h2 class="font-heading font-bold text-2xl text-primary">${pet.name}</h2>
                        <button onclick="this.closest('.modal-overlay').remove()" class="text-gray-500 hover:text-gray-700">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="bg-secondary rounded-lg p-4 mb-4">
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div><span class="text-gray-500">Especie:</span> <span class="font-semibold capitalize">${pet.species}</span></div>
                            <div><span class="text-gray-500">Raza:</span> <span class="font-semibold">${pet.breed || '-'}</span></div>
                            <div><span class="text-gray-500">Género:</span> <span class="font-semibold capitalize">${pet.gender || '-'}</span></div>
                            <div><span class="text-gray-500">Peso:</span> <span class="font-semibold">${pet.weight ? pet.weight + ' kg' : '-'}</span></div>
                            <div><span class="text-gray-500">Nacimiento:</span> <span class="font-semibold">${pet.birth_date || '-'}</span></div>
                            <div><span class="text-gray-500">Microchip:</span> <span class="font-semibold">${pet.microchip || '-'}</span></div>
                        </div>
                    </div>

                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-heading font-bold text-xl text-primary">Historial Médico</h3>
                        <button onclick="ownerModule(supabase, '${userId}').generatePin('${petId}')" class="btn-accent text-sm">
                            Generar PIN
                        </button>
                    </div>

                    <div class="space-y-3">
                        ${records && records.length > 0 ? records.map(record => `
                            <div class="border rounded-lg p-4">
                                <div class="flex justify-between items-start mb-2">
                                    <span class="type-badge ${record.type}">${record.type}</span>
                                    <span class="text-sm text-gray-500">${record.date}</span>
                                </div>
                                <p class="text-gray-700">${record.description}</p>
                                <p class="text-sm text-gray-500 mt-2">Veterinaria: ${record.veterinary_name || 'No especificada'}</p>
                                ${record.next_visit ? `<p class="text-sm text-accent mt-1">Próxima visita: ${record.next_visit}</p>` : ''}
                            </div>
                        `).join('') : '<p class="text-gray-500 text-center py-4">No hay registros médicos aún</p>'}
                    </div>
                </div>
            </div>
        `;
    }

    async function generatePin(petId) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                authModule(supabase).showError('Debes iniciar sesión');
                return;
            }

            const response = await fetch(
                `${getSupabaseUrl()}/functions/v1/generate-pin`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({ pet_id: petId }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error al generar PIN');
            }

            showPinModal(result.pin, result.pet_name);
        } catch (error) {
            authModule(supabase).showError(error.message);
        }
    }

    function showPinModal(pin, petName) {
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
            <div class="modal-overlay" onclick="if(event.target === this) this.remove()">
                <div class="modal-content p-6 text-center">
                    <h2 class="font-heading font-bold text-xl text-primary mb-2">PIN para ${petName}</h2>
                    <p class="text-gray-600 mb-4">Comparte este PIN con tu veterinaria. Expira en 15 minutos.</p>
                    
                    <div class="pin-display my-6">${pin}</div>
                    
                    <p class="text-sm text-gray-500 mb-4">
                        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Este PIN expire en 15 minutos
                    </p>
                    
                    <button onclick="this.closest('.modal-overlay').remove()" class="btn-primary">
                        Cerrar
                    </button>
                </div>
            </div>
        `;
    }

    return {
        initOwner,
        loadPets,
        showPetDetails,
        generatePin,
    };
}

window.ownerModule = ownerModule;
