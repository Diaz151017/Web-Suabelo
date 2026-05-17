// ==========================================
// MOTOR DINÁMICO DEL CARRITO (JSON + LOCALSTORAGE)
// ==========================================

// 1. LA MEMORIA CORE
// localStorage solo admite texto. Usamos JSON.parse para convertir ese texto de vuelta a un Array de objetos.
// Si está vacío (null), inicializamos un array vacío [].
let carrito = JSON.parse(localStorage.getItem('suabelo_carrito_data')) || [];

// 2. CONTROL DE LA BURBUJA GLOBAL
function actualizarContador() {
    const badgeCarrito = document.querySelector('.badge-carrito');
    if (badgeCarrito) {
        // Mostramos la longitud del array (cantidad de items)
        badgeCarrito.textContent = carrito.length > 0 ? carrito.length : '';
    }
}

// Ejecutamos siempre al cargar cualquier página
actualizarContador();

// ==========================================
// MÓDULO A: AÑADIR PRODUCTOS (tienda.html)
// ==========================================
const botonesAñadir = document.querySelectorAll('.producto-card .boton-cta');

if (botonesAñadir.length > 0) {
    botonesAñadir.forEach(boton => {
        boton.addEventListener('click', (e) => {
            // e.target no siempre es el botón (puede ser el icono <i>). Usamos closest() para asegurar.
            const btn = e.target.closest('.boton-cta');
            // Buscamos la tarjeta madre de este botón
            const card = btn.closest('.producto-card');
            
            // Construimos el objeto del producto escaneando el HTML
            const producto = {
                id: btn.getAttribute('data-id'),
                titulo: card.querySelector('h3').textContent,
                precio: card.querySelector('.precio').textContent,
                imagen: card.querySelector('img').src
            };

            // Añadimos el objeto a nuestra matriz
            carrito.push(producto);
            
            // Transformamos el Array en texto JSON y lo metemos en la cápsula del tiempo (localStorage)
            localStorage.setItem('suabelo_carrito_data', JSON.stringify(carrito));
            
            // Actualizamos la vista
            actualizarContador();
            
            // Feedback visual de éxito
            const contenidoOriginal = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> ¡Eternizado!';
            btn.style.backgroundColor = 'var(--color-accent)'; 
            btn.style.color = 'white';
            
            setTimeout(() => {
                btn.innerHTML = contenidoOriginal;
                btn.style.backgroundColor = ''; 
                btn.style.color = '';
            }, 1000);
        });
    });
}

// ==========================================
// MÓDULO B: RENDERIZAR Y PAGAR (carrito.html)
// ==========================================
const contenedorArticulos = document.querySelector('.lista-articulos');

// Si este contenedor existe, el script sabe que estamos en la página del carrito
if (contenedorArticulos) {
    function renderizarCarrito() {
        // Purgamos el HTML estático (tus productos simulados desaparecerán)
        contenedorArticulos.innerHTML = ''; 
        let subtotal = 0;

        // Si el array está vacío, mostramos un mensaje amigable
        if (carrito.length === 0) {
            contenedorArticulos.innerHTML = '<p style="text-align:center; padding: 20px;">Tu selección está vacía. La naturaleza te espera en la tienda.</p>';
            actualizarTotales(0);
            return;
        }

        // Recorremos el Array y creamos los elementos HTML uno a uno
        carrito.forEach((item, index) => {
            // Convertimos el string "35,00 €" a un número matemático "35.00" para poder sumar
            const precioNum = parseFloat(item.precio.replace(' €', '').replace(',', '.'));
            subtotal += precioNum;

            const div = document.createElement('div');
            div.classList.add('articulo-carrito');
            // Inyectamos el HTML dinámico
            div.innerHTML = `
                <img src="${item.imagen}" alt="${item.titulo}">
                <div class="info-articulo">
                    <h3>${item.titulo}</h3>
                    <p>Referencia #${item.id}</p>
                </div>
                <div class="precio-articulo">
                    <span class="precio">${item.precio}</span>
                </div>
                <button class="boton-eliminar" data-index="${index}" aria-label="Eliminar artículo">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            contenedorArticulos.appendChild(div);
        });

        actualizarTotales(subtotal);
        activarBotonesEliminar();
    }

    function actualizarTotales(sub) {
        // En un e-commerce real, los gastos de envío se calculan dinámicamente. Aquí pondremos 4.50 fijos si hay items.
        const envio = sub > 0 ? 4.50 : 0;
        const total = sub + envio;

        // Formateamos de vuelta a "XX,XX €"
        const formatoEuros = (num) => num.toFixed(2).replace('.', ',') + ' €';

        // Actualizamos los textos en el ticket de la derecha
        const lineasResumen = document.querySelectorAll('.resumen-pedido .linea-resumen span:last-child');
        if(lineasResumen.length >= 3) {
            lineasResumen[0].textContent = formatoEuros(sub);
            lineasResumen[1].textContent = formatoEuros(envio);
            lineasResumen[2].textContent = formatoEuros(total);
        }
    }

    function activarBotonesEliminar() {
        const botonesBorrar = document.querySelectorAll('.boton-eliminar');
        botonesBorrar.forEach(boton => {
            boton.addEventListener('click', (e) => {
                const btn = e.target.closest('.boton-eliminar');
                const index = btn.getAttribute('data-index');
                
                // .splice() arranca el elemento del array en esa posición exacta
                carrito.splice(index, 1);
                
                // Guardamos la nueva realidad y repintamos
                localStorage.setItem('suabelo_carrito_data', JSON.stringify(carrito));
                actualizarContador();
                renderizarCarrito();
            });
        });
    }

    // Arrancamos el motor de renderizado al cargar la página
    renderizarCarrito();
}