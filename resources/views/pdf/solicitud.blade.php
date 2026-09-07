<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Solicitud de Mantenimiento - {{ $solicitud->folio }}</title>
    <style>
        @page {
            margin: 18mm 18mm 18mm 18mm;
            size: letter portrait;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
            color: #000000;
            line-height: 1.3;
            margin: 0;
            padding: 0;
        }

        /* --- ENCABEZADO OFICIAL (TABLA) --- */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000000;
            margin-bottom: 22px;
        }

        .header-table td {
            vertical-align: middle;
            padding: 0;
        }

        .header-logo {
            width: 20%;
            border-right: 2px solid #000000;
            text-align: center;
            padding: 6px 8px;
        }

        .header-logo img {
            max-height: 48px;
            max-width: 95%;
            filter: grayscale(100%);
            -webkit-filter: grayscale(100%);
        }

        .header-title {
            width: 50%;
            border-right: 2px solid #000000;
            text-align: center;
            padding: 8px 10px;
        }

        .header-title-text {
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            line-height: 1.25;
        }

        .header-code-text {
            font-size: 12px;
            margin-top: 5px;
        }

        .header-meta {
            width: 30%;
            font-size: 10.5px;
            vertical-align: top;
        }

        .header-meta-row {
            padding: 4px 8px;
            border-bottom: 2px solid #000000;
        }

        .header-meta-row:last-child {
            border-bottom: none;
        }

        .header-meta-label {
            font-weight: bold;
        }

        .header-meta-val {
            float: right;
        }

        /* --- DESTINO Y FOLIO --- */
        .dest-folio-wrapper {
            width: 100%;
            margin-bottom: 22px;
        }

        .dest-folio-table {
            width: 100%;
            border-collapse: collapse;
        }

        .dest-table-right {
            border-collapse: collapse;
            font-size: 11.5px;
            margin-left: auto;
            margin-right: 0;
        }

        .dest-table-right td.dept-name {
            padding: 2px 10px 2px 0;
            text-align: right;
            white-space: nowrap;
        }

        .dest-table-right td.dept-check {
            border: 2px solid #000000;
            width: 24px;
            height: 24px;
            text-align: center;
            vertical-align: middle;
            font-weight: bold;
            font-size: 13px;
        }

        .dest-table-right tr:not(:first-child) td.dept-check {
            border-top: none;
        }

        .folio-title {
            font-weight: bold;
            font-size: 15px;
            text-align: right;
            margin-top: 8px;
            letter-spacing: 0.5px;
        }

        /* --- DATOS DE LA SOLICITUD (BLOQUES) --- */
        .info-card {
            width: 100%;
            border: 2px solid #000000;
            border-collapse: collapse;
            font-size: 12.5px;
            margin-bottom: 22px;
        }

        .info-card td {
            padding: 8px 12px;
            border-bottom: 2px solid #000000;
        }

        .info-card tr:last-child td {
            border-bottom: none;
        }

        .info-label {
            font-weight: bold;
            display: inline-block;
        }

        /* --- CUERPO DEL DOCUMENTO (DESCRIPCIÓN) --- */
        .body-card {
            width: 100%;
            border: 2px solid #000000;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        .body-card-header {
            background-color: #f3f4f6;
            border-bottom: 2px solid #000000;
            padding: 8px 10px;
            text-align: center;
            font-weight: bold;
            font-size: 12.5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .body-card-content {
            padding: 16px;
            font-size: 13px;
            line-height: 1.55;
            text-align: justify;
            min-height: 250px;
            height: 250px;
            vertical-align: top;
        }

        /* --- PIE DE PÁGINA --- */
        .footer-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 25px;
            font-size: 11px;
        }

        .footer-left {
            text-align: left;
            width: 50%;
        }

        .footer-right {
            text-align: right;
            width: 50%;
        }
    </style>
</head>
<body>

    {{-- 1. ENCABEZADO (TABLA) --}}
    <table class="header-table">
        <tr>
            {{-- Cell 1: Logo --}}
            <td class="header-logo">
                @if (!empty($logoBase64))
                    <img src="{{ $logoBase64 }}" alt="Logo Institución" />
                @else
                    <div style="font-weight: bold; font-size: 15px;">ITT</div>
                @endif
            </td>

            {{-- Cell 2: Title --}}
            <td class="header-title">
                <div class="header-title-text">Solicitud de Mantenimiento Correctivo</div>
                <div class="header-code-text">Código: ITT-SMC-001</div>
            </td>

            {{-- Cell 3: Meta --}}
            <td class="header-meta">
                <div class="header-meta-row">
                    <span class="header-meta-label">Fecha de emisión:</span>
                    <span class="header-meta-val">{{ $fechaEmision ?? date('d/m/y') }}</span>
                </div>
                <div class="header-meta-row">
                    <span class="header-meta-label">Revisión:</span>
                    <span class="header-meta-val">02</span>
                </div>
                <div class="header-meta-row">
                    <span class="header-meta-label">Página:</span>
                    <span class="header-meta-val">1 de 1</span>
                </div>
            </td>
        </tr>
    </table>

    {{-- 2. DESTINO Y FOLIO --}}
    <div class="dest-folio-wrapper">
        <table class="dest-folio-table">
            <tr>
                <td style="width: 35%;"></td>
                <td style="width: 65%; text-align: right; vertical-align: top;">
                    <table class="dest-table-right">
                        @foreach ($deptosMantenimiento as $dept)
                            @php
                                $isSelected = ($dept->id === $solicitud->departamento_destino_id);
                            @endphp
                            <tr>
                                <td class="dept-name" style="{{ $isSelected ? 'font-weight: bold;' : '' }}">
                                    {{ $dept->nombre }}
                                </td>
                                <td class="dept-check">
                                    {{ $isSelected ? 'X' : '' }}
                                </td>
                            </tr>
                        @endforeach
                    </table>

                    <div class="folio-title">
                        Folio: {{ $solicitud->folio }}
                    </div>
                </td>
            </tr>
        </table>
    </div>

    {{-- 3. DATOS DE LA SOLICITUD (BLOQUES) --}}
    <table class="info-card">
        <tr>
            <td>
                <span class="info-label" style="width: 150px;">Área Solicitante:</span>
                <span>{{ $solicitud->depto_solicitante_nombre }}</span>
            </td>
        </tr>
        <tr>
            <td>
                <span class="info-label" style="width: 220px;">Nombre y Firma del Solicitante:</span>
                <span>{{ $solicitud->solicitante_nombre }}</span>
            </td>
        </tr>
        <tr>
            <td>
                <span class="info-label" style="width: 150px;">Fecha de Elaboración:</span>
                <span>{{ $fechaElaboracionFormateada }}</span>
            </td>
        </tr>
    </table>

    {{-- 4. CUERPO DEL DOCUMENTO --}}
    <table class="body-card">
        <tr>
            <td class="body-card-header">
                Descripción del servicio solicitado o falla a reparar
            </td>
        </tr>
        <tr>
            <td class="body-card-content">
                {!! nl2br(e($solicitud->descripcion_servicio)) !!}
            </td>
        </tr>
    </table>

    {{-- 5. PIE DE PÁGINA --}}
    <table class="footer-table">
        <tr>
            <td class="footer-left">
                c.c.p. Área Solicitante
            </td>
            <td class="footer-right">
                Instituto Tecnológico de Tepic
            </td>
        </tr>
    </table>

</body>
</html>
