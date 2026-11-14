<?php
header('Content-Type: application/json; charset=utf-8');

/**
 * Lee y decodifica los Datos Generales desde data-1.json
 */
function obtenerDatosGenerales(string $rutaArchivo = 'data-1.json'): array {
    if (!file_exists($rutaArchivo)) {
        http_response_code(500);
        echo json_encode(['error' => 'No se encontró el archivo de datos.']);
        exit;
    }
    $contenido = file_get_contents($rutaArchivo);
    return json_decode($contenido, true) ?? [];
}

/**
 * Convierte un precio con formato "$30,746" a valor numérico (30746)
 */
function limpiarPrecio(string $precioTexto): float {
    return (float) str_replace(['$', ',', ' '], '', $precioTexto);
}

$datos = obtenerDatosGenerales();
$accion = $_POST['accion'] ?? $_GET['accion'] ?? 'filtrar';

switch ($accion) {
    // Requerimiento 2: Obtener listas únicas de Ciudades y Tipos
    case 'obtenerFiltros':
        $ciudades = array_values(array_unique(array_column($datos, 'Ciudad')));
        $tipos    = array_values(array_unique(array_column($datos, 'Tipo')));
        
        sort($ciudades);
        sort($tipos);

        echo json_encode([
            'ciudades' => $ciudades,
            'tipos'    => $tipos
        ]);
        break;

    // Requerimiento 1: Mostrar todos los registros disponibles
    case 'mostrarTodos':
        echo json_encode($datos);
        break;

    // Requerimientos 3, 4, 5 y 6: Filtrado combinado por Ciudad, Tipo y Rango de Precios
    case 'filtrar':
    default:
        $ciudadSeleccionada = trim($_POST['ciudad'] ?? '');
        $tipoSeleccionado   = trim($_POST['tipo'] ?? '');
        $rangoPrecio        = trim($_POST['precio'] ?? '0;100000');

        // Separar el rango "min;max" enviado por ion.rangeSlider
        $partesPrecio = explode(';', $rangoPrecio);
        $precioMin = isset($partesPrecio[0]) ? (float) $partesPrecio[0] : 0;
        $precioMax = isset($partesPrecio[1]) ? (float) $partesPrecio[1] : 100000;

        $resultados = array_filter($datos, function ($propiedad) use ($ciudadSeleccionada, $tipoSeleccionado, $precioMin, $precioMax) {
            $precioPropiedad = limpiarPrecio($propiedad['Precio']);

            // Req 3: Validar siempre que el precio esté dentro del rango
            if ($precioPropiedad < $precioMin || $precioPropiedad > $precioMax) {
                return false;
            }

            // Req 4 y 6: Si se eligió Ciudad, debe coincidir exactamente
            if ($ciudadSeleccionada !== '' && $propiedad['Ciudad'] !== $ciudadSeleccionada) {
                return false;
            }

            // Req 5 y 6: Si se eligió Tipo, debe coincidir exactamente
            if ($tipoSeleccionado !== '' && $propiedad['Tipo'] !== $tipoSeleccionado) {
                return false;
            }

            return true;
        });

        // Reindexar el arreglo para devolver un JSON Array válido
        echo json_encode(array_values($resultados));
        break;
}