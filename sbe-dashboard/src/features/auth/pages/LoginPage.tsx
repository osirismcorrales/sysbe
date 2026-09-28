import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../../components/ui/Button';
import { FieldError } from '../../../components/ui/FieldError';
import { toast } from '../../../components/ui/Toast';
import { login } from '../services/authApi';
import { getUserRole } from '../utils/authUtils';
import {
  loginSchema,
  type LoginFormValues,
} from '../schemas/loginSchemas';

function inputClass(error?: boolean) {
  return [
    'w-full h-10 px-3 border rounded-lg focus:outline-none focus:ring-2 text-sm bg-white',
    error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-300 focus:ring-primary/20 focus:border-primary',
  ].join(' ');
}

export function LoginPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      dni: '',
      password: '',
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
        const response = await login(values);

        localStorage.setItem('token', response.token);

        const role = getUserRole();

        if (role !== 'ADMINISTRADOR' && role !== 'EMPLEADO') {
            localStorage.removeItem('token');

            toast.error('No tiene permisos para acceder al panel.');

            return;
        }

        toast.success('Inicio de sesión exitoso');

        navigate('/');

    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'No se pudo iniciar sesión.';

      setError('root', {
        message,
      });

      toast.error(message);
    }
  });

  return (
    <div className="min-h-screen flex items-start justify-center bg-brand-dark px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo SBE */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-brand-yellow text-brand-dark font-black text-xl w-20 h-20 rounded-xl flex flex-col items-center justify-center shadow-lg">
            <span className="leading-none text-white font-extrabold text-2xl">
              SBE
            </span>
            <span className="text-xs font-bold text-yellow-100">
              UNSE
            </span>
          </div>

          <h1 className="text-white font-bold text-xl tracking-wide mt-4">
            Bienestar Estudiantil
          </h1>

          <p className="text-red-200/70 text-xs font-semibold mt-1">
            UNSE · Sistema de Bienestar Estudiantil
          </p>
        </div>

        {/* Login */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Iniciar sesión
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Ingrese sus credenciales para acceder al sistema.
            </p>
          </div>

          <form onSubmit={submit} noValidate className="space-y-4">

            {/* DNI */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700 text-sm">
                DNI
              </label>

              <input
                type="text"
                inputMode="numeric"
                placeholder="Ej. 45956857"
                maxLength={8}
                className={inputClass(!!errors.dni)}
                {...register('dni')}
              />

              <FieldError message={errors.dni?.message} />
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700 text-sm">
                Contraseña
              </label>

              <input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className={inputClass(!!errors.password)}
                {...register('password')}
              />

              <FieldError message={errors.password?.message} />
            </div>

            {/* Error del backend */}
            {errors.root?.message && (
              <p className="text-sm text-red-600 text-center">
                {errors.root.message}
              </p>
            )}

            {/* Botón */}
            <Button
              type="submit"
              variant="brand"
              className="w-full h-10 text-sm font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
            </Button>
          </form>
        </div>

        <p className="text-center text-red-200/50 text-[10px] mt-5">
          Sistema de Bienestar Estudiantil · UNSE
        </p>
      </div>
    </div>
  );
}

export default LoginPage;