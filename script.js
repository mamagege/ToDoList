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
        // Buscamos el span de la fecha dentro de este elemento
        const spanFecha = elemento.querySelector(".fecha-tarea");
        
        // Obtenemos solo el texto de la fecha
        const fechaTexto = spanFecha ? spanFecha.innerText : "";

        // TRUCO: Para obtener solo el texto de la tarea y no la fecha,
        // tomamos todo el texto del LI y le quitamos la parte de la fecha.
        const textoLimpio = elemento.innerText.replace(fechaTexto, "").trim();

        tareas.push({
            texto: textoLimpio,
            completada: elemento.classList.contains("completada"),
            fecha: fechaTexto // ¡Guardamos el nuevo dato!
        });
    });

    localStorage.setItem("tareas_usuario", JSON.stringify(tareas));
}

function cargarDatos() {
    const datosGuardados = localStorage.getItem("tareas_usuario");

    if (datosGuardados) {
        const tareas = JSON.parse(datosGuardados);
        tareas.forEach(tarea => insertarTarea(tarea.texto, tarea.completada,tarea.fecha));
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

// Aceptamos un tercer parámetro: 'fecha'
function insertarTarea(texto, completada, fecha) { 
    if (texto === "") return;

    const listaTareas = document.getElementById("lista-tareas");
    const nuevaTarea = document.createElement("li");

    // 1. Ponemos el texto de la tarea primero
    // Usamos createTextNode para que el texto no se mezcle con el HTML del span
    nuevaTarea.appendChild(document.createTextNode(texto));

    // 2. Si la tarea está completada, añadimos la clase
    if (completada) nuevaTarea.classList.add("completada");

    // 3. CREACIÓN DE LA FECHA (¡Lo nuevo!)
    const spanFecha = document.createElement("span");
    // Usamos el operador ||: Si hay fecha guardada úsala, si no, usa la de hoy
    spanFecha.innerText = fecha || new Date().toLocaleDateString(); 
    spanFecha.classList.add("fecha-tarea"); // Para que el CSS funcione
    nuevaTarea.appendChild(spanFecha); // Metemos el span DENTRO del li

    // 

    // 4. Eventos (Esto sigue igual que antes)
    nuevaTarea.addEventListener("click", () => {
        nuevaTarea.classList.toggle("completada");
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