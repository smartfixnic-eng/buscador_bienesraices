/*
  Inicialización del componente Ion.RangeSlider para el rango de precios
*/
function inicializarSlider() {
  $("#rangoPrecio").ionRangeSlider({
    type: "double",
    grid: false,
    min: 0,
    max: 100000,
    from: 200,
    to: 80000,
    prefix: "$"
  });
}

/*
  Requerimiento 2: Cargar Ciudades y Tipos únicos en los menús desplegables
*/
function cargarOpcionesFiltros() {
  $.ajax({
    url: 'buscador.php',
    type: 'POST',
    data: { accion: 'obtenerFiltros' },
    dataType: 'json',
    success: function (respuesta) {
      const $selectCiudad = $('#selectCiudad');
      const $selectTipo = $('#selectTipo');

      respuesta.ciudades.forEach(function (ciudad) {
        $selectCiudad.append(`<option value="${ciudad}">${ciudad}</option>`);
      });

      respuesta.tipos.forEach(function (tipo) {
        $selectTipo.append(`<option value="${tipo}">${tipo}</option>`);
      });

      // Inicializar o actualizar los selects de Materialize CSS
      $('select').material_select();
    },
    error: function (err) {
      console.error('Error al cargar los filtros:', err);
    }
  });
}

/*
  Función encargada de pintar las tarjetas de propiedades en .colContenido
*/
function renderizarPropiedades(propiedades) {
  const $contenedor = $('.colContenido');

  // Eliminar resultados previos conservando únicamente .tituloContenido
  $contenedor.find('.itemMostrado, .mensajeSinResultados').remove();

  if (propiedades.length === 0) {
    $contenedor.append(`
      <div class="card-panel mensajeSinResultados" style="width: 100%; text-align: center;">
        <h6>No se encontraron propiedades con los criterios seleccionados.</h6>
      </div>
    `);
    return;
  }

  propiedades.forEach(function (item) {
    const tarjetaHTML = `
      <div class="itemMostrado card">
        <img src="img/home.jpg" alt="Propiedad">
        <div class="card-stacked">
          <div class="card-content">
            <div><b>Dirección: </b>${item.Direccion}</div>
            <div><b>Ciudad: </b>${item.Ciudad}</div>
            <div><b>Teléfono: </b>${item.Telefono}</div>
            <div><b>Códigoopsi Postal: </b>${item.Codigo_Postal}</div>
            <div><b>Tipo: </b>${item.Tipo}</div>
            <div><b>Precio: </b><span class="precioTexto">${item.Precio}</span></div>
          </div>
          <div class="card-action">
            <a href="#">Ver más</a>
          </div>
        </div>
      </div>
    `;
    $contenedor.append(tarjetaHTML);
  });
}

/*
  Configuración de eventos al cargar el documento
*/
$(document).ready(function () {
  inicializarSlider();
  cargarOpcionesFiltros();

  // Requerimiento 1: Botón "Mostrar Todos"
  $('#mostrarTodos').on('click', function () {
    $.ajax({
      url: 'buscador.php',
      type: 'POST',
      data: { accion: 'mostrarTodos' },
      dataType: 'json',
      success: function (propiedades) {
        renderizarPropiedades(propiedades);
      }
    });
  });

  // Requerimientos 3, 4, 5 y 6: Envío del formulario de búsqueda personalizada
  $('#formulario').on('submit', function (e) {
    e.preventDefault(); // Evita que la página se recargue

    const datosFiltro = {
      accion: 'filtrar',
      ciudad: $('#selectCiudad').val(),
      tipo: $('#selectTipo').val(),
      precio: $('#rangoPrecio').val()
    };

    $.ajax({
      url: 'buscador.php',
      type: 'POST',
      data: datosFiltro,
      dataType: 'json',
      success: function (propiedades) {
        renderizarPropiedades(propiedades);
      }
    });
  });
});