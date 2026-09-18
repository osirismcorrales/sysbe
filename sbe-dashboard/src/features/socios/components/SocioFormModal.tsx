import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { useData, type Socio } from '../../../context/DataContext';

const socioSchema = z.object({
  dni: z.string()
    .min(7, 'El DNI debe tener al menos 7 dígitos')
    .max(9, 'El DNI debe tener máximo 9 dígitos')
    .regex(/^\d+$/, 'El DNI debe contener solo números'),
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Debe ser un correo electrónico válido'),
  fechaNacimiento: z.string().min(1, 'La fecha de nacimiento es requerida'),
  domicilio: z.string().min(5, 'El domicilio debe tener al menos 5 caracteres'),
  categoria: z.enum(['Interno', 'Externo', 'No socio']),
  vinculo: z.enum(['Alumno', 'Docente', 'Nodocente', 'Ninguno'])
});

type SocioFormValues = z.infer<typeof socioSchema>;

interface SocioFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SocioFormModal({ open, onOpenChange }: SocioFormModalProps) {
  const { addSocio, socios } = useData();
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<SocioFormValues>({
    resolver: zodResolver(socioSchema),
    defaultValues: {
      dni: '',
      nombre: '',
      email: '',
      fechaNacimiento: '',
      domicilio: '',
      categoria: 'No socio',
      vinculo: 'Ninguno'
    }
  });

  const selectedCategoria = watch('categoria');

  // Automatically set vinculo based on category selection
  React.useEffect(() => {
    if (selectedCategoria !== 'Interno') {
      setValue('vinculo', 'Ninguno');
    } else {
      setValue('vinculo', 'Alumno');
    }
  }, [selectedCategoria, setValue]);

  const onSubmit = (data: SocioFormValues) => {
    setErrorMsg(null);

    // Check if DNI already exists
    const exists = socios.some(s => s.dni === data.dni);
    if (exists) {
      setErrorMsg('El DNI ingresado ya corresponde a un usuario registrado.');
      return;
    }

    const newSocio: Socio = {
      ...data,
      puntos: 0,
      estado: 'Activo'
    };

    addSocio(newSocio);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Socio</DialogTitle>
          <DialogDescription>
            Complete los datos para dar de alta un nuevo usuario y asignarle una categoría de membresía.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg font-medium">
              {errorMsg}
            </div>
          )}

          {/* DNI */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-700">DNI del Usuario</label>
            <input
              type="text"
              placeholder="Ej. 38123456"
              {...register('dni')}
              className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
            />
            {errors.dni && <p className="text-red-500 font-medium text-[10px]">{errors.dni.message}</p>}
          </div>

          {/* Nombre Completo */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-700">Nombre Completo</label>
            <input
              type="text"
              placeholder="Ej. Juan Pérez"
              {...register('nombre')}
              className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
            />
            {errors.nombre && <p className="text-red-500 font-medium text-[10px]">{errors.nombre.message}</p>}
          </div>

          {/* Correo Electrónico */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-700">Dirección de Correo Electrónico</label>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              {...register('email')}
              className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
            />
            {errors.email && <p className="text-red-500 font-medium text-[10px]">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fecha de Nacimiento */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Fecha de Nacimiento</label>
              <input
                type="date"
                {...register('fechaNacimiento')}
                className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              />
              {errors.fechaNacimiento && <p className="text-red-500 font-medium text-[10px]">{errors.fechaNacimiento.message}</p>}
            </div>

            {/* Domicilio */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Domicilio</label>
              <input
                type="text"
                placeholder="Ej. Av. Belgrano 120"
                {...register('domicilio')}
                className="h-9 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              />
              {errors.domicilio && <p className="text-red-500 font-medium text-[10px]">{errors.domicilio.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Categoría */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Categoría</label>
              <select
                {...register('categoria')}
                className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              >
                <option value="No socio">No socio</option>
                <option value="Interno">Socio Interno</option>
                <option value="Externo">Socio Externo</option>
              </select>
              {errors.categoria && <p className="text-red-500 font-medium text-[10px]">{errors.categoria.message}</p>}
            </div>

            {/* Vínculo (UNSE) */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700">Vínculo (Socio Interno)</label>
              <select
                disabled={selectedCategoria !== 'Interno'}
                {...register('vinculo')}
                className="h-9 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="Ninguno">Ninguno</option>
                <option value="Alumno">Alumno</option>
                <option value="Docente">Docente</option>
                <option value="Nodocente">Nodocente</option>
              </select>
              {errors.vinculo && <p className="text-red-500 font-medium text-[10px]">{errors.vinculo.message}</p>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="brand"
              size="sm"
              disabled={isSubmitting}
              className="text-xs font-semibold"
            >
              Registrar Socio
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export default SocioFormModal;
