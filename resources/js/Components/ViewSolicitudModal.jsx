import { X, Printer, Eye, Calendar, Building2, User, Wrench, FileText } from "lucide-react";
import { Button } from "@/Components/ui/button";

export default function ViewSolicitudModal({ isOpen, onClose, solicitud = null }) {
    if (!isOpen || !solicitud) return null;

    const getStatusBadge = (estado) => {
        switch (estado) {
            case 'Pendiente':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Aceptada':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Completada':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Rechazada':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const handlePrint = () => {
        window.open(route('solicitudes.pdf', solicitud.id), '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                
                {/* Cabecera */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1A2E5E]">
                            <Eye className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#1A2E5E]">
                                Detalle de Solicitud
                            </h2>
                            <p className="text-xs text-slate-500 font-mono">
                                Folio: <span className="font-semibold text-slate-700">{solicitud.folio}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(solicitud.estado)}`}>
                            {solicitud.estado}
                        </span>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Contenido / Campos solo lectura */}
                <div className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                                <Building2 className="w-3.5 h-3.5 text-[#1A2E5E]" />
                                Departamento Solicitante
                            </div>
                            <div className="text-sm font-medium text-slate-800">
                                {solicitud.departamento_solicitante_nombre || solicitud.departamento_nombre || 'No especificado'}
                            </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                                <User className="w-3.5 h-3.5 text-[#1A2E5E]" />
                                Personal Solicitante
                            </div>
                            <div className="text-sm font-medium text-slate-800">
                                {solicitud.solicitante_nombre || 'No especificado'}
                            </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                Departamento Destino
                            </div>
                            <div className="text-sm font-medium text-slate-800">
                                {solicitud.departamento_destino_nombre || 'No especificado'}
                            </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                                Personal Asignado (Responsable)
                            </div>
                            <div className="text-sm font-medium text-slate-800">
                                {solicitud.responsable_nombre || (
                                    <span className="text-slate-400 italic">Sin asignar por el momento</span>
                                )}
                            </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                Fecha de Elaboración
                            </div>
                            <div className="text-sm font-medium text-slate-800">
                                {solicitud.fecha_elaboracion}
                            </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                Fecha de Registro
                            </div>
                            <div className="text-sm font-medium text-slate-800">
                                {solicitud.created_at ? new Date(solicitud.created_at).toLocaleString() : 'N/A'}
                            </div>
                        </div>

                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#1A2E5E]" />
                            Descripción del servicio o falla a reparar
                        </label>
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 whitespace-pre-wrap leading-relaxed min-h-[100px]">
                            {solicitud.descripcion_servicio}
                        </div>
                    </div>

                </div>

                {/* Pie de modal */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handlePrint}
                        className="text-[#1A2E5E] border-slate-300 hover:bg-slate-100"
                    >
                        <Printer className="w-4 h-4 mr-2" /> Imprimir formato oficial (PDF)
                    </Button>

                    <Button 
                        type="button" 
                        onClick={onClose} 
                        className="bg-[#1A2E5E] hover:bg-[#1A2E5E]/90 text-white"
                    >
                        Cerrar
                    </Button>
                </div>

            </div>
        </div>
    );
}
