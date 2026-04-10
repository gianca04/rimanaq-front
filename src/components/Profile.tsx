import React, { useState } from 'react';
import { User, Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { UpdateProfileRequest } from '../types';
import { MESSAGES, UI_CONFIG, VALIDATION_RULES } from '../config/constants';

interface ProfileProps {
    onBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onBack }) => {
    const { user } = useAuth();

    // Estado del formulario
    const [formData, setFormData] = useState<UpdateProfileRequest>({
        name: user?.name || '',
        email: user?.email || '',
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    /**
     * Maneja cambios en los inputs del formulario
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // Limpiar mensajes al editar
        if (error) setError(null);
        if (success) setSuccess(null);
    };

    /**
     * Valida los datos del formulario
     */
    const validateForm = (): string | null => {
        if (!formData.name.trim()) {
            return MESSAGES.VALIDATION.REQUIRED_NAME;
        }

        if (!formData.email.trim()) {
            return MESSAGES.VALIDATION.REQUIRED_EMAIL;
        }

        // Si está cambiando contraseña, validar campos de contraseña
        if (isChangingPassword) {
            if (!formData.current_password) {
                return 'La contraseña actual es obligatoria';
            }

            if (!formData.new_password) {
                return 'La nueva contraseña es obligatoria';
            }

            if (formData.new_password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
                return MESSAGES.VALIDATION.MIN_PASSWORD_LENGTH;
            }

            if (formData.new_password !== formData.new_password_confirmation) {
                return 'Las contraseñas nuevas no coinciden';
            }
        }

        return null;
    };

    /**
     * Maneja el envío del formulario
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Validación frontend
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        try {
            // Preparar datos para enviar (solo incluir contraseñas si está cambiando)
            const dataToSend: UpdateProfileRequest = {
                name: formData.name,
                email: formData.email,
            };

            if (isChangingPassword) {
                dataToSend.current_password = formData.current_password;
                dataToSend.new_password = formData.new_password;
                dataToSend.new_password_confirmation = formData.new_password_confirmation;
            }

            // Llamar al servicio para actualizar
            const response = await authService.updateProfile(dataToSend);
            console.log('✅ Perfil actualizado:', response);

            setSuccess('✅ Perfil actualizado correctamente');

            // Limpiar campos de contraseña
            if (isChangingPassword) {
                setFormData(prev => ({
                    ...prev,
                    current_password: '',
                    new_password: '',
                    new_password_confirmation: '',
                }));
                setIsChangingPassword(false);
            }

        } catch (error) {
            console.error('❌ Error al actualizar perfil:', error);
            setError(error instanceof Error ? error.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-duo-background-soft">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">

                    {/* Header */}
                    <div className="flex items-center mb-8">
                        <button
                            onClick={onBack}
                            className="btn-duo-white px-4 py-2"
                        >
                            <ArrowLeft className="w-5 h-5" strokeWidth={3} />
                            <span className="ml-2 font-black uppercase text-xs">Atrás</span>
                        </button>
                        <h1 className="text-3xl font-black text-duo-text ml-8 uppercase tracking-tight">
                            Tu Perfil
                        </h1>
                    </div>

                    {/* Formulario */}
                    <div className="card-duo">
                        <div className="p-2 sm:p-4">
                            <form onSubmit={handleSubmit} className="space-y-8">

                                {/* Información básica */}
                                <div>
                                    <h2 className="text-sm font-black text-duo-gray-dark mb-6 uppercase tracking-widest border-b-2 border-duo-gray pb-2">
                                        DATOS PERSONALES
                                    </h2>

                                    {/* Nombre */}
                                    <div className="mb-6">
                                        <label htmlFor="name" className="block text-xs font-black text-duo-text mb-2 uppercase tracking-wide">
                                            Nombre completo
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="input-duo"
                                            placeholder="Tu nombre completo"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="mb-6">
                                        <label htmlFor="email" className="block text-xs font-black text-duo-text mb-2 uppercase tracking-wide">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="input-duo"
                                            placeholder="tu@email.com"
                                        />
                                    </div>
                                </div>

                                {/* Sección de contraseña */}
                                <div className="pt-4">
                                    <div className="flex items-center justify-between mb-6 border-b-2 border-duo-gray pb-2">
                                        <h2 className="text-sm font-black text-duo-gray-dark uppercase tracking-widest">
                                            SEGURIDAD
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={() => setIsChangingPassword(!isChangingPassword)}
                                            className="text-duo-blue hover:text-duo-blue-dark text-xs font-black uppercase tracking-wide"
                                        >
                                            {isChangingPassword ? 'CANCELAR' : 'CAMBIAR CONTRASEÑA'}
                                        </button>
                                    </div>

                                    {isChangingPassword && (
                                        <div className="space-y-6 animate-in slide-in-from-top duration-300">
                                            {/* Contraseña actual */}
                                            <div>
                                                <label htmlFor="current_password" className="block text-xs font-black text-duo-text mb-2 uppercase tracking-wide">
                                                    Contraseña actual
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showCurrentPassword ? 'text' : 'password'}
                                                        id="current_password"
                                                        name="current_password"
                                                        value={formData.current_password}
                                                        onChange={handleChange}
                                                        className="input-duo pr-12"
                                                        placeholder="Tu contraseña actual"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-duo-gray-dark hover:text-duo-text"
                                                    >
                                                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Nueva contraseña */}
                                            <div>
                                                <label htmlFor="new_password" className="block text-xs font-black text-duo-text mb-2 uppercase tracking-wide">
                                                    Nueva contraseña
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        id="new_password"
                                                        name="new_password"
                                                        value={formData.new_password}
                                                        onChange={handleChange}
                                                        className="input-duo pr-12"
                                                        placeholder="Nueva contraseña (mín. 8 caracteres)"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-duo-gray-dark hover:text-duo-text"
                                                    >
                                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Confirmar nueva contraseña */}
                                            <div>
                                                <label htmlFor="new_password_confirmation" className="block text-xs font-black text-duo-text mb-2 uppercase tracking-wide">
                                                    Confirmar nueva contraseña
                                                </label>
                                                <input
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    id="new_password_confirmation"
                                                    name="new_password_confirmation"
                                                    value={formData.new_password_confirmation}
                                                    onChange={handleChange}
                                                    className="input-duo"
                                                    placeholder="Confirma tu nueva contraseña"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Mensajes */}
                                {error && (
                                    <div className="bg-duo-red/10 border-2 border-duo-red text-duo-red px-4 py-3 rounded-xl font-bold">
                                        ❌ {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="bg-duo-green/10 border-2 border-duo-green text-duo-green px-4 py-3 rounded-xl font-bold">
                                        {success}
                                    </div>
                                )}

                                {/* Botón de guardar */}
                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full btn-duo-green"
                                    >
                                        <Save className="w-5 h-5 mr-2" strokeWidth={3} />
                                        <span>{loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;