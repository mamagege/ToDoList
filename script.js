// =========================================
// 1. SELECCIÓN DE ELEMENTOS Y VARIABLES
// =========================================
const botonAgregar = document.getElementById("boton-agregar");
const listaTareas = document.getElementById("lista-tareas");
const inputTarea = document.getElementById("input-tarea");
const botonBorrar = document.getElementById("boton-borrar");
const themeToggle = document.getElementById("theme-toggle");
const selectPrioridad = document.getElementById("select-prioridad"); // Nuevo
const inputFecha = document.getElementById("input-fecha");


// =========================================
// 2. LÓGICA DE PERSISTENCIA (EL ARCHIVADOR)
// =========================================

function guardarDatos() {
    const tareas = [];
    const elementosLista = document.querySelectorAll("li");
    
    elementosLista.forEach((elemento) => { 
        const spanFecha = elemento.querySelector(".fecha-tarea");
        const fechaTexto = spanFecha ? spanFecha.innerText : "";
        
        // Extraemos el valor del recordatorio si existe
        const recordatorioGuardado = spanFecha ? spanFecha.getAttribute("data-vencimiento") : null;

        const textoLimpio = elemento.innerText.replace(fechaTexto, "").trim();

        let prioridad = "baja"; 
        if (elemento.classList.contains("prioridad-alta")) prioridad = "alta";
        if (elemento.classList.contains("prioridad-media")) prioridad = "media";

        tareas.push({
            texto: textoLimpio,
            completada: elemento.classList.contains("completada"),
            fecha: recordatorioGuardado ? "" : fechaTexto, // Si hay recordatorio, no necesitamos la fecha vieja
            prioridad: prioridad, 
            recordatorio: recordatorioGuardado
        });
    });

    localStorage.setItem("tareas_usuario", JSON.stringify(tareas));
}

function cargarDatos() {
    const datosGuardados = localStorage.getItem("tareas_usuario");

    if (datosGuardados) {
        const tareas = JSON.parse(datosGuardados);
        // Le pasamos los 4 ingredientes a la fábrica
        tareas.forEach((t) => {
            insertarTarea(t.texto, t.completada, t.fecha, t.prioridad, t.recordatorio);
        });
    } else {
        // Tareas de bienvenida
        const predeterminadas = [
            {t: "Prueba añadir una tarea Alta 🔴", p: "alta"},
            {t: "O una tarea Media 🟡", p: "media"},
            {t: "Prueba a poner la fecha de finalización para recibir una notificación antes de la fecha 📅", p: "alta"},
            {t: "Si no colocas nada, predeterminadamente aparecerá la fecha de creación!. ", p: "baja"}
        ];
        predeterminadas.forEach(obj => insertarTarea(obj.t, false, null, obj.p, null));
        guardarDatos();
    } 
    actualizarContadores();
}

// =========================================
// 3. LA FÁBRICA DE TAREAS
// =========================================

function insertarTarea(texto, completada, fecha, prioridad, recordatorio) { 
    if (texto === "") return;

    const nuevaTarea = document.createElement("li");
    nuevaTarea.appendChild(document.createTextNode(texto));

    // El SPAN de la derecha (donde ahora irá el recordatorio)
    const spanFecha = document.createElement("span");
    spanFecha.classList.add("fecha-tarea");

    if (recordatorio) {
        // 1. Formateamos la fecha del recordatorio (Ej: 15 feb, 14:00)
        const fechaFormateada = new Date(recordatorio).toLocaleString([], {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        });
        
        // 2. Metemos la campana y la fecha en el mismo span
        spanFecha.innerText = `🔔 ${fechaFormateada}`;
        
        // 3. Guardamos el valor técnico para que el archivador lo vea
        spanFecha.setAttribute("data-vencimiento", recordatorio);
        spanFecha.classList.add("recordatorio-icono"); // Clase para que guardarDatos lo encuentre
    } else {
        // Si no hay recordatorio, mostramos la fecha de creación normal
        spanFecha.innerText = fecha || new Date().toLocaleDateString();
    }

    nuevaTarea.appendChild(spanFecha);

    // Prioridad y Completada (Igual que antes)
    if (completada) nuevaTarea.classList.add("completada");
    const prioridadAsignada = prioridad || "baja";
    nuevaTarea.classList.add("prioridad-" + prioridadAsignada);

    // Eventos (Igual que antes)
    nuevaTarea.addEventListener("click", () => {
        nuevaTarea.classList.toggle("completada");
        // Si la completa, le quitamos el temblor y la alerta
        if (nuevaTarea.classList.contains("completada")) {
        nuevaTarea.classList.remove("tarea-alerta");
        }

        guardarDatos();
        actualizarContadores();
    });

    nuevaTarea.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        nuevaTarea.remove();
        guardarDatos();
        actualizarContadores();
    });

    listaTareas.appendChild(nuevaTarea);
    actualizarContadores();
}

