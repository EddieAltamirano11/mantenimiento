import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/Components/ui/table";
import { Button } from "@/Components/ui/button";
import { 
    Eye, 
    Printer, 
    Pencil, 
    Trash2, 
    Check, 
    X, 
    CheckCircle2, 
    Search, 
    ChevronDown, 
    Plus,
    FileSpreadsheet,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle
} from "lucide-react";
import CreateSolicitudModal from '@/Components/CreateSolicitudModal';
import EditSolicitudModal from '@/Components/EditSolicitudModal';
import ViewSolicitudModal from '@/Components/ViewSolicitudModal';
import DeleteSolicitudDialog from '@/Components/DeleteSolicitudDialog';
import AceptarSolicitudModal from '@/Components/AceptarSolicitudModal';
import ConfirmStatusDialog from '@/Components/ConfirmStatusDialog';

import { useState, useMemo } from 'react';

export default function Index({ solicitudes = [], departamentos = [], personal = [], filters = {} }) {    
    const { auth, flash } = usePage().props;
    const selectedRole = auth?.user?.rol || "Encargado"; 

    // Estados para búsqueda y filtrado
    const [searchQuery, setSearchQuery] = useState("");
    const [filterBy, setFilterBy] = useState(filters?.filter_by || "Folio");
    const [tecnicoTab, setTecnicoTab] = useState("todas"); // "todas" | "asignadas" | "mis_solicitudes"

    // Estados para Modales
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isAceptarModalOpen, setIsAceptarModalOpen] = useState(false);
    const [isConfirmStatusOpen, setIsConfirmStatusOpen] = useState(false);
    const [targetStatus, setTargetStatus] = useState(null);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);

    const FILTER_OPTIONS = ["Folio", "Depto. Solicitante", "Depto. Destino"];
    
    // Filtrado reactivo en tiempo real
    const filteredSolicitudes = useMemo(() => {
        let list = solicitudes;

        // Filtro por pestaña para rol Técnico
        if (selectedRole === "Tecnico" && auth?.user?.personal_id) {
            if (tecnicoTab === "asignadas") {
                list = list.filter(item => item.responsable_id === auth.user.personal_id);
            } else if (tecnicoTab === "mis_solicitudes") {
                list = list.filter(item => item.solicitante_id === auth.user.personal_id);
            }
        }

        if (!searchQuery.trim()) return list;

        const query = searchQuery.toLowerCase().trim();

        return list.filter((item) => {
            const folio = (item.folio || "").toLowerCase();
            const deptoSolicitante = (item.departamento_solicitante_nombre || item.departamento_nombre || "").toLowerCase();
            const deptoDestino = (item.departamento_destino_nombre || "").toLowerCase();

            if (filterBy === "Folio") {
                return folio.includes(query);
            }
            if (filterBy === "Depto. Solicitante") {
                return deptoSolicitante.includes(query);
            }
            if (filterBy === "Depto. Destino") {
                return deptoDestino.includes(query);
            }

            return folio.includes(query) || deptoSolicitante.includes(query) || deptoDestino.includes(query);
        });
    }, [solicitudes, searchQuery, filterBy, tecnicoTab, selectedRole, auth?.user?.personal_id]);

    // Asigna colores y badge dependiendo del estado
    const getStatusBadge = (estado) => {
        switch (estado) {
            case 'Pendiente':
                return {
                    class: 'bg-amber-50 text-amber-700 border-amber-200',
                    icon: <Clock className="w-3.5 h-3.5 mr-1" />
                };
            case 'Aceptada':
                return {
                    class: 'bg-blue-50 text-blue-700 border-blue-200',
                    icon: <CheckCircle className="w-3.5 h-3.5 mr-1" />
                };
            case 'Completada':
                return {
                    class: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                };
            case 'Rechazada':
                return {
                    class: 'bg-red-50 text-red-700 border-red-200',
                    icon: <XCircle className="w-3.5 h-3.5 mr-1" />
                };
            default:
                return {
                    class: 'bg-slate-50 text-slate-700 border-slate-200',
                    icon: <AlertCircle className="w-3.5 h-3.5 mr-1" />
                };
        }
    };

    // Acciones de apertura de modales
    const handleView = (solicitud) => {
        setSelectedSolicitud(solicitud);
        setIsViewModalOpen(true);
    };

    const handleEdit = (solicitud) => {
        setSelectedSolicitud(solicitud);
        setIsEditModalOpen(true);
    };

    const handleDelete = (solicitud) => {
        setSelectedSolicitud(solicitud);
        setIsDeleteDialogOpen(true);
    };

    const handlePrint = (solicitud) => {
        window.open(route('solicitudes.pdf', solicitud.id), '_blank');
    };

    // Acciones de cambio de estatus con modales dedicados
    const handleAceptar = (solicitud) => {
        setSelectedSolicitud(solicitud);
        setIsAceptarModalOpen(true);
    };

    const handleRechazar = (solicitud) => {
        setSelectedSolicitud(solicitud);
        setTargetStatus("Rechazada");
        setIsConfirmStatusOpen(true);
    };

    const handleCompletar = (solicitud) => {
        setSelectedSolicitud(solicitud);
        setTargetStatus("Completada");
        setIsConfirmStatusOpen(true);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Historial de Solicitudes" />

            <main className="max-w-[1400px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 print:hidden">
                
                {/* Mensaje Flash de éxito */}
                {flash?.success && (
                    <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between animate-in fade-in duration-200">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            <span>{flash.success}</span>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                    
                    {/* --- BARRA SUPERIOR (Toolbar) --- */}
                    <div className="px-5 sm:px-8 pt-6 sm:pt-7 pb-5 border-b border-slate-100">
                        <div className="flex items-center justify-between mb-5 sm:mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#1A2E5E]/10 flex items-center justify-center text-[#1A2E5E] shrink-0">
                                    <FileSpreadsheet className="w-5 h-5" />
                                </div>
                                <div>
                                    <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1A2E5E]">
                                        Historial de Solicitudes
                                    </h1>
                                    <p className="text-xs text-slate-500">
                                        Gestión y seguimiento de solicitudes de mantenimiento institucional
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Barra de Búsqueda y Botón Crear */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#1A2E5E]/20 focus-within:border-[#1A2E5E] transition-all flex-1 max-w-xl">
                                
                                {/* Selector de filtro */}
                                <div className="relative border-r border-slate-200 bg-slate-50 flex items-center shrink-0">
                                    <label htmlFor="filter-by" className="pl-3 text-xs text-slate-400 font-normal select-none">
                                        Filtro:
                                    </label>
                                    <select
                                        id="filter-by"
                                        value={filterBy}
                                        onChange={(e) => setFilterBy(e.target.value)}
                                        className="bg-transparent text-xs font-semibold text-slate-700 py-2.5 pl-1.5 pr-8 border-none ring-0 focus:ring-0 focus:outline-none cursor-pointer appearance-none"
                                    >
                                        {FILTER_OPTIONS.map((option) => (
                                            <option key={option} value={option} className="text-slate-800 font-medium py-1">
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={13} className="text-slate-500 pointer-events-none absolute right-2.5" />
                                </div>

                                {/* Input de búsqueda */}
                                <div className="flex items-center px-3 gap-2 flex-1">
                                    <Search size={15} className="text-slate-400 shrink-0" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={`Buscar por ${filterBy.toLowerCase()}...`}
                                        className="w-full text-sm py-2 bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400 border-none ring-0 focus:ring-0"
                                    />
                                    {searchQuery && (
                                        <button 
                                            type="button" 
                                            onClick={() => setSearchQuery("")}
                                            className="text-slate-400 hover:text-slate-600 p-1"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <Button 
                                className="bg-[#1A2E5E] hover:bg-[#1A2E5E]/90 text-white shrink-0 shadow-sm"
                                onClick={() => setIsCreateModalOpen(true)} 
                            >
                                <Plus className="w-4 h-4 mr-2"/> Crear solicitud
                            </Button>
                        </div>
                    </div>

                    {/* --- SUB-BARRA: Pestañas para rol Técnico y contador --- */}
                    <div className="px-5 sm:px-8 py-3 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
                        {selectedRole === "Tecnico" ? (
                            <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl w-fit flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => setTecnicoTab("todas")}
                                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                                        tecnicoTab === "todas"
                                            ? "bg-white text-[#1A2E5E] shadow-xs"
                                            : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    Todas ({solicitudes.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTecnicoTab("asignadas")}
                                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                                        tecnicoTab === "asignadas"
                                            ? "bg-white text-blue-700 shadow-xs"
                                            : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    Órdenes Asignadas ({solicitudes.filter(s => s.responsable_id === auth?.user?.personal_id).length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTecnicoTab("mis_solicitudes")}
                                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                                        tecnicoTab === "mis_solicitudes"
                                            ? "bg-white text-emerald-700 shadow-xs"
                                            : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    Mis Solicitudes ({solicitudes.filter(s => s.solicitante_id === auth?.user?.personal_id).length})
                                </button>
                            </div>
                        ) : (
                            <div />
                        )}
                        <p className="text-xs text-slate-500">
                            Mostrando <span className="font-semibold text-slate-700">{filteredSolicitudes.length}</span> de <span className="font-semibold text-slate-700">{solicitudes.length}</span> solicitudes
                        </p>
                    </div>

                    {/* --- VISTA ESCRITORIO / TABLET: TABLA DE SHADCN (md en adelante) --- */}
                    <div className="hidden md:block overflow-x-auto">
                        <Table className="w-full">
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                    <TableHead className="font-semibold text-slate-700 pl-6 sm:pl-8 whitespace-nowrap">Folio</TableHead>
                                    <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Fecha</TableHead>
                                    <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Depto. Solicitante</TableHead>
                                    <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Depto. Destino</TableHead>
                                    <TableHead className="font-semibold text-slate-700 whitespace-nowrap">Estatus</TableHead>
                                    <TableHead className="font-semibold text-slate-700 text-right pr-6 sm:pr-8 whitespace-nowrap">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSolicitudes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                                <AlertCircle size={32} className="text-slate-300" />
                                                <p className="font-medium text-slate-600">No se encontraron solicitudes</p>
                                                <p className="text-xs text-slate-400">Intente con otro término de búsqueda o limpie los filtros.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSolicitudes.map((solicitud) => {
                                        const badge = getStatusBadge(solicitud.estado);

                                        return (
                                            <TableRow key={solicitud.id} className="hover:bg-slate-50/60 transition-colors">
                                                
                                                {/* Folio */}
                                                <TableCell className="font-medium text-slate-800 pl-6 sm:pl-8 whitespace-nowrap">
                                                    <span className="font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs border border-slate-200">
                                                        {solicitud.folio}
                                                    </span>
                                                </TableCell>
                                                
                                                {/* Fecha */}
                                                <TableCell className="text-slate-600 text-sm whitespace-nowrap">
                                                    {solicitud.fecha_elaboracion}
                                                </TableCell>

                                                {/* Depto Solicitante */}
                                                <TableCell className="text-slate-700 font-medium text-sm max-w-[220px] truncate" title={solicitud.departamento_solicitante_nombre || solicitud.departamento_nombre}>
                                                    {solicitud.departamento_solicitante_nombre || solicitud.departamento_nombre}
                                                </TableCell>

                                                {/* Depto Destino */}
                                                <TableCell className="text-slate-700 font-medium text-sm max-w-[220px] truncate" title={solicitud.departamento_destino_nombre || "-"}>
                                                    {solicitud.departamento_destino_nombre || "-"}
                                                </TableCell>
                                                
                                                {/* Estatus */}
                                                <TableCell className="whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.class}`}>
                                                        {badge.icon}
                                                        {solicitud.estado}
                                                    </span>
                                                </TableCell>
                                                
                                                {/* Acciones organizadas en dos filas */}
                                                <TableCell className="text-right pr-6 sm:pr-8 whitespace-nowrap py-3">
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        
                                                        {/* Fila 1: Acciones Generales / Gestión (Ver, Editar, Eliminar, Imprimir) */}
                                                        <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                                                            {/* Ver */}
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                title="Ver detalle"
                                                                className="h-8 px-2.5 xl:px-3 text-xs"
                                                                onClick={() => handleView(solicitud)}
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                                <span className="hidden xl:inline ml-1.5">Ver</span>
                                                            </Button>

                                                            {/* Solicitante: Editar y Eliminar si Pendiente */}
                                                            {selectedRole === "Solicitante" && solicitud.estado === 'Pendiente' && (
                                                                <>
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm" 
                                                                        title="Editar solicitud"
                                                                        className="h-8 px-2.5 xl:px-3 text-xs"
                                                                        onClick={() => handleEdit(solicitud)}
                                                                    >
                                                                        <Pencil className="w-3.5 h-3.5" />
                                                                        <span className="hidden xl:inline ml-1.5">Editar</span>
                                                                    </Button>
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm" 
                                                                        title="Eliminar solicitud"
                                                                        className="h-8 px-2.5 xl:px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                                        onClick={() => handleDelete(solicitud)}
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                        <span className="hidden xl:inline ml-1.5">Eliminar</span>
                                                                    </Button>
                                                                </>
                                                            )}

                                                            {/* Encargado: Editar y Eliminar si Pendiente */}
                                                            {selectedRole === "Encargado" && solicitud.estado === 'Pendiente' && (
                                                                <>
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm" 
                                                                        title="Editar solicitud"
                                                                        className="h-8 px-2.5 xl:px-3 text-xs"
                                                                        onClick={() => handleEdit(solicitud)}
                                                                    >
                                                                        <Pencil className="w-3.5 h-3.5" />
                                                                        <span className="hidden xl:inline ml-1.5">Editar</span>
                                                                    </Button>
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm" 
                                                                        title="Eliminar solicitud"
                                                                        className="h-8 px-2.5 xl:px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                                        onClick={() => handleDelete(solicitud)}
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                        <span className="hidden xl:inline ml-1.5">Eliminar</span>
                                                                    </Button>
                                                                </>
                                                            )}

                                                            {/* Técnico: Editar y Eliminar si es su solicitud creada y está Pendiente */}
                                                            {selectedRole === "Tecnico" && solicitud.solicitante_id === auth?.user?.personal_id && solicitud.estado === 'Pendiente' && (
                                                                <>
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm" 
                                                                        title="Editar solicitud"
                                                                        className="h-8 px-2.5 xl:px-3 text-xs"
                                                                        onClick={() => handleEdit(solicitud)}
                                                                    >
                                                                        <Pencil className="w-3.5 h-3.5" />
                                                                        <span className="hidden xl:inline ml-1.5">Editar</span>
                                                                    </Button>
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm" 
                                                                        title="Eliminar solicitud"
                                                                        className="h-8 px-2.5 xl:px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                                        onClick={() => handleDelete(solicitud)}
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                        <span className="hidden xl:inline ml-1.5">Eliminar</span>
                                                                    </Button>
                                                                </>
                                                            )}

                                                            {/* Imprimir */}
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                title="Imprimir formato PDF"
                                                                className="h-8 px-2.5 xl:px-3 text-xs"
                                                                onClick={() => handlePrint(solicitud)}
                                                            >
                                                                <Printer className="w-3.5 h-3.5" />
                                                                <span className="hidden xl:inline ml-1.5">Imprimir</span>
                                                            </Button>
                                                        </div>

                                                        {/* Fila 2: Acciones de Flujo de Estado (Aceptar, Rechazar, Completar) */}
                                                        {((selectedRole === "Encargado" && (solicitud.estado === 'Pendiente' || solicitud.estado === 'Aceptada')) || 
                                                          (selectedRole === "Tecnico" && solicitud.responsable_id === auth?.user?.personal_id && solicitud.estado === 'Aceptada')) && (
                                                            <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                                                                {selectedRole === "Encargado" && solicitud.estado === 'Pendiente' && (
                                                                    <>
                                                                        <Button 
                                                                            variant="outline" 
                                                                            size="sm" 
                                                                            title="Aceptar y asignar técnico"
                                                                            className="h-7 px-2.5 xl:px-3 text-xs font-medium text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                                                                            onClick={() => handleAceptar(solicitud)}
                                                                        >
                                                                            <Check className="w-3.5 h-3.5 mr-1" />
                                                                            <span>Aceptar</span>
                                                                        </Button>
                                                                        <Button 
                                                                            variant="outline" 
                                                                            size="sm" 
                                                                            title="Rechazar solicitud"
                                                                            className="h-7 px-2.5 xl:px-3 text-xs font-medium text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                                                                            onClick={() => handleRechazar(solicitud)}
                                                                        >
                                                                            <X className="w-3.5 h-3.5 mr-1" />
                                                                            <span>Rechazar</span>
                                                                        </Button>
                                                                    </>
                                                                )}

                                                                {selectedRole === "Encargado" && solicitud.estado === 'Aceptada' && (
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm" 
                                                                        title="Marcar como completada"
                                                                        className="h-7 px-2.5 xl:px-3 text-xs font-medium text-emerald-600 hover:text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                                                        onClick={() => handleCompletar(solicitud)}
                                                                    >
                                                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                                                        <span>Completar</span>
                                                                    </Button>
                                                                )}

                                                                {selectedRole === "Tecnico" && solicitud.responsable_id === auth?.user?.personal_id && solicitud.estado === 'Aceptada' && (
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm" 
                                                                        title="Marcar como completada"
                                                                        className="h-7 px-2.5 xl:px-3 text-xs font-medium text-emerald-600 hover:text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                                                        onClick={() => handleCompletar(solicitud)}
                                                                    >
                                                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                                                        <span>Completar</span>
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        )}

                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}

                            </TableBody>
                        </Table>
                    </div>

                    {/* --- VISTA MÓVIL: TARJETAS VERTICALES (< md) --- */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {filteredSolicitudes.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                                <AlertCircle size={32} className="text-slate-300" />
                                <p className="font-medium text-slate-600">No se encontraron solicitudes</p>
                                <p className="text-xs text-slate-400">Intente con otro término de búsqueda o limpie los filtros.</p>
                            </div>
                        ) : (
                            filteredSolicitudes.map((solicitud) => {
                                const badge = getStatusBadge(solicitud.estado);

                                return (
                                    <div key={`card-${solicitud.id}`} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors space-y-3">
                                        {/* Header de la Card: Folio + Estatus */}
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-mono bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200">
                                                {solicitud.folio}
                                            </span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.class}`}>
                                                {badge.icon}
                                                {solicitud.estado}
                                            </span>
                                        </div>

                                        {/* Detalles */}
                                        <div className="space-y-2 text-xs">
                                            <div className="flex items-center justify-between text-slate-500">
                                                <span>Fecha de elaboración:</span>
                                                <span className="font-medium text-slate-700">{solicitud.fecha_elaboracion}</span>
                                            </div>

                                            {/* Flujo de Departamentos */}
                                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-slate-400 text-[11px]">Depto. Solicitante:</span>
                                                    <span className="font-semibold text-slate-700 text-right">{solicitud.departamento_solicitante_nombre || solicitud.departamento_nombre}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-slate-400 text-[11px]">Depto. Destino:</span>
                                                    <span className="font-semibold text-[#1A2E5E] text-right">{solicitud.departamento_destino_nombre || "-"}</span>
                                                </div>
                                            </div>

                                            {/* Descripción del servicio */}
                                            {solicitud.descripcion_servicio && (
                                                <div className="pt-0.5">
                                                    <span className="text-slate-400 block text-[11px] mb-0.5">Descripción:</span>
                                                    <p className="text-slate-600 bg-slate-50/70 p-2 rounded-lg border border-slate-100 text-xs line-clamp-2 leading-relaxed">
                                                        {solicitud.descripcion_servicio}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Botones de acción en la Card organizados en 2 filas */}
                                        <div className="pt-2 border-t border-slate-100 space-y-2">
                                            {/* Fila 1: Gestión */}
                                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                {/* Ver */}
                                                <Button variant="outline" size="sm" onClick={() => handleView(solicitud)}>
                                                    <Eye className="w-4 h-4 mr-1.5" /> Ver
                                                </Button>

                                                {/* Solicitante */}
                                                {selectedRole === "Solicitante" && solicitud.estado === 'Pendiente' && (
                                                    <>
                                                        <Button variant="outline" size="sm" onClick={() => handleEdit(solicitud)}>
                                                            <Pencil className="w-4 h-4 mr-1.5" /> Editar
                                                        </Button>
                                                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => handleDelete(solicitud)}>
                                                            <Trash2 className="w-4 h-4 mr-1.5" /> Eliminar
                                                        </Button>
                                                    </>
                                                )}

                                                {/* Encargado */}
                                                {selectedRole === "Encargado" && solicitud.estado === 'Pendiente' && (
                                                    <>
                                                        <Button variant="outline" size="sm" onClick={() => handleEdit(solicitud)}>
                                                            <Pencil className="w-4 h-4 mr-1.5" /> Editar
                                                        </Button>
                                                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => handleDelete(solicitud)}>
                                                            <Trash2 className="w-4 h-4 mr-1.5" /> Eliminar
                                                        </Button>
                                                    </>
                                                )}

                                                {/* Técnico */}
                                                {selectedRole === "Tecnico" && solicitud.solicitante_id === auth?.user?.personal_id && solicitud.estado === 'Pendiente' && (
                                                    <>
                                                        <Button variant="outline" size="sm" onClick={() => handleEdit(solicitud)}>
                                                            <Pencil className="w-4 h-4 mr-1.5" /> Editar
                                                        </Button>
                                                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => handleDelete(solicitud)}>
                                                            <Trash2 className="w-4 h-4 mr-1.5" /> Eliminar
                                                        </Button>
                                                    </>
                                                )}

                                                {/* Imprimir */}
                                                <Button variant="outline" size="sm" onClick={() => handlePrint(solicitud)}>
                                                    <Printer className="w-4 h-4 mr-1.5" /> Imprimir
                                                </Button>
                                            </div>

                                            {/* Fila 2: Flujo de estado */}
                                            {((selectedRole === "Encargado" && (solicitud.estado === 'Pendiente' || solicitud.estado === 'Aceptada')) || 
                                              (selectedRole === "Tecnico" && solicitud.responsable_id === auth?.user?.personal_id && solicitud.estado === 'Aceptada')) && (
                                                <div className="flex items-center justify-end gap-2 pt-1">
                                                    {selectedRole === "Encargado" && solicitud.estado === 'Pendiente' && (
                                                        <>
                                                            <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50 font-medium" onClick={() => handleAceptar(solicitud)}>
                                                                <Check className="w-3.5 h-3.5 mr-1" /> Aceptar
                                                            </Button>
                                                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 font-medium" onClick={() => handleRechazar(solicitud)}>
                                                                <X className="w-3.5 h-3.5 mr-1" /> Rechazar
                                                            </Button>
                                                        </>
                                                    )}

                                                    {selectedRole === "Encargado" && solicitud.estado === 'Aceptada' && (
                                                        <Button variant="outline" size="sm" className="text-emerald-600 hover:text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-medium" onClick={() => handleCompletar(solicitud)}>
                                                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Completar
                                                        </Button>
                                                    )}

                                                    {selectedRole === "Tecnico" && solicitud.responsable_id === auth?.user?.personal_id && solicitud.estado === 'Aceptada' && (
                                                        <Button variant="outline" size="sm" className="text-emerald-600 hover:text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-medium" onClick={() => handleCompletar(solicitud)}>
                                                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Completar
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* --- MODALES SEPARADOS E INDEPENDIENTES --- */}
                
                {/* 1. Modal de Creación */}
                <CreateSolicitudModal 
                    isOpen={isCreateModalOpen} 
                    onClose={() => setIsCreateModalOpen(false)} 
                    departamentos={departamentos}
                    personal={personal}
                />

                {/* 2. Modal de Edición */}
                <EditSolicitudModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedSolicitud(null);
                    }}
                    solicitud={selectedSolicitud}
                    departamentos={departamentos}
                    personal={personal}
                />

                {/* 3. Modal de Visualización */}
                <ViewSolicitudModal
                    isOpen={isViewModalOpen}
                    onClose={() => {
                        setIsViewModalOpen(false);
                        setSelectedSolicitud(null);
                    }}
                    solicitud={selectedSolicitud}
                />

                {/* 4. AlertDialog de Confirmación de Eliminación */}
                <DeleteSolicitudDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => {
                        setIsDeleteDialogOpen(false);
                        setSelectedSolicitud(null);
                    }}
                    solicitud={selectedSolicitud}
                />

                {/* 5. Modal para Aceptar y Asignar Técnico (Encargado) */}
                <AceptarSolicitudModal
                    isOpen={isAceptarModalOpen}
                    onClose={() => {
                        setIsAceptarModalOpen(false);
                        setSelectedSolicitud(null);
                    }}
                    solicitud={selectedSolicitud}
                    personal={personal}
                />

                {/* 6. AlertDialog para Confirmar Rechazo o Finalización */}
                <ConfirmStatusDialog
                    isOpen={isConfirmStatusOpen}
                    onClose={() => {
                        setIsConfirmStatusOpen(false);
                        setSelectedSolicitud(null);
                        setTargetStatus(null);
                    }}
                    solicitud={selectedSolicitud}
                    targetStatus={targetStatus}
                />

            </main>
        </AuthenticatedLayout>
    );
}