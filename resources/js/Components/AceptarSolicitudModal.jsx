import { X, Check, UserCheck, Loader2, Wrench, AlertTriangle } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { useForm, usePage } from "@inertiajs/react";
import { useEffect } from "react";

export default function AceptarSolicitudModal({ isOpen, onClose, solicitud = null, personal = [] }) {
    const { auth } = usePage().props;

    const { data, setData, put, processing, reset, errors, clearErrors } = useForm({
        estado: "Aceptada",
        responsable_id: ""
    });

    useEffect(() => {
        if (isOpen && solicitud) {
            setData({
                estado: "Aceptada",
                responsable_id: solicitud.responsable_id || ""
            });
            clearErrors();
        }
    }, [isOpen, solicitud]);

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    const submit = (e) => {
        e.preventDefault();
        if (!solicitud) return;

        put(route('solicitudes.update', solicitud.id), {
            preserveScroll: true,
            onSuccess: () => {
                handleClose();
            },
        });
    };

    if (!isOpen || !solicitud) return null;

    // Filtra únicamente al personal con rol de 'Tecnico' perteneciente al departamento destino
    const tecnicosDisponibles = personal.filter(
        p => p.departamento_id === solicitud.departamento_destino_id && p.rol === "Tecnico"
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
            <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                
                {/* Cabecera */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-blue-50/40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#1A2E5E]">
                                Aceptar y Asignar Técnico
                            </h2>
                            <p className="text-xs text-slate-500 font-mono">
                                Solicitud: <span className="font-semibold text-slate-700">{solicitud.folio}</span>
                            </p>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        onClick={handleClose} 
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6 flex flex-col gap-4">
                    
                    {/* Resumen de la solicitud */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Solicitante:</span>
                            <span className="font-semibold text-slate-800">{solicitud.solicitante_nombre}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Depto. Solicitante:</span>
                            <span className="font-semibold text-slate-800">{solicitud.departamento_solicitante_nombre || solicitud.departamento_nombre}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Depto. Destino:</span>
                            <span className="font-semibold text-slate-800">{solicitud.departamento_destino_nombre}</span>
                        </div>
                        <div className="pt-1.5 border-t border-slate-200 text-slate-700 line-clamp-2">
                            <strong>Falla/Servicio:</strong> {solicitud.descripcion_servicio}
                        </div>
                    </div>

                    {/* Selector de Técnico */}
                    <div className="flex flex-col gap-1.5 mt-2">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-[#1A2E5E]" />
                            Designar Técnico Responsable <span className="text-red-500">*</span>
                        </label>
                        
                        {tecnicosDisponibles.length > 0 ? (
                            <select
                                value={data.responsable_id}
                                onChange={(e) => setData('responsable_id', e.target.value)}
                                required
                                className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-[#1A2E5E]/20 focus:border-[#1A2E5E] bg-white transition-all"
                            >
                                <option value="">Seleccione al técnico que atenderá la solicitud</option>
                                {tecnicosDisponibles.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.nombre}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>No hay personal con rol de <strong>Técnico</strong> registrado en este departamento. Registre o asigne técnicos primero.</span>
                            </div>
                        )}

                        {errors.responsable_id && (
                            <span className="text-red-500 text-xs mt-0.5">{errors.responsable_id}</span>
                        )}
                        <p className="text-[11px] text-slate-400 mt-1">
                            Al aceptar, la solicitud cambiará su estatus a <strong>Aceptada</strong> y aparecerá en el panel del técnico asignado.
                        </p>
                    </div>

                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                    <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={processing || !data.responsable_id} 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4 mr-2" /> Aceptar y Asignar
                            </>
                        )}
                    </Button>
                </div>

            </form>
        </div>
    );
}
