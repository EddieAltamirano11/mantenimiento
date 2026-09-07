import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/Components/ui/button";

function AlertDialog({ open, onOpenChange, children }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" 
                onClick={() => onOpenChange && onOpenChange(false)}
            />
            <div className="relative z-50 w-full max-w-lg">
                {children}
            </div>
        </div>
    );
}

function AlertDialogContent({ className, children, ...props }) {
    return (
        <div
            className={cn(
                "relative bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

function AlertDialogHeader({ className, ...props }) {
    return (
        <div
            className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
            {...props}
        />
    );
}

function AlertDialogFooter({ className, ...props }) {
    return (
        <div
            className={cn(
                "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6 gap-2 sm:gap-0",
                className
            )}
            {...props}
        />
    );
}

function AlertDialogTitle({ className, ...props }) {
    return (
        <h3
            className={cn("text-lg font-bold text-slate-900", className)}
            {...props}
        />
    );
}

function AlertDialogDescription({ className, ...props }) {
    return (
        <p
            className={cn("text-sm text-slate-500 leading-relaxed", className)}
            {...props}
        />
    );
}

function AlertDialogAction({ className, ...props }) {
    return (
        <button
            className={cn(buttonVariants({ variant: "destructive" }), className)}
            {...props}
        />
    );
}

function AlertDialogCancel({ className, onClick, ...props }) {
    return (
        <button
            type="button"
            className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
            onClick={onClick}
            {...props}
        />
    );
}

export {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
};