// =========================================
// 4. LÓGICA DE INTERFAZ Y CONTADORES
// =========================================

function actualizarContadores() {
    const total = document.querySelectorAll("li").length;
    const completadas = document.querySelectorAll("li.completada").length;

    document.getElementById("total-tareas").innerText = total;
    document.getElementById("completadas-tareas").innerText = completadas;
}

// Lógica del Modo Oscuro
function inicializarTema() {
    const temaGuardado = localStorage.getItem("tema");
    if (temaGuardado === "oscuro") {
        document.body.classList.add("dark-mode");
        themeToggle.innerText = "☀️";
    }
}

function verificarRecordatorios() {
    const ahora = new Date();
    // Solo revisamos los recordatorios que tienen la clase que creamos
    const recordatorios = document.querySelectorAll(".recordatorio-icono");

    recordatorios.forEach(icono => {
        const fechaVencimiento = new Date(icono.getAttribute("data-vencimiento"));
        const tareaElemento = icono.closest("li");
        
        // Si la tarea ya está completada o ya fue notificada, la ignoramos
        if (tareaElemento.classList.contains("completada") || tareaElemento.classList.contains("notificada")) {
            return;
        }

        // Si la hora actual es mayor o igual a la del recordatorio
        if (ahora >= fechaVencimiento) {
            enviarNotificacion(tareaElemento);
            // Marcamos como notificada para que no suene cada segundo
            tareaElemento.classList.add("notificada"); 
        }
    });
}

function enviarNotificacion(elemento) {
    const textoTarea = elemento.firstChild.textContent; // Sacamos el texto de la tarea

    // 1. Notificación de Sistema (la ventanita)
    if (Notification.permission === "granted") {
        new Notification("⏰ ¡Tarea Vencida!", { body: textoTarea });
    }

    elemento.classList.add("tarea-alerta");
}


themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const esOscuro = document.body.classList.contains("dark-mode");
    
    themeToggle.innerText = esOscuro ? "☀️" : "🌙";
    localStorage.setItem("tema", esOscuro ? "oscuro" : "claro");
});

// =========================================
// 5. EVENTOS DE ENTRADA
// =========================================

// Botón Añadir
botonAgregar.addEventListener("click", () => {
    const texto = inputTarea.value.trim();
    const prioridad = selectPrioridad.value; // Leemos el menú
    const recordatorio = inputFecha.value;

    if (texto !== "") {
        insertarTarea(texto, false, null, prioridad, recordatorio);
        inputTarea.value = "";
        inputTarea.focus();
        guardarDatos();
    }
});

// Tecla Enter (Truco Pro: Simular Click)
inputTarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter") botonAgregar.click();
});

// Botón Borrar Todo
botonBorrar.addEventListener("click", () => {
    if (confirm("¿Estás seguro de borrar todo?")) {
        listaTareas.innerHTML = "";
        guardarDatos();
        actualizarContadores();
    }
});

// =========================================
// 6. INICIO DE LA APP
// =========================================
inicializarTema();
cargarDatos();
inputTarea.focus();


// Pedir permiso para notificaciones al iniciar
if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
}

// Revisar recordatorios cada 30 segundos
setInterval(verificarRecordatorios, 1000);


// Añade esto al final de tu archivo JS para probar en GitHub
document.addEventListener('click', () => {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}, { once: true }); // Solo se ejecutará el primer clic que hagas
