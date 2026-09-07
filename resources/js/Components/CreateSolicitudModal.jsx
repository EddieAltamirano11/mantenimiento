import { X, Save, PlusCircle, Loader2, Building2, User, Lock } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { useForm, usePage } from "@inertiajs/react";
import { useEffect } from "react";

export default function CreateSolicitudModal({ isOpen, onClose, departamentos = [], personal = [] }) {
    const { auth } = usePage().props;
    // Solicitante o Técnico creando una solicitud propia
    const isApplicantMode = auth?.user?.rol === "Solicitante" || auth?.user?.rol === "Tecnico";

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        departamento_solicitante_id: "",
        solicitante_id: "",
        departamento_destino_id: "",
        responsable_id: "",
        descripcion_servicio: ""
    });

    // Precargar datos del solicitante al abrir el modal
    useEffect(() => {
        if (isOpen) {
            if (isApplicantMode && auth?.user) {
                setData({
                    departamento_solicitante_id: auth.user.departamento_id || "",
                    solicitante_id: auth.user.personal_id || "",
                    departamento_destino_id: "",
                    responsable_id: "",
                    descripcion_servicio: ""
                });
            } else if (auth?.user) {
                setData(d => ({
                    ...d,
                    departamento_solicitante_id: d.departamento_solicitante_id || auth.user.departamento_id || "",
                    solicitante_id: d.solicitante_id || auth.user.personal_id || "",
                }));
            }
            clearErrors();
        }
    }, [isOpen, auth?.user]);

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('solicitudes.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    if (!isOpen) return null;

    // Solo los departamentos que brindan mantenimiento pueden ser destino
    const departamentosDestino = departamentos.filter(d => Boolean(d.brinda_mantenimiento));

    // Nombre del departamento del usuario para mostrarlo fijo
    const miDepartamentoNombre = departamentos.find(d => d.id === auth?.user?.departamento_id)?.nombre 
        || "Mi Departamento";

    // Filtra el personal según el departamento solicitante si no es modo solicitante
    const personalSolicitanteFiltrado = data.departamento_solicitante_id
        ? personal.filter(p => p.departamento_id === data.departamento_solicitante_id)
        : personal;

    // Filtra únicamente a los técnicos pertenecientes al departamento destino
    const personalResponsableFiltrado = data.departamento_destino_id
        ? personal.filter(p => p.departamento_id === data.departamento_destino_id && p.rol === "Tecnico")
        : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
            <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                
                {/* Cabecera del modal */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1A2E5E]">
                            <PlusCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#1A2E5E]">Crear Solicitud de Mantenimiento</h2>
                            <p className="text-xs text-slate-500">
                                {isApplicantMode 
                                    ? "Seleccione el área de mantenimiento y describa detalladamente la falla" 
                                    : "Complete los datos para generar una nueva solicitud"}
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

                {/* Formulario */}
                <div className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
                    
                    {/* Campos de Solicitante (Bloqueados o fijos para Solicitante/Técnico) */}
                    {isApplicantMode ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                            
                            {/* Departamento Solicitante fijo */}
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-[#1A2E5E]" />
                                    Departamento Solicitante
                                </span>
                                <div className="text-sm font-semibold text-slate-800 flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200">
                                    <span>{miDepartamentoNombre}</span>
                                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                            </div>

                            {/* Personal Solicitante fijo */}
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-[#1A2E5E]" />
                                    Personal Solicitante
                                </span>
                                <div className="text-sm font-semibold text-slate-800 flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200">
                                    <span>{auth?.user?.nombre || auth?.user?.name}</span>
                                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                    Departamento Solicitante <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    value={data.departamento_solicitante_id} 
                                    onChange={e => {
                                        setData(data => ({
                                            ...data,
                                            departamento_solicitante_id: e.target.value,
                                            solicitante_id: "",
                                        }));
                                    }}
                                    className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-[#1A2E5E]/20 focus:border-[#1A2E5E] bg-white transition-all"
                                >
                                    <option value="">Seleccione un departamento</option>
                                    {departamentos.map(dep => (
                                        <option key={dep.id} value={dep.id}>{dep.nombre}</option>
                                    ))}
                                </select>
                                {errors.departamento_solicitante_id && (
                                    <span className="text-red-500 text-xs mt-0.5">{errors.departamento_solicitante_id}</span>
                                )}
                            </div>
                        
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                    Personal Solicitante <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    value={data.solicitante_id} 
                                    onChange={e => setData('solicitante_id', e.target.value)}
                                    className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-[#1A2E5E]/20 focus:border-[#1A2E5E] bg-white transition-all"
                                >
                                    <option value="">Seleccione al solicitante</option>
                                    {personalSolicitanteFiltrado.map(p => (
                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                    ))}
                                </select>
                                {errors.solicitante_id && (
                                    <span className="text-red-500 text-xs mt-0.5">{errors.solicitante_id}</span>
                                )}
                            </div>

                        </div>
                    )}

                    {/* Departamento Destino y (si es Encargado) Personal Asignado */}
                    <div className={`grid gap-5 ${isApplicantMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                        
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                Departamento Destino (Área Técnica) <span className="text-red-500">*</span>
                            </label>
                            <select 
                                value={data.departamento_destino_id} 
                                onChange={e => {
                                    setData(data => ({
                                        ...data,
                                        departamento_destino_id: e.target.value,
                                        responsable_id: "",
                                    }));
                                }}
                                className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-[#1A2E5E]/20 focus:border-[#1A2E5E] bg-white transition-all"
                            >
                                <option value="">Seleccione el área que atenderá el servicio</option>
                                {departamentosDestino.map(dep => (
                                    <option key={dep.id} value={dep.id}>{dep.nombre}</option>
                                ))}
                            </select>
                            {errors.departamento_destino_id && (
                                <span className="text-red-500 text-xs mt-0.5">{errors.departamento_destino_id}</span>
                            )}
                        </div>

                        {/* Oculto completamente para Solicitante/Técnico */}
                        {!isApplicantMode && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                    Técnico Asignado (Opcional)
                                </label>
                                <select 
                                    value={data.responsable_id} 
                                    onChange={e => setData('responsable_id', e.target.value)}
                                    className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-[#1A2E5E]/20 focus:border-[#1A2E5E] bg-white transition-all"
                                >
                                    <option value="">Sin asignar por el momento (Pendiente)</option>
                                    {personalResponsableFiltrado.map(p => (
                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                    ))}
                                </select>
                                {errors.responsable_id && (
                                    <span className="text-red-500 text-xs mt-0.5">{errors.responsable_id}</span>
                                )}
                            </div>
                        )}

                    </div>
                
                    {/* Descripción */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Descripción del servicio solicitado o falla a reparar <span className="text-red-500">*</span>
                        </label>
                        <textarea 
                            value={data.descripcion_servicio}
                            onChange={e => setData('descripcion_servicio', e.target.value)}
                            rows={4} 
                            placeholder="Describa detalladamente la falla presentada o el mantenimiento requerido..." 
                            className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-[#1A2E5E]/20 focus:border-[#1A2E5E] resize-none transition-all" 
                        />
                        {errors.descripcion_servicio && (
                            <span className="text-red-500 text-xs mt-0.5">{errors.descripcion_servicio}</span>
                        )}
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                    <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={processing} className="bg-[#1A2E5E] hover:bg-[#1A2E5E]/90 text-white">
                        {processing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" /> Guardar Solicitud
                            </>
                        )}
                    </Button>
                </div>
                
            </form>
        </div>
    );
}