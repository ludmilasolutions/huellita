function adminModule(supabase, userId) {
    async function loadStats() {
        try {
            const [usersCount, petsCount, recordsCount] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact', head: true }),
                supabase.from('pets').select('id', { count: 'exact', head: true }),
                supabase.from('medical_records').select('id', { count: 'exact', head: true }),
            ]);

            document.getElementById('total-users').textContent = usersCount.count || 0;
            document.getElementById('total-pets').textContent = petsCount.count || 0;
            document.getElementById('total-records').textContent = recordsCount.count || 0;
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async function loadAllUsers() {
        try {
            const { data: users } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            return users || [];
        } catch (error) {
            console.error('Error loading users:', error);
            return [];
        }
    }

    async function updateUserRole(userId, newRole) {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;
            authModule(supabase).showSuccess('Rol actualizado');
        } catch (error) {
            authModule(supabase).showError('Error al actualizar rol: ' + error.message);
        }
    }

    return {
        loadStats,
        loadAllUsers,
        updateUserRole,
    };
}

window.adminModule = adminModule;
