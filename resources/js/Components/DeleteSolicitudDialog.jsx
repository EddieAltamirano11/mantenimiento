import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/Components/ui/alert-dialog";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { router } from "@inertiajs/react";
import { useState } from "react";

export default function DeleteSolicitudDialog({ isOpen, onClose, solicitud }) {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!solicitud) return null;

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route("solicitudes.destroy", solicitud.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleting(false);
                onClose();
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-md">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar solicitud?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción eliminará permanentemente la solicitud de mantenimiento con folio{" "}
                                <strong className="text-slate-800 font-semibold">
                                    {solicitud.folio}
                                </strong>
                                . Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                    </div>
                </div>

                <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel onClick={onClose} disabled={isDeleting}>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Eliminando...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Confirmar eliminación
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
