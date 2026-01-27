// =========================================
// 1. SELECCIÓN DE ELEMENTOS Y VARIABLES
// =========================================
const botonAgregar = document.getElementById("boton-agregar");
const listaTareas = document.getElementById("lista-tareas");
const inputTarea = document.getElementById("input-tarea");
const botonBorrar = document.getElementById("boton-borrar");
const themeToggle = document.getElementById("theme-toggle");

// =========================================
// 2. LÓGICA DE PERSISTENCIA (EL ARCHIVADOR)
// =========================================

function guardarDatos() {
    const tareas = [];
    const elementosLista = document.querySelectorAll("li");
    
    elementosLista.forEach((elemento) => { 
        tareas.push({
            texto: elemento.innerText,
            completada: elemento.classList.contains("completada")
        });
    });

    localStorage.setItem("tareas_usuario", JSON.stringify(tareas));
}

function cargarDatos() {
    const datosGuardados = localStorage.getItem("tareas_usuario");

    if (datosGuardados) {
        const tareas = JSON.parse(datosGuardados);
        tareas.forEach(tarea => insertarTarea(tarea.texto, tarea.completada));
    } else {
        // Tareas de bienvenida para nuevos usuarios
        const predeterminadas = [
            "Haz clic para completar una tarea",
            "Clic derecho para borrar",
            "Usa el botón de arriba para el modo oscuro"
        ];
        predeterminadas.forEach(msg => insertarTarea(msg, false));
        guardarDatos();
    } 
    actualizarContadores();
}

// =========================================
// 3. LA FÁBRICA DE TAREAS
// =========================================

function insertarTarea(texto, completada) { 
    if (texto === "") return;

    const nuevaTarea = document.createElement("li");
    nuevaTarea.innerText = texto;

    if (completada) nuevaTarea.classList.add("completada");

    // Evento: Tachar (Click Izquierdo)
    nuevaTarea.addEventListener("click", () => {
        nuevaTarea.classList.toggle("completada");
        guardarDatos();
        actualizarContadores();
    });

    // Evento: Borrar (Click Derecho)
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

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const esOscuro = document.body.classList.contains("dark-mode");
    
    themeToggle.innerText = esOscuro ? "☀️" : "🌙";
    localStorage.setItem("tema", esOscuro ? "oscuro" : "claro");
});

// =========================================
// 5. EVENTOS DE ENTRADA (BOTONES Y TECLADO)
// =========================================

// Botón Añadir
botonAgregar.addEventListener("click", () => {
    const texto = inputTarea.value.trim();
    if (texto !== "") {
        insertarTarea(texto, false);
        inputTarea.value = "";
        inputTarea.focus();
        guardarDatos();
    }
});

// Tecla Enter
inputTarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter") botonAgregar.click();
});

// Botón Borrar Todo
botonBorrar.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que quieres borrar todas tus tareas?")) {
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