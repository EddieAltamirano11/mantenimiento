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
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { router } from "@inertiajs/react";
import { useState } from "react";

export default function ConfirmStatusDialog({ isOpen, onClose, solicitud, targetStatus }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!solicitud || !targetStatus) return null;

    const isReject = targetStatus === "Rechazada";
    const isComplete = targetStatus === "Completada";

    const handleConfirm = () => {
        setIsSubmitting(true);
        router.put(
            route("solicitudes.update", solicitud.id),
            { estado: targetStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    onClose();
                },
                onError: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-md">
                <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isReject ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                        {isReject ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {isReject ? "¿Rechazar solicitud?" : "¿Marcar como completada?"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {isReject ? (
                                    <>
                                        La solicitud con folio <strong className="text-slate-800 font-semibold">{solicitud.folio}</strong> será marcada como <strong>Rechazada</strong> y se dará por concluida.
                                    </>
                                ) : (
                                    <>
                                        ¿Confirma que el servicio de mantenimiento para la solicitud con folio <strong className="text-slate-800 font-semibold">{solicitud.folio}</strong> ha sido finalizado con éxito?
                                    </>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                    </div>
                </div>

                <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className={`text-white flex items-center gap-2 ${
                            isReject 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Procesando...
                            </>
                        ) : isReject ? (
                            <>
                                <XCircle className="w-4 h-4" />
                                Confirmar rechazo
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Confirmar completada
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
