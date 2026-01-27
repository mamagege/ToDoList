const botonAgregar = document.getElementById("boton-agregar");
const listaTareas = document.getElementById("lista-tareas");
const inputTarea = document.getElementById("input-tarea");

function guardarDatos() {
    const tareas = []
    const elementosLista = document.querySelectorAll("li");
    elementosLista.forEach( (elemento) => { 
        const tareaObjeto = {
            texto: elemento.innerText,
            completada: elemento.classList.contains("completada")
        };
        tareas.push(tareaObjeto);
    });

    const tareasEntexto = JSON.stringify(tareas)
        localStorage.setItem("tareas_usuario", tareasEntexto)

};

function cargarDatos() {
    const listaTareas = document.getElementById("lista-tareas");
    const datosGuardados = localStorage.getItem("tareas_usuario");

    if (datosGuardados) {
        const tareas = JSON.parse(datosGuardados);

        tareas.forEach((tarea) => {
            insertarTarea(tarea.texto, tarea.completada);
        });

    } else {

        const elementosPredeterminados = ["Click izquierdo para completar","Click derecho para borrar"]
        elementosPredeterminados.forEach((e) => {
            insertarTarea(e,false)

        });
        guardarDatos();
        

    } 
    actualizarContadores();
    inputTarea.focus();
};

function insertarTarea(texto, completada) { 
    const listaTareas = document.getElementById("lista-tareas");
    
    if (texto !== "") {
        const nuevaTarea = document.createElement("li");
        nuevaTarea.innerText = texto;

        // Evento para tachar (clic izquierdo)
        if (completada) {
            nuevaTarea.classList.toggle("completada");
        
        }
        nuevaTarea.addEventListener("click", () => {
            nuevaTarea.classList.toggle("completada");
            guardarDatos();
            actualizarContadores();
        });

        
        // Evento para borrar (clic derecho)
        nuevaTarea.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            nuevaTarea.remove();
            guardarDatos();
            actualizarContadores();
        });

        listaTareas.appendChild(nuevaTarea);
        actualizarContadores();
    }
};


function actualizarContadores() {
    const todosLosItems = document.querySelectorAll("li");
    const itemsCompletados = document.querySelectorAll("li.completada");

    document.getElementById("total-tareas").innerText = todosLosItems.length;
    document.getElementById("completadas-tareas").innerText = itemsCompletados.length;
}


//Funcionalidad Botón Añadir
    botonAgregar.addEventListener("click", () => {
    //Guardamos el texto sin espacios extra
    const texto = inputTarea.value.trim();
    if (texto !== "") {
        insertarTarea(texto, false)
        inputTarea.value = ""; //Limpiar el input
    }

});

// Añadir tarea al presionar Enter
inputTarea.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        const texto = inputTarea.value.trim();
        if (texto !== "") {
            insertarTarea(texto, false);
            inputTarea.value = ""; 
            guardarDatos();
        }
    }
});


//Borrar todo

const botonBorrar = document.getElementById("boton-borrar");
botonBorrar.addEventListener("click", () => {
    // 1. Limpiar el HTML de la lista
    listaTareas.innerHTML = "";
    // 2. Avisar al archivador
    guardarDatos();
    actualizarContadores();
    
});


//Cargar datos

cargarDatos()
