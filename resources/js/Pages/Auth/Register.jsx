import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register({ departamentos = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        nombre: '',
        email: '',
        password: '',
        password_confirmation: '',
        rol: 'Solicitante',
        departamento_id: '',
    });

    const selectedDept = departamentos.find(d => d.id === data.departamento_id);
    const brindaMantenimiento = selectedDept ? Boolean(selectedDept.brinda_mantenimiento) : true;

    const handleDepartamentoChange = (e) => {
        const deptId = e.target.value;
        const dept = departamentos.find(d => d.id === deptId);
        setData(d => ({
            ...d,
            departamento_id: deptId,
            // Si el depto no brinda mantenimiento, forzar Solicitante
            rol: dept && !dept.brinda_mantenimiento ? 'Solicitante' : d.rol
        }));
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Registro de Usuario" />

            <form onSubmit={submit}>
                {/* Campo Nombre */}
                <div>
                    <InputLabel htmlFor="nombre" value="Nombre Completo" />

                    <TextInput
                        id="nombre"
                        name="nombre"
                        value={data.nombre}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('nombre', e.target.value)}
                        required
                    />

                    <InputError message={errors.nombre} className="mt-2" />
                </div>

                {/* Campo Email */}
                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Correo Institucional" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Selector de Departamento */}
                <div className="mt-4">
                    <InputLabel htmlFor="departamento_id" value="Departamento de Adscripción" />

                    <select
                        id="departamento_id"
                        name="departamento_id"
                        value={data.departamento_id}
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                        onChange={handleDepartamentoChange}
                        required
                    >
                        <option value="">Selecciona tu departamento</option>
                        {departamentos.map((depto) => (
                            <option key={depto.id} value={depto.id}>
                                {depto.nombre} {depto.brinda_mantenimiento ? "(Área de Mantenimiento)" : ""}
                            </option>
                        ))}
                    </select>

                    <InputError message={errors.departamento_id} className="mt-2" />
                </div>

                {/* Selector de Rol */}
                <div className="mt-4">
                    <InputLabel htmlFor="rol" value="Rol en el sistema" />

                    <select
                        id="rol"
                        name="rol"
                        value={data.rol}
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                        onChange={(e) => setData('rol', e.target.value)}
                        required
                    >
                        <option value="Solicitante">Solicitante</option>
                        {brindaMantenimiento && (
                            <>
                                <option value="Tecnico">Personal Técnico</option>
                                <option value="Encargado">Encargado de Mantenimiento</option>
                            </>
                        )}
                    </select>

                    {!brindaMantenimiento && data.departamento_id && (
                        <p className="text-xs text-amber-600 mt-1">
                            * Este departamento no brinda servicios de mantenimiento, por lo que el rol asignado es Solicitante.
                        </p>
                    )}

                    <InputError message={errors.rol} className="mt-2" />
                </div>

                {/* Campo Password */}
                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Contraseña" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Campo Confirmar Password */}
                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirmar Contraseña"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        ¿Ya tienes una cuenta? Iniciar Sesión
                    </Link>

                    <PrimaryButton disabled={processing}>
                        Registrarse
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}