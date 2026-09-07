<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class HistorialController extends Controller
{
    /**
     * Display a listing of solicitudes with related data.
     */
    public function index(Request $request): InertiaResponse
    {
        $search = $request->input('search');
        $filterBy = $request->input('filter_by', 'Folio');

        $departamentos = DB::table('departamentos')
            ->orderBy('nombre')
            ->get();

        $personal = DB::table('personal')
            ->join('users', 'personal.usuario_id', '=', 'users.id')
            ->join('departamentos', 'personal.departamento_id', '=', 'departamentos.id')
            ->select('personal.*', 'departamentos.nombre as departamento_nombre', 'departamentos.brinda_mantenimiento', 'users.rol as rol')
            ->orderBy('personal.nombre')
            ->get();

        $query = DB::table('solicitudes')
            ->join('departamentos as depto_solicitante', 'solicitudes.departamento_solicitante_id', '=', 'depto_solicitante.id')
            ->join('departamentos as depto_destino', 'solicitudes.departamento_destino_id', '=', 'depto_destino.id')
            ->join('personal as solicitante', 'solicitudes.solicitante_id', '=', 'solicitante.id')
            ->leftJoin('personal as responsable', 'solicitudes.responsable_id', '=', 'responsable.id')
            ->select(
                'solicitudes.*',
                'depto_solicitante.nombre as departamento_solicitante_nombre',
                'depto_solicitante.nombre as departamento_nombre',
                'depto_destino.nombre as departamento_destino_nombre',
                'solicitante.nombre as solicitante_nombre',
                'responsable.nombre as responsable_nombre'
            );

        // 1. Filtrado por rol del usuario autenticado (Alcance de Visualización)
        $user = $request->user();
        if ($user) {
            $perfil = DB::table('personal')->where('usuario_id', $user->id)->first();

            if ($perfil) {
                if ($user->rol === 'Solicitante') {
                    // Solicitante: Ver únicamente sus propias solicitudes
                    $query->where('solicitudes.solicitante_id', $perfil->id);
                } elseif ($user->rol === 'Encargado') {
                    // Encargado: Ver solicitudes dirigidas a SU departamento
                    $query->where('solicitudes.departamento_destino_id', $perfil->departamento_id);
                } elseif ($user->rol === 'Tecnico') {
                    // Técnico: Ver solicitudes asignadas a él (para resolver) Y solicitudes que él mismo creó (como solicitante)
                    $query->where(function ($q) use ($perfil) {
                        $q->where('solicitudes.responsable_id', $perfil->id)
                            ->orWhere('solicitudes.solicitante_id', $perfil->id);
                    });
                }
            }
        }

        if ($search) {
            $query->where(function ($q) use ($search, $filterBy) {
                if ($filterBy === 'Folio') {
                    $q->where('solicitudes.folio', 'like', "%{$search}%");
                } elseif ($filterBy === 'Depto. Solicitante') {
                    $q->where('depto_solicitante.nombre', 'like', "%{$search}%");
                } elseif ($filterBy === 'Depto. Destino') {
                    $q->where('depto_destino.nombre', 'like', "%{$search}%");
                } else {
                    $q->where('solicitudes.folio', 'like', "%{$search}%")
                        ->orWhere('depto_solicitante.nombre', 'like', "%{$search}%")
                        ->orWhere('depto_destino.nombre', 'like', "%{$search}%");
                }
            });
        }

        $solicitudes = $query->orderBy('solicitudes.created_at', 'desc')->get();

        return Inertia::render('HistorialSolicitudes/Index', [
            'departamentos' => $departamentos,
            'personal' => $personal,
            'solicitudes' => $solicitudes,
            'filters' => [
                'search' => $search,
                'filter_by' => $filterBy,
            ],
        ]);
    }

    /**
     * Store a newly created solicitud in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $perfil = $user ? DB::table('personal')->where('usuario_id', $user->id)->first() : null;

        // Si el usuario es Solicitante o Técnico creando una solicitud propia
        if ($user && in_array($user->rol, ['Solicitante', 'Tecnico']) && $perfil) {
            $validated = $request->validate([
                'departamento_destino_id' => 'required|string|exists:departamentos,id',
                'descripcion_servicio' => 'required|string|max:2500',
            ]);

            // Validar que el destino brinde mantenimiento
            $deptoDestino = DB::table('departamentos')->where('id', $validated['departamento_destino_id'])->first();
            if (! $deptoDestino || ! $deptoDestino->brinda_mantenimiento) {
                return back()->withErrors(['departamento_destino_id' => 'El departamento seleccionado no brinda servicios de mantenimiento.']);
            }

            $deptoSolicitanteId = $perfil->departamento_id;
            $solicitanteId = $perfil->id;
            $responsableId = null;
        } else {
            $validated = $request->validate([
                'departamento_solicitante_id' => 'required|string|exists:departamentos,id',
                'solicitante_id' => 'required|string|exists:personal,id',
                'departamento_destino_id' => 'required|string|exists:departamentos,id',
                'responsable_id' => 'nullable|string|exists:personal,id',
                'descripcion_servicio' => 'required|string|max:2500',
            ]);

            $deptoDestino = DB::table('departamentos')->where('id', $validated['departamento_destino_id'])->first();
            if (! $deptoDestino || ! $deptoDestino->brinda_mantenimiento) {
                return back()->withErrors(['departamento_destino_id' => 'El departamento seleccionado no brinda servicios de mantenimiento.']);
            }

            $deptoSolicitanteId = $validated['departamento_solicitante_id'];
            $solicitanteId = $validated['solicitante_id'];
            $responsableId = ! empty($validated['responsable_id']) ? $validated['responsable_id'] : null;
        }

        $añoActual = date('Y');
        $contador = DB::table('solicitudes')->whereYear('created_at', $añoActual)->count() + 1;
        $folio = 'MANT-'.$añoActual.'-'.str_pad($contador, 3, '0', STR_PAD_LEFT);

        while (DB::table('solicitudes')->where('folio', $folio)->exists()) {
            $contador++;
            $folio = 'MANT-'.$añoActual.'-'.str_pad($contador, 3, '0', STR_PAD_LEFT);
        }

        $id = Str::uuid()->toString();

        DB::table('solicitudes')->insert([
            'id' => $id,
            'folio' => $folio,
            'fecha_elaboracion' => now()->toDateString(),
            'descripcion_servicio' => $validated['descripcion_servicio'],
            'departamento_solicitante_id' => $deptoSolicitanteId,
            'departamento_destino_id' => $validated['departamento_destino_id'],
            'solicitante_id' => $solicitanteId,
            'responsable_id' => $responsableId,
            'estado' => 'Pendiente',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Solicitud creada con éxito.');
    }

    /**
     * Update the specified solicitud in storage.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $solicitud = DB::table('solicitudes')->where('id', $id)->first();

        if (! $solicitud) {
            return back()->withErrors(['message' => 'Solicitud no encontrada.']);
        }

        // 1. Caso de actualización rápida de estatus (Aceptar / Rechazar / Completar)
        if ($request->has('estado') && ! $request->has('descripcion_servicio')) {
            $validated = $request->validate([
                'estado' => 'required|string|in:Pendiente,Aceptada,Rechazada,Completada',
                'responsable_id' => 'nullable|string|exists:personal,id',
            ]);

            $user = $request->user();
            $perfil = $user ? DB::table('personal')->where('usuario_id', $user->id)->first() : null;

            // Solicitante no puede modificar estatus
            if ($user && $user->rol === 'Solicitante') {
                return back()->withErrors(['message' => 'Los solicitantes no pueden modificar el estatus de las solicitudes.']);
            }

            // Encargado: Regla D2 -> D3 (Aceptar y Asignar / Rechazar / Completar)
            if ($user && $user->rol === 'Encargado') {
                if ($validated['estado'] === 'Aceptada') {
                    $respId = $validated['responsable_id'] ?? $solicitud->responsable_id;
                    if (empty($respId)) {
                        return back()->withErrors(['responsable_id' => 'Debe designar un técnico responsable al aceptar la solicitud.']);
                    }
                    // Validar que el responsable sea de rol Técnico
                    $tecnicoUser = DB::table('personal')
                        ->join('users', 'personal.usuario_id', '=', 'users.id')
                        ->where('personal.id', $respId)
                        ->select('users.rol')
                        ->first();
                    if (! $tecnicoUser || $tecnicoUser->rol !== 'Tecnico') {
                        return back()->withErrors(['responsable_id' => 'El personal seleccionado debe contar con el rol de Técnico.']);
                    }
                } elseif ($validated['estado'] === 'Completada') {
                    if ($solicitud->estado !== 'Aceptada') {
                        return back()->withErrors(['message' => 'Solo se pueden completar solicitudes que hayan sido previamente aceptadas.']);
                    }
                    if (! $perfil || $solicitud->departamento_destino_id !== $perfil->departamento_id) {
                        return back()->withErrors(['message' => 'Solo puede completar solicitudes dirigidas a su departamento.']);
                    }
                }
            }

            // Técnico: Regla E2 (Marcar solicitud como 'Completada')
            if ($user && $user->rol === 'Tecnico') {
                if ($validated['estado'] !== 'Completada') {
                    return back()->withErrors(['message' => 'El personal técnico únicamente puede marcar solicitudes como completadas.']);
                }
                if ($solicitud->estado !== 'Aceptada') {
                    return back()->withErrors(['message' => 'Solo se pueden completar solicitudes que hayan sido aceptadas.']);
                }
                if (! $perfil || $solicitud->responsable_id !== $perfil->id) {
                    return back()->withErrors(['message' => 'Solo puede marcar como completadas las órdenes asignadas a usted.']);
                }
            }

            $updateData = [
                'estado' => $validated['estado'],
                'updated_at' => now(),
            ];

            if ($request->has('responsable_id')) {
                $updateData['responsable_id'] = $validated['responsable_id'] ?: null;
            }

            DB::table('solicitudes')->where('id', $id)->update($updateData);

            return back()->with('success', 'Estatus de la solicitud actualizado a '.$validated['estado'].'.');
        }

        // 2. Caso de edición completa de la solicitud
        $user = $request->user();
        $perfil = $user ? DB::table('personal')->where('usuario_id', $user->id)->first() : null;

        // Regla D4/D5: Si la solicitud ya fue aceptada, rechazada o completada, está BLOQUEADA
        if ($solicitud->estado !== 'Pendiente') {
            return back()->withErrors([
                'message' => 'Acceso denegado: La solicitud ya fue procesada ('.$solicitud->estado.') y se encuentra bloqueada para edición.',
            ]);
        }

        // Si es Solicitante o Técnico editando su propia solicitud
        if ($user && in_array($user->rol, ['Solicitante', 'Tecnico'])) {
            if (! $perfil || $solicitud->solicitante_id !== $perfil->id) {
                return back()->withErrors(['message' => 'No tiene permisos para editar una solicitud que no le pertenece.']);
            }

            $validated = $request->validate([
                'departamento_destino_id' => 'required|string|exists:departamentos,id',
                'descripcion_servicio' => 'required|string|max:2500',
            ]);

            $deptoDestino = DB::table('departamentos')->where('id', $validated['departamento_destino_id'])->first();
            if (! $deptoDestino || ! $deptoDestino->brinda_mantenimiento) {
                return back()->withErrors(['departamento_destino_id' => 'El departamento seleccionado no brinda servicios de mantenimiento.']);
            }

            $updateData = [
                'departamento_destino_id' => $validated['departamento_destino_id'],
                'descripcion_servicio' => $validated['descripcion_servicio'],
                'updated_at' => now(),
            ];

            DB::table('solicitudes')->where('id', $id)->update($updateData);

            return back()->with('success', 'Solicitud modificada con éxito.');
        }

        // Encargado:
        $validated = $request->validate([
            'departamento_solicitante_id' => 'required|string|exists:departamentos,id',
            'solicitante_id' => 'required|string|exists:personal,id',
            'departamento_destino_id' => 'required|string|exists:departamentos,id',
            'responsable_id' => 'nullable|string|exists:personal,id',
            'descripcion_servicio' => 'required|string|max:2500',
        ]);

        $deptoDestino = DB::table('departamentos')->where('id', $validated['departamento_destino_id'])->first();
        if (! $deptoDestino || ! $deptoDestino->brinda_mantenimiento) {
            return back()->withErrors(['departamento_destino_id' => 'El departamento seleccionado no brinda servicios de mantenimiento.']);
        }

        $seTransfirio = $solicitud->departamento_destino_id !== $validated['departamento_destino_id'];

        $updateData = [
            'departamento_solicitante_id' => $validated['departamento_solicitante_id'],
            'solicitante_id' => $validated['solicitante_id'],
            'departamento_destino_id' => $validated['departamento_destino_id'],
            // Si se transfiere de departamento, se limpia el responsable previo
            'responsable_id' => $seTransfirio ? null : (! empty($validated['responsable_id']) ? $validated['responsable_id'] : null),
            'descripcion_servicio' => $validated['descripcion_servicio'],
            'estado' => 'Pendiente',
            'updated_at' => now(),
        ];

        DB::table('solicitudes')->where('id', $id)->update($updateData);

        if ($seTransfirio) {
            return back()->with('success', 'Solicitud transferida exitosamente al nuevo departamento destino.');
        }

        return back()->with('success', 'Solicitud actualizada con éxito.');
    }

    /**
     * Remove the specified solicitud from storage.
     */
    public function destroy(Request $request, string $id): RedirectResponse
    {
        $solicitud = DB::table('solicitudes')->where('id', $id)->first();

        if (! $solicitud) {
            return back()->withErrors(['message' => 'Solicitud no encontrada.']);
        }

        $user = $request->user();
        $perfil = $user ? DB::table('personal')->where('usuario_id', $user->id)->first() : null;

        // 1. Solo se permite eliminar solicitudes en estado 'Pendiente'
        if ($solicitud->estado !== 'Pendiente') {
            return back()->withErrors(['message' => 'Solo se pueden eliminar solicitudes que se encuentren en estado Pendiente.']);
        }

        // 2. Solicitante o Técnico: Solo puede eliminar sus propias solicitudes creadas
        if ($user && in_array($user->rol, ['Solicitante', 'Tecnico'])) {
            if (! $perfil || $solicitud->solicitante_id !== $perfil->id) {
                return back()->withErrors(['message' => 'No tiene permisos para eliminar una solicitud que no fue creada por usted.']);
            }
        }

        // 3. Encargado: Solo puede eliminar solicitudes dirigidas a su departamento
        if ($user && $user->rol === 'Encargado') {
            if (! $perfil || $solicitud->departamento_destino_id !== $perfil->departamento_id) {
                return back()->withErrors(['message' => 'Solo puede eliminar solicitudes dirigidas a su departamento.']);
            }
        }

        DB::table('solicitudes')->where('id', $id)->delete();

        return back()->with('success', 'Solicitud eliminada correctamente.');
    }

    /**
     * Generate the official PDF for the solicitud.
     */
    public function pdf(string $id): Response
    {
        $solicitud = DB::table('solicitudes')
            ->join('departamentos as depto_solicitante', 'solicitudes.departamento_solicitante_id', '=', 'depto_solicitante.id')
            ->join('departamentos as depto_destino', 'solicitudes.departamento_destino_id', '=', 'depto_destino.id')
            ->join('personal as solicitante', 'solicitudes.solicitante_id', '=', 'solicitante.id')
            ->leftJoin('personal as responsable', 'solicitudes.responsable_id', '=', 'responsable.id')
            ->where('solicitudes.id', $id)
            ->select(
                'solicitudes.*',
                'depto_solicitante.nombre as depto_solicitante_nombre',
                'depto_destino.nombre as depto_destino_nombre',
                'solicitante.nombre as solicitante_nombre',
                'responsable.nombre as responsable_nombre'
            )
            ->first();

        if (! $solicitud) {
            abort(404, 'Solicitud no encontrada.');
        }

        // Departamentos de soporte/mantenimiento
        $deptosMantenimiento = DB::table('departamentos')
            ->where('brinda_mantenimiento', 1)
            ->orderByRaw("FIELD(nombre, 'Recursos Materiales y servicios', 'Recursos Materiales y Servicios', 'Mantenimiento de Equipo', 'Centro de Cómputo')")
            ->get();

        // Logo institucional en base64 para renderizado garantizado en Dompdf
        $logoPath = public_path('imgs/imgHeader.png');
        $logoBase64 = file_exists($logoPath) ? 'data:image/png;base64,'.base64_encode(file_get_contents($logoPath)) : null;

        // Fechas con formato
        try {
            $fechaEmision = Carbon::parse($solicitud->fecha_elaboracion)->format('d/m/y');
            $fechaElaboracionFormateada = Carbon::parse($solicitud->fecha_elaboracion)->locale('es')->isoFormat('D [de] MMMM [de] YYYY');
        } catch (\Exception $e) {
            $fechaEmision = date('d/m/y');
            $fechaElaboracionFormateada = $solicitud->fecha_elaboracion;
        }

        $pdf = Pdf::loadView('pdf.solicitud', [
            'solicitud' => $solicitud,
            'deptosMantenimiento' => $deptosMantenimiento,
            'logoBase64' => $logoBase64,
            'fechaEmision' => $fechaEmision,
            'fechaElaboracionFormateada' => $fechaElaboracionFormateada,
        ])->setPaper('letter', 'portrait');

        return $pdf->stream("Solicitud_{$solicitud->folio}.pdf");
    }
}
