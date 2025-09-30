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
        <div className={`min-h-screen ${UI_CONFIG.GRADIENTS.MAIN}`}>
            <div className="container mx-auto px-4 py-6">
                <div className="max-w-2xl mx-auto">

                    {/* Header */}
                    <div className="flex items-center mb-8">
                        <button
                            onClick={onBack}
                            className="flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors duration-200"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Volver</span>
                        </button>
                        <h1 className="text-3xl font-bold text-white ml-6">
                            Mi Perfil
                        </h1>
                    </div>

                    {/* Formulario */}
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* Información básica */}
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                        📋 Información básica
                                    </h2>

                                    {/* Nombre */}
                                    <div className="mb-4">
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre completo
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Tu nombre completo"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="mb-4">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="tu@email.com"
                                        />
                                    </div>
                                </div>

                                {/* Sección de contraseña */}
                                <div className="border-t pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            🔒 Contraseña
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={() => setIsChangingPassword(!isChangingPassword)}
                                            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                        >
                                            {isChangingPassword ? 'Cancelar cambio' : 'Cambiar contraseña'}
                                        </button>
                                    </div>

                                    {isChangingPassword && (
                                        <div className="space-y-4">
                                            {/* Contraseña actual */}
                                            <div>
                                                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Contraseña actual
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showCurrentPassword ? 'text' : 'password'}
                                                        id="current_password"
                                                        name="current_password"
                                                        value={formData.current_password}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                                        placeholder="Tu contraseña actual"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                                                    >
                                                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Nueva contraseña */}
                                            <div>
                                                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nueva contraseña
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        id="new_password"
                                                        name="new_password"
                                                        value={formData.new_password}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                                        placeholder="Nueva contraseña (mín. 8 caracteres)"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                                                    >
                                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Confirmar nueva contraseña */}
                                            <div>
                                                <label htmlFor="new_password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Confirmar nueva contraseña
                                                </label>
                                                <input
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    id="new_password_confirmation"
                                                    name="new_password_confirmation"
                                                    value={formData.new_password_confirmation}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Confirma tu nueva contraseña"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Mensajes */}
                                {error && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                        ❌ {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                                        {success}
                                    </div>
                                )}

                                {/* Botón de guardar */}
                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
                                    >
                                        <Save className="w-5 h-5" />
                                        <span>{loading ? '⏳ Guardando...' : 'Guardar cambios'}</span>
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