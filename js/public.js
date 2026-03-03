function publicModule(supabase) {
    async function loadShelters() {
        try {
            const { data: shelters, error } = await supabase
                .from('shelters')
                .select('*')
                .order('name');

            if (error) throw error;

            const grid = document.getElementById('shelters-grid');
            const noShelters = document.getElementById('no-shelters');
            
            if (!grid) return;

            if (!shelters || shelters.length === 0) {
                grid.classList.add('hidden');
                if (noShelters) noShelters.classList.remove('hidden');
                return;
            }

            grid.classList.remove('hidden');
            if (noShelters) noShelters.classList.add('hidden');

            grid.innerHTML = shelters.map(shelter => `
                <div class="card p-6">
                    <div class="flex items-start gap-4">
                        <div class="w-16 h-16 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                            <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                        </div>
                        <div>
                            <h3 class="font-heading font-bold text-lg text-primary">${shelter.name}</h3>
                            ${shelter.city ? `<p class="text-sm text-gray-500">📍 ${shelter.city}</p>` : ''}
                            ${shelter.phone ? `<p class="text-sm text-gray-600">📞 ${shelter.phone}</p>` : ''}
                            ${shelter.email ? `<p class="text-sm text-gray-600">✉️ ${shelter.email}</p>` : ''}
                        </div>
                    </div>
                    ${shelter.description ? `<p class="text-sm text-gray-600 mt-4 line-clamp-3">${shelter.description}</p>` : ''}
                    ${shelter.phone || shelter.email ? `
                        <div class="mt-4 pt-4 border-t border-gray-100">
                            <a href="tel:${shelter.phone}" class="text-accent hover:underline text-sm mr-3">Llamar</a>
                            ${shelter.email ? `<a href="mailto:${shelter.email}" class="text-accent hover:underline text-sm">Enviar email</a>` : ''}
                        </div>
                    ` : ''}
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading shelters:', error);
        }
    }

    async function loadUrgentPets() {
        try {
            const { data: pets, error } = await supabase
                .from('pets_for_adoption')
                .select(`
                    *,
                    shelters (name, phone, email)
                `)
                .eq('urgent', true)
                .eq('status', 'disponible')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const container = document.getElementById('urgent-pets');
            const noUrgent = document.getElementById('no-urgent');
            
            if (!container) return;

            if (!pets || pets.length === 0) {
                container.innerHTML = '';
                if (noUrgent) noUrgent.classList.remove('hidden');
                return;
            }

            if (noUrgent) noUrgent.classList.add('hidden');

            container.innerHTML = pets.map(pet => createUrgentPetCard(pet)).join('');
        } catch (error) {
            console.error('Error loading urgent pets:', error);
        }
    }

    function createUrgentPetCard(pet) {
        const photoUrl = pet.photo_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="%23F5E6D3" viewBox="0 0 24 24"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/%3E%3C/svg%3E';

        return `
            <div class="card overflow-hidden border-2 border-error">
                <div class="relative h-48">
                    <img src="${photoUrl}" alt="${pet.name}" class="w-full h-full object-cover">
                    <div class="absolute top-2 right-2 bg-error text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                        URGENTE
                    </div>
                </div>
                <div class="p-4">
                    <h3 class="font-heading font-bold text-lg text-primary">${pet.name}</h3>
                    <p class="text-sm text-gray-500">${pet.age} • ${pet.gender === 'macho' ? 'Macho' : 'Hembra'}</p>
                    <p class="text-sm text-gray-600 mt-2 line-clamp-2">${pet.description || 'Sin descripción'}</p>
                    ${pet.shelters ? `
                        <div class="mt-3 pt-3 border-t border-gray-100">
                            <p class="text-xs text-gray-500">Refugio: ${pet.shelters.name}</p>
                            ${pet.shelters.phone ? `<a href="tel:${pet.shelters.phone}" class="text-accent text-sm hover:underline">📞 Contactar</a>` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    async function loadVolunteers() {
        try {
            const { data: volunteers, error } = await supabase
                .from('volunteers')
                .select(`
                    *,
                    shelters (name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const list = document.getElementById('volunteers-list');
            const noVolunteers = document.getElementById('no-volunteers');
            
            if (!list) return;

            if (!volunteers || volunteers.length === 0) {
                list.innerHTML = '';
                if (noVolunteers) noVolunteers.classList.remove('hidden');
                return;
            }

            if (noVolunteers) noVolunteers.classList.add('hidden');

            list.innerHTML = volunteers.map(volunteer => `
                <div class="bg-white rounded-lg p-4 shadow-sm">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-semibold text-primary">${volunteer.name}</h4>
                            <p class="text-sm text-gray-500">${volunteer.shelters?.name || 'Voluntario independiente'}</p>
                            ${volunteer.skills ? `<p class="text-sm text-gray-600 mt-1">Habilidades: ${volunteer.skills}</p>` : ''}
                            ${volunteer.availability ? `<p class="text-sm text-gray-500">Disponibilidad: ${volunteer.availability}</p>` : ''}
                        </div>
                        ${volunteer.phone || volunteer.email ? `
                            <div class="flex gap-2">
                                ${volunteer.phone ? `<a href="tel:${volunteer.phone}" class="text-accent hover:underline">📞</a>` : ''}
                                ${volunteer.email ? `<a href="mailto:${volunteer.email}" class="text-accent hover:underline">✉️</a>` : ''}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading volunteers:', error);
        }
    }

    async function loadAdoptionPets() {
        try {
            const { data: pets, error } = await supabase
                .from('pets_for_adoption')
                .select(`
                    *,
                    shelters (name, city, phone, email)
                `)
                .eq('status', 'disponible')
                .order('urgent', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;

            const grid = document.getElementById('pets-grid');
            const noPets = document.getElementById('no-pets');
            
            if (!grid) return [];

            if (!pets || pets.length === 0) {
                grid.innerHTML = '';
                if (noPets) noPets.classList.remove('hidden');
                return [];
            }

            if (noPets) noPets.classList.add('hidden');

            grid.innerHTML = pets.map(pet => createAdoptionPetCard(pet)).join('');
            
            return pets;
        } catch (error) {
            console.error('Error loading adoption pets:', error);
            return [];
        }
    }

    function createAdoptionPetCard(pet) {
        const photoUrl = pet.photo_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="%23F5E6D3" viewBox="0 0 24 24"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/%3E%3C/svg%3E';

        return `
            <div class="pet-card" onclick="publicModule(supabase).showPetDetail('${pet.id}')">
                <div class="relative h-48 overflow-hidden">
                    <img src="${photoUrl}" alt="${pet.name}" class="w-full h-full object-cover">
                    ${pet.urgent ? '<span class="absolute top-2 right-2 bg-error text-white px-2 py-1 rounded-full text-xs font-bold">URGENTE</span>' : ''}
                </div>
                <div class="p-4">
                    <h3 class="font-heading font-bold text-lg text-primary">${pet.name}</h3>
                    <p class="text-sm text-gray-500">${pet.age} • ${pet.gender === 'macho' ? 'Macho' : 'Hembra'}</p>
                    <p class="text-sm text-gray-600 mt-2 line-clamp-2">${pet.description || 'Sin descripción'}</p>
                </div>
            </div>
        `;
    }

    async function showPetDetail(petId) {
        try {
            const { data: pet, error } = await supabase
                .from('pets_for_adoption')
                .select(`
                    *,
                    shelters (name, city, phone, email, address, description)
                `)
                .eq('id', petId)
                .single();

            if (error) throw error;

            const modal = document.getElementById('pet-modal');
            const modalContent = document.getElementById('pet-modal-content');
            
            if (!modal || !modalContent) return;

            const photoUrl = pet.photo_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="%23F5E6D3" viewBox="0 0 24 24"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/%3E%3C/svg%3E';

            modalContent.innerHTML = `
                <div class="relative">
                    <img src="${photoUrl}" alt="${pet.name}" class="w-full h-64 object-cover">
                    ${pet.urgent ? '<div class="absolute top-4 right-4 bg-error text-white px-4 py-2 rounded-full font-bold">URGENTE</div>' : ''}
                    <button onclick="document.getElementById('pet-modal').classList.add('hidden')" class="absolute top-4 left-4 bg-white/80 rounded-full p-2 hover:bg-white">
                        <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h2 class="font-heading font-bold text-2xl text-primary">${pet.name}</h2>
                            <p class="text-gray-500">${pet.age} • ${pet.gender === 'macho' ? 'Macho' : 'Hembra'} • ${pet.species}</p>
                        </div>
                        <span class="badge badge-available">Disponible</span>
                    </div>
                    
                    <p class="text-gray-700 mb-6">${pet.description || 'Sin descripción disponible.'}</p>
                    
                    ${pet.shelters ? `
                        <div class="bg-secondary rounded-lg p-4 mb-6">
                            <h3 class="font-heading font-bold text-lg text-primary mb-2">${pet.shelters.name}</h3>
                            ${pet.shelters.city ? `<p class="text-sm text-gray-600">📍 ${pet.shelters.city}</p>` : ''}
                            ${pet.shelters.description ? `<p class="text-sm text-gray-600 mt-2">${pet.shelters.description}</p>` : ''}
                        </div>
                        
                        <div class="flex flex-wrap gap-3">
                            ${pet.shelters.phone ? `
                                <a href="tel:${pet.shelters.phone}" class="flex-1 btn-success text-center">
                                    📞 Llamar
                                </a>
                            ` : ''}
                            ${pet.shelters.email ? `
                                <a href="mailto:${pet.shelters.email}?subject=Adopción de ${pet.name}" class="flex-1 btn-primary text-center">
                                    ✉️ Enviar Email
                                </a>
                            ` : ''}
                        </div>
                    ` : ''}
                    
                    <p class="text-xs text-gray-500 text-center mt-4">
                        Contacta directamente con el refugio. Mi Huellita no interviene en la adopción.
                    </p>
                </div>
            `;

            modal.classList.remove('hidden');
        } catch (error) {
            console.error('Error loading pet detail:', error);
            authModule(supabase).showError('Error al cargar los detalles');
        }
    }

    async function loadShelterPets(userId) {
        try {
            const { data: shelter } = await supabase
                .from('shelters')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (shelter) {
                document.getElementById('shelter-name-display').textContent = shelter.name;
                document.getElementById('shelter-city-display').textContent = shelter.city || '-';
            }

            const { data: pets } = await supabase
                .from('pets_for_adoption')
                .select('*')
                .eq('shelter_id', shelter?.id)
                .order('created_at', { ascending: false });

            const grid = document.getElementById('adoption-pets-grid');
            if (!grid) return;

            if (!pets || pets.length === 0) {
                grid.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">No hay mascotas en adopción</p>';
                return;
            }

            grid.innerHTML = pets.map(pet => `
                <div class="pet-card">
                    <div class="relative h-40 overflow-hidden">
                        <img src="${pet.photo_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="%23F5E6D3" viewBox="0 0 24 24"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/%3E%3C/svg%3E'}" alt="${pet.name}" class="w-full h-full object-cover">
                        <span class="absolute top-2 right-2 badge ${pet.status === 'disponible' ? 'badge-available' : 'badge-adopted'}">${pet.status}</span>
                    </div>
                    <div class="p-4">
                        <h3 class="font-heading font-bold text-lg text-primary">${pet.name}</h3>
                        <p class="text-sm text-gray-500">${pet.age} • ${pet.gender === 'macho' ? 'Macho' : 'Hembra'}</p>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading shelter pets:', error);
        }
    }

    return {
        loadShelters,
        loadUrgentPets,
        loadVolunteers,
        loadAdoptionPets,
        showPetDetail,
        loadShelterPets,
    };
}

window.publicModule = publicModule;
