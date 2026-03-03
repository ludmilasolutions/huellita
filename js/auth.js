function authModule(supabase) {
    async function getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.error('Error getting user:', error);
            return null;
        }
        return user;
    }

    async function checkAuthAndRedirect() {
        const user = await getCurrentUser();
        if (!user) {
            return;
        }
        
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        
        if (profile) {
            sessionStorage.setItem('userRole', profile.role);
        }
    }

    async function handleGoogleLogin() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard.html`,
                },
            });
            
            if (error) throw error;
        } catch (error) {
            showError('Error al iniciar sesión con Google: ' + error.message);
        }
    }

    async function handleGoogleRegister(role) {
        try {
            const { data, error } = await supabase.auth.signUp({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard.html`,
                    data: {
                        role: role,
                    },
                },
            });
            
            if (error) throw error;
            
            if (data.user) {
                await supabase.from('profiles').update({ role: role }).eq('id', data.user.id);
                
                if (role === 'vet') {
                    const { data: vetData } = await supabase
                        .from('veterinaries')
                        .insert({ user_id: data.user.id, name: 'Mi Veterinaria' })
                        .select()
                        .single();
                } else if (role === 'shelter') {
                    const { data: shelterData } = await supabase
                        .from('shelters')
                        .insert({ user_id: data.user.id, name: 'Mi Refugio' })
                        .select()
                        .single();
                }
            }
            
            showSuccess('Cuenta creada exitosamente. Redirigiendo...');
        } catch (error) {
            showError('Error al registrarse con Google: ' + error.message);
        }
    }

    async function handleEmailLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            
            if (error) throw error;
            
            window.location.href = 'dashboard.html';
        } catch (error) {
            showError('Error al iniciar sesión: ' + error.message);
        }
    }

    async function handleEmailRegister(role) {
        const fullName = document.getElementById('full-name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                        phone: phone,
                    },
                },
            });
            
            if (error) throw error;
            
            if (data.user) {
                await supabase.from('profiles').update({ 
                    role: role,
                    full_name: fullName,
                    phone: phone,
                }).eq('id', data.user.id);
                
                if (role === 'vet') {
                    const clinicName = document.getElementById('clinic-name')?.value || 'Mi Veterinaria';
                    const clinicAddress = document.getElementById('clinic-address')?.value || '';
                    const clinicLicense = document.getElementById('clinic-license')?.value || '';
                    
                    await supabase
                        .from('veterinaries')
                        .insert({ 
                            user_id: data.user.id, 
                            name: clinicName,
                            address: clinicAddress,
                            license: clinicLicense,
                        });
                } else if (role === 'shelter') {
                    const shelterName = document.getElementById('shelter-name')?.value || 'Mi Refugio';
                    const shelterDescription = document.getElementById('shelter-description')?.value || '';
                    
                    await supabase
                        .from('shelters')
                        .insert({ 
                            user_id: data.user.id, 
                            name: shelterName,
                            description: shelterDescription,
                        });
                }
            }
            
            showSuccess('Cuenta creada exitosamente. Por favor verifica tu email.');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } catch (error) {
            showError('Error al registrarse: ' + error.message);
        }
    }

    async function handleLogout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            window.location.href = 'index.html';
        } catch (error) {
            showError('Error al cerrar sesión: ' + error.message);
        }
    }

    function showError(message) {
        const errorDiv = document.getElementById('error-message');
        const successDiv = document.getElementById('success-message');
        
        if (successDiv) successDiv.classList.add('hidden');
        
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
            
            setTimeout(() => {
                errorDiv.classList.add('hidden');
            }, 5000);
        } else {
            alert(message);
        }
    }

    function showSuccess(message) {
        const successDiv = document.getElementById('success-message');
        const errorDiv = document.getElementById('error-message');
        
        if (errorDiv) errorDiv.classList.add('hidden');
        
        if (successDiv) {
            successDiv.textContent = message;
            successDiv.classList.remove('hidden');
            
            setTimeout(() => {
                successDiv.classList.add('hidden');
            }, 5000);
        } else {
            alert(message);
        }
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    return {
        getCurrentUser,
        checkAuthAndRedirect,
        handleGoogleLogin,
        handleGoogleRegister,
        handleEmailLogin,
        handleEmailRegister,
        handleLogout,
        showError,
        showSuccess,
        showToast,
    };
}

window.authModule = authModule;
