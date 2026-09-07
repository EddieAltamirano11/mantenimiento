<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $userData = null;

        if ($user) {
            // 1. Extraemos los datos básicos de la tabla users
            $userData = [
                'id' => $user->id,
                'email' => $user->email,
                'rol' => $user->rol,
            ];

            // 2. Buscamos sus datos en la tabla personal junto con su departamento
            $perfil = DB::table('personal')
                ->leftJoin('departamentos', 'personal.departamento_id', '=', 'departamentos.id')
                ->where('personal.usuario_id', $user->id)
                ->select(
                    'personal.id as personal_id',
                    'personal.nombre',
                    'personal.departamento_id',
                    'departamentos.nombre as departamento_nombre'
                )
                ->first();

            // 3. Los fusionamos para que React tenga todo junto
            if ($perfil) {
                $userData['personal_id'] = $perfil->personal_id;
                $userData['nombre'] = $perfil->nombre;
                $userData['name'] = $perfil->nombre;
                $userData['departamento_id'] = $perfil->departamento_id;
                $userData['departamento_nombre'] = $perfil->departamento_nombre;
            } else {
                $userData['nombre'] = $user->email;
                $userData['name'] = $user->email;
                $userData['departamento_nombre'] = null;
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $userData,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
