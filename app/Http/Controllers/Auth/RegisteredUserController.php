<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        // Obtenemos todos los departamentos de la base de datos incluyendo su bandera de mantenimiento
        $departamentos = DB::table('departamentos')
            ->select('id', 'nombre', 'brinda_mantenimiento')
            ->orderBy('nombre')
            ->get();

        // Los pasamos a la vista de React
        return Inertia::render('Auth/Register', [
            'departamentos' => $departamentos,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // 1. Validamos los datos
        $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'rol' => 'required|string|in:Solicitante,Encargado,Tecnico',
            'departamento_id' => 'required|string|exists:departamentos,id',
        ]);

        // Validación de regla de negocio: Si el departamento no brinda mantenimiento, solo puede ser Solicitante
        $depto = DB::table('departamentos')->where('id', $request->departamento_id)->first();
        if (! $depto || (! $depto->brinda_mantenimiento && in_array($request->rol, ['Tecnico', 'Encargado']))) {
            throw ValidationException::withMessages([
                'rol' => 'El departamento seleccionado no brinda servicios técnicos; el rol asignado solo puede ser Solicitante.',
            ]);
        }

        // 2. Generamos los UUIDs antes de tocar la base de datos
        $userId = Str::uuid()->toString();
        $personalId = Str::uuid()->toString();

        // 3. Ejecutamos la transacción (Si algo falla, no se guarda nada)
        DB::transaction(function () use ($request, $userId, $personalId) {

            // Insertamos los datos de autenticación
            DB::table('users')->insert([
                'id' => $userId,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'rol' => $request->rol,
                // created_at y updated_at se llenan solos por MariaDB
            ]);

            // Insertamos el perfil del empleado
            DB::table('personal')->insert([
                'id' => $personalId,
                'usuario_id' => $userId,
                'departamento_id' => $request->departamento_id,
                'nombre' => $request->nombre,
            ]);

        });

        // 4. Iniciamos sesión directamente con el UUID
        Auth::loginUsingId($userId);

        // 5. Redireccionamos
        return redirect(route('solicitudes.index', absolute: false));
    }
}
