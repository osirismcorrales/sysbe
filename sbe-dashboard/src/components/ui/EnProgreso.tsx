import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { Construction, ArrowLeft, Sparkles, Clock } from 'lucide-react';

interface EnProgresoProps {
  modulo: string;
  descripcion?: string;
  icono?: React.ComponentType<{ className?: string }>;
}

export function EnProgreso({
  modulo,
  descripcion = 'Esta funcionalidad se encuentra actualmente en desarrollo y estará disponible próximamente junto a los servicios del backend.',
  icono: Icono = Construction,
}: EnProgresoProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center select-none">
      <Card className="max-w-lg w-full border-dashed border-2 border-gray-200 bg-white shadow-sm p-8 rounded-2xl">
        <CardContent className="flex flex-col items-center gap-5 p-0">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold tracking-wide uppercase">
            <Clock className="h-3.5 w-3.5" />
            En desarrollo
          </div>

          {/* Icon Container */}
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-red/10 via-brand-red/5 to-transparent border border-brand-red/20 shadow-inner">
            <Icono className="h-10 w-10 text-brand-red" />
            <Sparkles className="absolute -top-1.5 -right-1.5 h-5 w-5 text-amber-500 animate-pulse" />
          </div>

          {/* Texts */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {modulo}
            </h2>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed mx-auto font-normal">
              {descripcion}
            </p>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EnProgreso;
