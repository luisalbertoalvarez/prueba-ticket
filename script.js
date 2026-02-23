// ============================================
// CONFIGURACIÓN FIREBASE (REEMPLAZA CON TUS DATOS)
// ============================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, updateDoc, getDoc, getDocs, query, where, onSnapshot, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ⚠️ REEMPLAZA ESTO CON TU CONFIGURACIÓN DE FIREBASE CONSOLE
const firebaseConfig = {
 apiKey: "AIzaSyDt717AtP7eLMJgpjH7xBnLuOoJmZyPopk",
  authDomain: "sistema-tickets-664b2.firebaseapp.com",
  projectId: "sistema-tickets-664b2",
  storageBucket: "sistema-tickets-664b2.appspot.com",  
  messagingSenderId: "622723819251",
  appId: "1:622723819251:web:edd61ab16fa9397863b986"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ============================================
// VARIABLES GLOBALES
// ============================================
let ticketActivoId = null;
let ticketSuspendido = false;
let ticketResuelto = false;
let fechaResolucion = null;
let avancesArray = [];
let hayNuevosAvances = false;
let temaActual = localStorage.getItem('temaPreferido') || 'light';
let usuarioActual = null; // 👈 Usuario logueado

// Elementos del DOM
const cronometroEl = document.getElementById('cronometro');
const tiempoProgresoEl = document.getElementById('tiempoProgreso');
const tiempoSuspendidoEl = document.getElementById('tiempoSuspendido');
const tiempoTotalEl = document.getElementById('tiempoTotal');
const tiempoUltimoAvanceEl = document.getElementById('tiempoUltimoAvance');
const fechaUltimoAvanceEl = document.getElementById('fechaUltimoAvance');
const historialAvancesEl = document.getElementById('historialAvances');
const avanceInputEl = document.getElementById('avanceInput');
const suspensionIndicatorEl = document.getElementById('suspensionIndicator');
const suspendBtnEl = document.getElementById('suspendBtn');
const fechaAfectacionMostradaEl = document.getElementById('fechaAfectacionMostrada');
const nuevosAvancesBadgeEl = document.getElementById('nuevosAvancesBadge');
const themeToggleBtn = document.getElementById('themeToggle');
const themeTransitionEl = document.getElementById('themeTransition');
const htmlElement = document.documentElement;
const slaProgresoEl = document.getElementById('slaProgreso');
const slaSuspendidoEl = document.getElementById('slaSuspendido');
const slaTotalEl = document.getElementById('slaTotal');
const resueltoIndicatorEl = document.getElementById('resueltoIndicator');
const resolveBtnEl = document.getElementById('resolveBtn');
const reopenBtnEl = document.getElementById('reopenBtn');
let estadoActual = 0;

// ============================================
// AUTENTICACIÓN FIREBASE
// ============================================

// Escuchar cambios de autenticación
onAuthStateChanged(auth, (user) => {
  if (user) {
    usuarioActual = user;
    // Mostrar UI de usuario
    let userBar = document.getElementById('userBar');
    if (!userBar) {
      userBar = document.createElement('div');
      userBar.id = 'userBar';
      userBar.style.cssText = 'position:fixed;top:15px;right:15px;z-index:1000;background:var(--bg-card);padding:8px 15px;border-radius:50px;box-shadow:var(--card-shadow);display:flex;align-items:center;gap:10px;';
      userBar.innerHTML = `<span id="userName" style="font-weight:500;color:var(--text-primary);"></span><button onclick="logout()" class="btn btn-sm btn-outline-danger">Salir</button>`;
      document.body.appendChild(userBar);
    }
    userBar.style.display = 'flex';
    document.getElementById('userName').textContent = user.email.split('@')[0];
    
    // Mostrar sección de reasignación
    const sectionReasignar = document.getElementById('sectionReasignar');
    if (sectionReasignar) sectionReasignar.style.display = 'block';
    
    // Ocultar login
    const loginModal = document.getElementById('loginModal');
    if (loginModal) loginModal.style.display = 'none';
    
    // Cargar usuarios y tickets
    cargarUsuariosParaReasignar();
    escucharTicketsEnTiempoReal();
  } else {
    usuarioActual = null;
    const userBar = document.getElementById('userBar');
    if (userBar) userBar.style.display = 'none';
    const sectionReasignar = document.getElementById('sectionReasignar');
    if (sectionReasignar) sectionReasignar.style.display = 'none';
    const loginModal = document.getElementById('loginModal');
    if (loginModal) loginModal.style.display = 'flex';
  }
});

async function login() {
  const email = document.getElementById('loginEmail')?.value;
  const password = document.getElementById('loginPassword')?.value;
  
  if (!email || !password) {
    mostrarToast('Ingresa correo y contraseña', 'error');
    return;
  }
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    mostrarToast(`✅ Bienvenido, ${email.split('@')[0]}`, 'success');
  } catch (error) {
    mostrarToast(`❌ Error: ${error.message}`, 'error');
  }
}

async function register() {
  const email = document.getElementById('loginEmail')?.value;
  const password = document.getElementById('loginPassword')?.value;
  
  if (!email || !password) {
    mostrarToast('Ingresa correo y contraseña para registrarte', 'error');
    return;
  }
  
  if (password.length < 6) {
    mostrarToast('La contraseña debe tener al menos 6 caracteres', 'error');
    return;
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Guardar usuario en colección 'users'
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      nombre: email.split('@')[0],
      rol: 'operador',
      createdAt: new Date()
    });
    
    mostrarToast(`✅ Cuenta creada: ${email}`, 'success');
  } catch (error) {
    mostrarToast(`❌ Error: ${error.message}`, 'error');
  }
}

function logout() {
  signOut(auth);
  mostrarToast('👋 Sesión cerrada', 'success');
}

function cerrarLogin() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.style.display = 'none';
}

// ============================================
// FUNCIONES FIRESTORE
// ============================================

async function guardarTicketEnFirebase(ticket) {
  try {
    if (!usuarioActual) {
      console.log('Sin usuario, guardando solo en localStorage');
      return null;
    }
    
    // Agregar datos del usuario
    ticket.creadoPor = usuarioActual.uid;
    ticket.creadoPorEmail = usuarioActual.email;
    ticket.asignadoA = ticket.asignadoA || usuarioActual.uid;
    ticket.asignadoAEmail = ticket.asignadoAEmail || usuarioActual.email;
    ticket.fechaActualizacion = new Date();
    
    const ticketRef = ticket.id 
      ? doc(db, "tickets", ticket.id)
      : doc(collection(db, "tickets"));
    
    const ticketId = ticketRef.id;
    await setDoc(ticketRef, ticket);
    
    console.log("✅ Ticket guardado en Firebase:", ticketId);
    return ticketId;
  } catch (error) {
    console.error("❌ Error guardando en Firebase:", error);
    return null;
  }
}

async function escucharTicketsEnTiempoReal() {
  if (!usuarioActual) return;
  
  const q = query(
    collection(db, "tickets"),
    where("asignadoA", "==", usuarioActual.uid),
    orderBy("fechaActualizacion", "desc")
  );
  
  onSnapshot(q, (snapshot) => {
    const listaTicketsEl = document.getElementById('listaTickets');
    if (!listaTicketsEl) return;
    
    listaTicketsEl.innerHTML = '';
    
    if (snapshot.empty) {
      listaTicketsEl.innerHTML = `
        <div class="empty-state">
          <i class="bi bi-inbox"></i>
          <p>No hay tickets asignados. Crea uno nuevo o espera a que te asignen uno.</p>
          <button class="btn btn-primary mt-3" onclick="nuevoTicket()">
            <i class="bi bi-plus-circle"></i> Crear primer ticket
          </button>
        </div>`;
      return;
    }
    
    snapshot.forEach(docSnap => {
      const t = docSnap.data();
      const d = document.createElement('div');
      
      let estadoClass = 'ticket-activo';
      if (t.isResolved) estadoClass = 'ticket-resuelto';
      else if (t.isSuspended) estadoClass = 'ticket-suspendido';
      else if (t.workflowState === 1) estadoClass = 'ticket-escalonado';
      else if (t.workflowState === 3) estadoClass = 'ticket-restablecido';
      
      d.className = `ticket-block ${estadoClass}`;
      d.innerHTML = `
        ${t.ticketId || 'Sin ID'}
        ${t.isResolved ? `<span class="resuelto-badge"><i class="bi bi-check"></i></span>` : ''}
        ${t.isSuspended ? `<span class="suspended-badge"><i class="bi bi-pause"></i></span>` : ''}
        ${t.asignadoAEmail && t.asignadoAEmail !== usuarioActual.email ? 
          `<small style="display:block;font-size:0.75rem;opacity:0.8;">Asignado: ${t.asignadoAEmail.split('@')[0]}</small>` : ''}
      `;
      
      d.onclick = () => cargarTicketDesdeFirebase(docSnap.id, t);
      d.style.cursor = 'pointer';
      listaTicketsEl.appendChild(d);
    });
  });
}

async function cargarTicketDesdeFirebase(id, data) {
  ticketActivoId = id;
  estadoActual = data.workflowState ?? 0;
  ticketSuspendido = data.isSuspended ?? false;
  ticketResuelto = data.isResolved || false;
  fechaResolucion = data.resolutionDate ? new Date(data.resolutionDate) : null;
  
  // Llenar formulario
  const setId = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  
  setId('ticketId', data.ticketId);
  setId('fechaAfectacion', data.fechaAfectacion);
  setId('tramo', data.tramo);
  setId('hostname', data.hostname);
  setId('puertos', data.puertos);
  setId('redAfectada', data.redAfectada);
  setId('onnet', data.onnet);
  setId('offnet', data.offnet);
  setId('pais', data.pais);
  setId('ticketSecundarios', data.ticketSecundarios);
  setId('impacto', data.impacto);
  setId('capacidadAfectada', data.capacidadAfectada);
  setId('diagnostico', data.diagnostico);
  setId('accionesAdicionales', data.accionesAdicionales);
  
  // ETR
  const etrHorasEl = document.getElementById('etrHoras');
  const etrMinutosEl = document.getElementById('etrMinutos');
  if (etrHorasEl) etrHorasEl.value = data.etrHoras || '0';
  if (etrMinutosEl) etrMinutosEl.value = data.etrMinutos || '0';
  
  const noEtrCheck = document.getElementById('noEtrCheck');
  if (noEtrCheck) {
    if (data.noEtr) {
      noEtrCheck.checked = true;
      const etrInputs = document.getElementById('etrInputs');
      if (etrInputs) etrInputs.style.display = 'none';
    } else {
      noEtrCheck.checked = false;
      const etrInputs = document.getElementById('etrInputs');
      if (etrInputs) etrInputs.style.display = 'block';
    }
  }
  
  // Avances
  if (data.avancesArray && Array.isArray(data.avancesArray)) {
    avancesArray = data.avancesArray.map(avance => ({
      timestamp: new Date(avance.timestamp),
      texto: avance.texto,
      tipo: avance.tipo || 'normal',
      editado: avance.editado || null
    })).sort((a, b) => a.timestamp - b.timestamp);
  } else {
    avancesArray = [];
  }
  
  renderizarAvances();
  hayNuevosAvances = false;
  nuevosAvancesBadgeEl.style.display = 'none';
  actualizarSuspensionUI();
  actualizarPlantilla();
  actualizarCronometro();
  mostrarFechaAfectacion();
  
  // UI de resolución
  if (ticketResuelto) {
    if (resolveBtnEl) {
      resolveBtnEl.innerHTML = '✓ Resuelto';
      resolveBtnEl.classList.replace('btn-outline-success', 'btn-success');
      resolveBtnEl.disabled = true;
    }
    if (reopenBtnEl) reopenBtnEl.style.display = 'inline-block';
  } else {
    if (resolveBtnEl) {
      resolveBtnEl.innerHTML = '🔧 Marcar como resuelto';
      resolveBtnEl.classList.replace('btn-success', 'btn-outline-success');
      resolveBtnEl.disabled = false;
    }
    if (reopenBtnEl) reopenBtnEl.style.display = 'none';
  }
  
  // Scroll a detalles
  const container = document.querySelector('.container-grid');
  if (container) container.scrollIntoView({behavior: 'smooth'});
}

// ============================================
// 🔄 FUNCIÓN PARA REASIGNAR TICKET (LO QUE PEDISTE)
// ============================================

async function cargarUsuariosParaReasignar() {
  if (!usuarioActual) return;
  
  const select = document.getElementById('selectUsuario');
  if (!select) return;
  
  select.innerHTML = '<option>Cargando...</option>';
  
  try {
    // Obtener usuarios que tienen tickets activos
    const usersSnapshot = await getDocs(
      query(
        collection(db, "tickets"),
        where("estado", "==", "activo")
      )
    );
    
    const usuarios = new Map();
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.creadoPorEmail) usuarios.set(data.creadoPor, data.creadoPorEmail);
      if (data.asignadoAEmail) usuarios.set(data.asignadoA, data.asignadoAEmail);
    });
    
    // Llenar el select (excluyendo al usuario actual)
    select.innerHTML = '<option value="">-- Seleccionar persona --</option>';
    usuarios.forEach((email, uid) => {
      if (uid !== usuarioActual.uid) {
        const option = document.createElement('option');
        option.value = uid;
        option.textContent = email.split('@')[0];
        option.dataset.email = email;
        select.appendChild(option);
      }
    });
    
    if (select.options.length === 1) {
      select.innerHTML = '<option value="">No hay más usuarios</option>';
    }
  } catch (error) {
    console.error("Error cargando usuarios:", error);
    select.innerHTML = '<option>Error al cargar</option>';
  }
}

async function reasignarTicket() {
  if (!ticketActivoId) {
    mostrarToast('Selecciona un ticket para reasignar', 'error');
    return;
  }
  
  const select = document.getElementById('selectUsuario');
  if (!select) {
    mostrarToast('No se encontró el selector de usuarios', 'error');
    return;
  }
  
  const nuevoUsuarioId = select.value;
  const nuevoUsuarioEmail = select.options[select.selectedIndex]?.dataset?.email;
  
  if (!nuevoUsuarioId || !nuevoUsuarioEmail) {
    mostrarToast('Selecciona una persona para reasignar', 'error');
    return;
  }
  
  const ticketIdInput = document.getElementById('ticketId');
  const ticketNombre = ticketIdInput?.value || 'este ticket';
  
  if (!confirm(`¿Reasignar ticket "${ticketNombre}" a ${nuevoUsuarioEmail.split('@')[0]}?`)) {
    return;
  }
  
  try {
    const ticketRef = doc(db, "tickets", ticketActivoId);
    
    // Actualizar en Firebase
    await updateDoc(ticketRef, {
      asignadoA: nuevoUsuarioId,
      asignadoAEmail: nuevoUsuarioEmail,
      fechaReasignacion: new Date(),
      reasignadoPor: usuarioActual.uid,
      estado: "activo"
    });
    
    // Agregar avance automático
    avancesArray.push({
      timestamp: new Date(),
      texto: `🔄 Ticket reasignado de ${usuarioActual.email.split('@')[0]} a ${nuevoUsuarioEmail.split('@')[0]}`,
      tipo: 'sistema'
    });
    
    await updateDoc(ticketRef, {
      avancesArray: avancesArray.map(avance => ({
        timestamp: avance.timestamp.toISOString(),
        texto: avance.texto,
        tipo: avance.tipo,
        editado: avance.editado
      }))
    });
    
    renderizarAvances();
    actualizarPlantilla();
    mostrarToast(`✅ Ticket reasignado a ${nuevoUsuarioEmail.split('@')[0]}`, 'success');
    
    // Recargar lista
    escucharTicketsEnTiempoReal();
    
  } catch (error) {
    console.error("Error reasignando:", error);
    mostrarToast(`❌ Error: ${error.message}`, 'error');
  }
}

// ============================================
// FUNCIONES EXISTENTES (MODIFICADAS PARA FIREBASE)
// ============================================

function configurarTema() {
  htmlElement.setAttribute('data-bs-theme', temaActual);
  actualizarIconoTema();
  localStorage.setItem('temaPreferido', temaActual);
}

function alternarTema() {
  themeTransitionEl.classList.add('active');
  setTimeout(() => {
    temaActual = temaActual === 'light' ? 'dark' : 'light';
    configurarTema();
    setTimeout(() => {
      themeTransitionEl.classList.remove('active');
    }, 300);
  }, 400);
}

function actualizarIconoTema() {
  const icon = themeToggleBtn.querySelector('i');
  if (temaActual === 'dark') {
    icon.className = 'bi bi-sun';
    icon.title = 'Cambiar a modo claro';
  } else {
    icon.className = 'bi bi-moon-stars';
    icon.title = 'Cambiar a modo oscuro';
  }
}

configurarTema();
themeToggleBtn.addEventListener('click', alternarTema);

function insertarFechaActual(inputId) {
  const ahora = new Date();
  const gmt5Timestamp = ahora.getTime() - (5 * 60 * 60 * 1000);
  const gmt5Date = new Date(gmt5Timestamp);
  const year = gmt5Date.getUTCFullYear();
  const month = String(gmt5Date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(gmt5Date.getUTCDate()).padStart(2, '0');
  const hours = String(gmt5Date.getUTCHours()).padStart(2, '0');
  const minutes = String(gmt5Date.getUTCMinutes()).padStart(2, '0');
  const fechaFormateada = `${year}-${month}-${day} ${hours}:${minutes}`;
  const input = document.getElementById(inputId);
  if (input) input.value = fechaFormateada;
  if (inputId === 'fechaAfectacion') {
    validarFormatoFecha('fechaAfectacion');
    actualizarCronometro();
  }
  mostrarToast(`Fecha y hora actual (GMT-5) insertada: ${fechaFormateada}`, 'success');
}

function validarFormatoFecha(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return true;
  const valor = input.value.trim();
  const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-3]):[0-5]\d$/;
  input.classList.remove('input-format-error');
  if (!valor) return true;
  if (!regex.test(valor)) {
    input.classList.add('input-format-error');
    mostrarToast(`Formato inválido en ${inputId}. Use: AAAA-MM-DD HH:mm (ej: 2026-02-03 14:30)`, 'error');
    return false;
  }
  return true;
}

function validarFormatoFechaManual(fechaStr) {
  const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-3]):[0-5]\d$/;
  return regex.test(fechaStr);
}

function obtenerFechaAfectacion() {
  const fechaInput = document.getElementById('fechaAfectacion');
  if (!fechaInput || !fechaInput.value.trim()) return null;
  if (!validarFormatoFecha('fechaAfectacion')) {
    console.error('Fecha inválida:', fechaInput.value);
    return null;
  }
  const [datePart, timePart] = fechaInput.value.trim().split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  const fechaUTC = Date.UTC(year, month - 1, day, hours + 5, minutes);
  const fecha = new Date(fechaUTC);
  if (isNaN(fecha.getTime())) {
    console.error('Fecha inválida:', fechaInput.value);
    return null;
  }
  return fecha;
}

function establecerFechaActualGMT5() {
  const input = document.getElementById('fechaAfectacion');
  if (!input) return;
  if (input.value.trim() !== '') {
    validarFormatoFecha('fechaAfectacion');
    return;
  }
  const ahora = new Date();
  const gmt5Timestamp = ahora.getTime() - (5 * 60 * 60 * 1000);
  const gmt5Date = new Date(gmt5Timestamp);
  const year = gmt5Date.getUTCFullYear();
  const month = String(gmt5Date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(gmt5Date.getUTCDate()).padStart(2, '0');
  const hours = String(gmt5Date.getUTCHours()).padStart(2, '0');
  const minutes = String(gmt5Date.getUTCMinutes()).padStart(2, '0');
  input.value = `${year}-${month}-${day} ${hours}:${minutes}`;
  validarFormatoFecha('fechaAfectacion');
}

function toggleNoEtr() {
  const noEtrCheck = document.getElementById('noEtrCheck');
  const etrInputs = document.getElementById('etrInputs');
  const etrHoras = document.getElementById('etrHoras');
  const etrMinutos = document.getElementById('etrMinutos');
  if (!noEtrCheck || !etrInputs) return;
  
  if (noEtrCheck.checked) {
    etrInputs.style.display = 'none';
    if (etrHoras) etrHoras.value = '0';
    if (etrMinutos) etrMinutos.value = '0';
  } else {
    etrInputs.style.display = 'block';
  }
  actualizarPlantilla();
}

function agregarSuspensionManual() {
  if (ticketResuelto) {
    mostrarToast('No se pueden registrar suspensiones en un ticket resuelto', 'warning');
    return;
  }
  const input = document.getElementById('suspensionManual');
  const motivoInput = document.getElementById('motivoSuspension');
  if (!input) return;
  
  const valor = input.value.trim();
  const motivo = motivoInput?.value.trim() || '';
  
  if (!valor) {
    mostrarToast('Ingrese fecha y hora para registrar la suspensión', 'error');
    input.focus();
    return;
  }
  if (!validarFormatoFecha('suspensionManual')) return;
  
  const [datePart, timePart] = valor.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  const fechaUTC = Date.UTC(year, month - 1, day, hours + 5, minutes);
  const fechaSuspension = new Date(fechaUTC);
  
  if (isNaN(fechaSuspension.getTime())) {
    mostrarToast('Fecha inválida para la suspensión', 'error');
    return;
  }
  
  const fechaAfectacion = obtenerFechaAfectacion();
  if (fechaAfectacion && fechaSuspension < fechaAfectacion) {
    mostrarToast('La suspensión no puede ser anterior a la fecha de afectación', 'error');
    return;
  }
  
  const textoCompleto = `Tiempo Seguimiento suspendido${motivo ? ` | Motivo: ${motivo}` : ''}`;
  const avance = { timestamp: fechaSuspension, texto: textoCompleto, tipo: 'suspension' };
  
  avancesArray.push(avance);
  avancesArray.sort((a, b) => a.timestamp - b.timestamp);
  
  renderizarAvances();
  if (input) input.value = '';
  if (motivoInput) motivoInput.value = '';
  input?.classList.remove('input-format-error');
  
  hayNuevosAvances = true;
  actualizarPlantilla();
  actualizarCronometro();
  
  const fechaStr = fechaSuspension.toLocaleString('es-EC', {timeZone: 'America/Guayaquil', hour12: false});
  mostrarToast(`Suspensión registrada: ${fechaStr}`, 'success');
}

function agregarReanudacionManual() {
  if (ticketResuelto) {
    mostrarToast('No se pueden registrar reanudaciones en un ticket resuelto', 'warning');
    return;
  }
  const input = document.getElementById('reanudacionManual');
  const motivoInput = document.getElementById('motivoReanudacion');
  if (!input) return;
  
  const valor = input.value.trim();
  const motivo = motivoInput?.value.trim() || '';
  
  if (!valor) {
    mostrarToast('Ingrese fecha y hora para registrar la reanudación', 'error');
    input.focus();
    return;
  }
  if (!validarFormatoFecha('reanudacionManual')) return;
  
  const [datePart, timePart] = valor.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  const fechaUTC = Date.UTC(year, month - 1, day, hours + 5, minutes);
  const fechaReanudacion = new Date(fechaUTC);
  
  if (isNaN(fechaReanudacion.getTime())) {
    mostrarToast('Fecha inválida para la reanudación', 'error');
    return;
  }
  
  const fechaAfectacion = obtenerFechaAfectacion();
  if (fechaAfectacion && fechaReanudacion < fechaAfectacion) {
    mostrarToast('La reanudación no puede ser anterior a la fecha de afectación', 'error');
    return;
  }
  
  const textoCompleto = `Tiempo Seguimiento reanudado${motivo ? ` | Motivo: ${motivo}` : ''}`;
  const avance = { timestamp: fechaReanudacion, texto: textoCompleto, tipo: 'reanudacion' };
  
  avancesArray.push(avance);
  avancesArray.sort((a, b) => a.timestamp - b.timestamp);
  
  renderizarAvances();
  if (input) input.value = '';
  if (motivoInput) motivoInput.value = '';
  input?.classList.remove('input-format-error');
  
  hayNuevosAvances = true;
  actualizarPlantilla();
  actualizarCronometro();
  
  const fechaStr = fechaReanudacion.toLocaleString('es-EC', {timeZone: 'America/Guayaquil', hour12: false});
  mostrarToast(`Reanudación registrada: ${fechaStr}`, 'success');
}

function toggleFechaManualAvance() {
  const checkbox = document.getElementById('usarFechaManual');
  const input = document.getElementById('fechaAvanceManual');
  if (!checkbox || !input) return;
  
  const btnCalendar = input.parentElement?.querySelector('.btn-calendar');
  input.disabled = !checkbox.checked;
  if (btnCalendar) btnCalendar.disabled = !checkbox.checked;
  
  if (checkbox.checked) {
    insertarFechaActual('fechaAvanceManual');
  }
}

function agregarAvance() {
  if (ticketResuelto) {
    mostrarToast('No se pueden agregar avances a un ticket resuelto', 'warning');
    return;
  }
  if (!avanceInputEl || !avanceInputEl.value.trim()) {
    mostrarToast('Por favor ingrese un avance o comentario antes de agregar', 'error');
    avanceInputEl?.focus();
    return;
  }
  
  let fechaAvance;
  const usarManual = document.getElementById('usarFechaManual')?.checked;
  
  if (usarManual) {
    const valorManual = document.getElementById('fechaAvanceManual')?.value.trim();
    if (!valorManual) {
      mostrarToast('Seleccione una fecha y hora para el avance manual', 'error');
      return;
    }
    if (!validarFormatoFecha('fechaAvanceManual')) return;
    
    const [datePart, timePart] = valorManual.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    const fechaUTC = Date.UTC(year, month - 1, day, hours + 5, minutes);
    fechaAvance = new Date(fechaUTC);
    
    if (isNaN(fechaAvance.getTime())) {
      mostrarToast('Formato de fecha inválido para el avance', 'error');
      return;
    }
    
    const fechaAfectacion = obtenerFechaAfectacion();
    if (fechaAfectacion && fechaAvance < fechaAfectacion) {
      mostrarToast('La fecha del avance no puede ser anterior a la fecha de afectación', 'error');
      return;
    }
    
    if (avancesArray.length > 0) {
      const ultimoAvance = avancesArray[avancesArray.length - 1];
      if (fechaAvance < ultimoAvance.timestamp) {
        if (!confirm('La fecha del avance es anterior al último avance registrado. ¿Desea continuar?')) {
          return;
        }
      }
    }
  } else {
    fechaAvance = new Date();
  }
  
  const nuevoAvance = { timestamp: fechaAvance, texto: avanceInputEl.value.trim(), tipo: 'normal' };
  avancesArray.push(nuevoAvance);
  avancesArray.sort((a, b) => a.timestamp - b.timestamp);
  
  renderizarAvances();
  if (avanceInputEl) avanceInputEl.value = '';
  
  const manualCheck = document.getElementById('usarFechaManual');
  const manualInput = document.getElementById('fechaAvanceManual');
  if (manualCheck) manualCheck.checked = false;
  if (manualInput) {
    manualInput.disabled = true;
    manualInput.value = '';
  }
  
  hayNuevosAvances = true;
  if (estadoActual < 2 && !ticketSuspendido) estadoActual = 2;
  
  actualizarPlantilla();
  
  if (avanceInputEl) {
    avanceInputEl.classList.add('is-valid');
    setTimeout(() => avanceInputEl.classList.remove('is-valid'), 2000);
  }
}

function renderizarAvances() {
  if (!historialAvancesEl) return;
  
  historialAvancesEl.innerHTML = '';
  
  if (avancesArray.length === 0) {
    historialAvancesEl.innerHTML = '<p class="text-muted text-center py-3">No hay avances registrados aún</p>';
    return;
  }
  
  avancesArray.sort((a, b) => a.timestamp - b.timestamp);
  
  avancesArray.forEach((avance, index) => {
    const fechaFormateada = avance.timestamp.toLocaleString('es-EC', {
      timeZone: 'America/Guayaquil',
      year: '2-digit', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
    
    let claseCSS = '';
    let remitente = 'Operador';
    let esEditable = false;
    
    if (avance.tipo === 'suspension') {
      claseCSS = 'suspension sistema';
      remitente = 'Sistema';
    } else if (avance.tipo === 'reanudacion') {
      claseCSS = 'reanudacion sistema';
      remitente = 'Sistema';
    } else if (avance.tipo === 'resuelto') {
      claseCSS = 'sistema resuelto';
      remitente = 'Sistema';
    } else if (avance.tipo === 'sistema') {
      claseCSS = 'sistema';
      remitente = 'Sistema';
    } else {
      esEditable = true;
    }
    
    const tieneEdicion = avance.editado ?
      `<div class="avance-edited-indicator"><i class="bi bi-pencil-square"></i> Editado: ${new Date(avance.editado).toLocaleString('es-EC', { timeZone: 'America/Guayaquil', hour12: false, year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>` : '';
    
    const botonesAccion = (esEditable && !ticketResuelto) ? 
      `<div class="avance-actions"><button class="btn-edit-avance" title="Editar avance" onclick="iniciarEdicionAvance(${index})"><i class="bi bi-pencil"></i></button><button class="btn-delete-avance" title="Eliminar avance" onclick="eliminarAvance(${index})"><i class="bi bi-trash"></i></button></div>` : '';
    
    const avanceHTML = 
      `<div class="avance-entry ${claseCSS}" data-index="${index}">
        <div class="avance-time">
          <span>${fechaFormateada}</span>
          <span>${remitente}${avance.editado ? '<i class="bi bi-pencil-square" style="font-size:0.7em;color:#ffc107"></i>' : ''}</span>
        </div>
        <div class="avance-texto">${avance.texto.replace(/\n/g, '<br>')}</div>
        ${tieneEdicion}
        ${botonesAccion}
      </div>`;
    
    historialAvancesEl.innerHTML += avanceHTML;
  });
  
  historialAvancesEl.scrollTop = historialAvancesEl.scrollHeight;
  
  if (hayNuevosAvances && nuevosAvancesBadgeEl) {
    nuevosAvancesBadgeEl.style.display = 'inline-block';
    nuevosAvancesBadgeEl.textContent = `${avancesArray.length} avances`;
  } else if (nuevosAvancesBadgeEl) {
    nuevosAvancesBadgeEl.style.display = 'none';
  }
}

function iniciarEdicionAvance(index) {
  if (ticketResuelto) {
    mostrarToast('No se pueden editar avances en un ticket resuelto', 'warning');
    return;
  }
  
  const avance = avancesArray[index];
  if (avance.tipo !== 'normal' && avance.tipo !== undefined) {
    mostrarToast('Solo se pueden editar avances creados por operadores', 'warning');
    return;
  }
  
  const avanceEntry = document.querySelector(`.avance-entry[data-index="${index}"]`);
  if (!avanceEntry) return;
  
  const fechaFormateada = avance.timestamp.toLocaleString('es-EC', {
    timeZone: 'America/Guayaquil', year: '2-digit', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
  
  avanceEntry.innerHTML = 
    `<div class="avance-time"><span>${fechaFormateada}</span><span>Operador <small>(editando)</small></span></div>
    <div class="avance-edit-mode">
      <textarea id="editAvanceTextarea_${index}" class="form-control">${avance.texto}</textarea>
      <div class="d-flex justify-content-end mt-2 gap-2">
        <button class="btn-save-edit" onclick="guardarEdicionAvance(${index})"><i class="bi bi-check-lg"></i> Guardar</button>
        <button class="btn-cancel-edit" onclick="cancelarEdicionAvance(${index})"><i class="bi bi-x-lg"></i> Cancelar</button>
      </div>
    </div>`;
  
  setTimeout(() => {
    const textarea = document.getElementById(`editAvanceTextarea_${index}`);
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
  }, 100);
}

function guardarEdicionAvance(index) {
  const textarea = document.getElementById(`editAvanceTextarea_${index}`);
  if (!textarea) return;
  
  const nuevoTexto = textarea.value.trim();
  if (!nuevoTexto) {
    mostrarToast('El avance no puede estar vacío', 'error');
    return;
  }
  
  avancesArray[index] = { ...avancesArray[index], texto: nuevoTexto, editado: new Date().toISOString() };
  avancesArray.sort((a, b) => a.timestamp - b.timestamp);
  
  renderizarAvances();
  actualizarPlantilla();
  hayNuevosAvances = true;
  guardarTicket();
  
  mostrarToast('✅ Avance editado exitosamente', 'success');
}

function cancelarEdicionAvance(index) {
  renderizarAvances();
  mostrarToast('Edición cancelada', 'info');
}

function eliminarAvance(index) {
  if (ticketResuelto) {
    mostrarToast('No se pueden eliminar avances en un ticket resuelto', 'warning');
    return;
  }
  
  const avance = avancesArray[index];
  if (avance.tipo !== 'normal' && avance.tipo !== undefined) {
    mostrarToast('Solo se pueden eliminar avances creados por operadores', 'warning');
    return;
  }
  
  if (!confirm('⚠️ ¿Eliminar este avance? Esta acción no se puede deshacer.')) return;
  
  avancesArray.splice(index, 1);
  avancesArray.sort((a, b) => a.timestamp - b.timestamp);
  
  renderizarAvances();
  actualizarPlantilla();
  hayNuevosAvances = true;
  guardarTicket();
  
  mostrarToast('🗑️ Avance eliminado exitosamente', 'success');
}

function actualizarPlantilla() {
  const getVal = (id) => document.getElementById(id)?.value || '';
  
  const ticketId = getVal('ticketId');
  const tramo = getVal('tramo');
  const hostname = getVal('hostname') || 'No especificado';
  const puertos = getVal('puertos') || 'No especificados';
  const redAfectada = getVal('redAfectada') || '-';
  const onnet = getVal('onnet') || '-';
  const offnet = getVal('offnet') || '-';
  const pais = getVal('pais') || '-';
  const diagnostico = getVal('diagnostico') || 'Sin diagnóstico';
  const accionesAdicionales = getVal('accionesAdicionales') || 'Sin acciones adicionales definidas';
  const ticketSecundarios = getVal('ticketSecundarios') || 'Ninguno';
  const impacto = getVal('impacto') || 'Sin impacto definido';
  const capacidadAfectada = getVal('capacidadAfectada') || 'No especificada';
  
  const noEtrCheck = document.getElementById('noEtrCheck');
  const estadoTexto = ticketResuelto ? "Resuelto" : (ticketSuspendido ? "Suspendido" : "Progreso");
  
  let etrTxt = 'No definido';
  if (noEtrCheck?.checked) {
    etrTxt = 'No hay ETR definido';
  } else {
    const horas = parseInt(getVal('etrHoras')) || 0;
    const minutos = parseInt(getVal('etrMinutos')) || 0;
    if (horas > 0 || minutos > 0) etrTxt = `${horas}h ${minutos}m`;
  }
  
  let historialTexto = '';
  if (avancesArray.length === 0) {
    historialTexto = 'Sin avances aún';
  } else {
    historialTexto = avancesArray.map(avance => {
      const fechaStr = avance.timestamp.toLocaleString('es-EC', {
        timeZone: 'America/Guayaquil', year: '2-digit', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
      });
      const prefijo = avance.tipo === 'resuelto' ? '✅ ' : '';
      const indicadorEdicion = avance.editado ? ' ✏️' : '';
      return `*_${fechaStr}_* - ${prefijo}${avance.texto}${indicadorEdicion}`;
    }).join('\n');
  }
  
  const fechaAfectacion = obtenerFechaAfectacion();
  const fechaAfectacionTexto = fechaAfectacion ?
    fechaAfectacion.toLocaleString('es-EC', { timeZone: 'America/Guayaquil', hour12: false }) : 'No definida';
  
  const ahora = ticketResuelto ? fechaResolucion : new Date();
  const { activeTime, suspendedTime, totalTime } = fechaAfectacion ?
    calculateActiveAndSuspendedTime(fechaAfectacion, avancesArray, ahora) :
    { activeTime: 0, suspendedTime: 0, totalTime: 0 };
  
  const plantillaTexto =
`========================================
TICKET DE INCIDENCIA - SEGUIMIENTO
Ticket: ${ticketId || '(sin ID)'}
Estado: ${estadoTexto}
Tramo: ${tramo || '-'}
Hostname: ${hostname}
Puertos: ${puertos}
Red afectada: ${redAfectada}
Fecha de afectación (GMT-5): ${fechaAfectacionTexto}
${ticketResuelto ? `Fecha de resolución (GMT-5): ${fechaResolucion?.toLocaleString('es-EC', {timeZone: 'America/Guayaquil', hour12: false})}` : ''}

TIEMPOS SLA:
Tiempo en progreso: ${formatear(activeTime)}
Tiempo suspendido: ${formatear(suspendedTime)}
Tiempo total transcurrido: ${formatear(totalTime)}
${ticketResuelto ? '⚠️ TICKET RESUELTO - TIEMPOS CONGELADOS ⚠️' : ''}

Red Onnet: ${onnet}
Proveedor Offnet: ${offnet}
País: ${pais}

INFORMACIÓN ADICIONAL:
Ticket secundarios: ${ticketSecundarios}
Impacto: ${impacto}
Capacidad afectada: ${capacidadAfectada}

DIAGNÓSTICO INICIAL:
${diagnostico}

ETR ESTIMADO: ${etrTxt}

HISTORIAL DE AVANCES (orden cronológico):
${historialTexto}

ACCIONES ADICIONALES:
${accionesAdicionales}
========================================`;
  
  const plantillaEl = document.getElementById('plantillaSeguimiento');
  if (plantillaEl) plantillaEl.innerText = plantillaTexto;
}

function formatear(ms) {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (days > 0) {
    return `${days} día${days > 1 ? 's' : ''} ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  } else {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

function mostrarFechaAfectacion() {
  if (!fechaAfectacionMostradaEl) return;
  const fecha = obtenerFechaAfectacion();
  
  if (fecha) {
    const opciones = {
      timeZone: 'America/Guayaquil', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false
    };
    fechaAfectacionMostradaEl.textContent = fecha.toLocaleString('es-EC', opciones);
    fechaAfectacionMostradaEl.className = 'time-detail text-success fw-medium';
  } else {
    fechaAfectacionMostradaEl.textContent = 'Sin fecha de afectación definida';
    fechaAfectacionMostradaEl.className = 'time-detail text-muted';
  }
}

function actualizarCronometro() {
  const ahora = ticketResuelto ? fechaResolucion : new Date();
  const inicio = obtenerFechaAfectacion();
  
  if (inicio) {
    const { activeTime, suspendedTime, totalTime } = calculateActiveAndSuspendedTime(inicio, avancesArray, ahora);
    
    if (tiempoProgresoEl) tiempoProgresoEl.innerText = formatear(activeTime);
    if (tiempoSuspendidoEl) tiempoSuspendidoEl.innerText = formatear(suspendedTime);
    if (tiempoTotalEl) tiempoTotalEl.innerText = formatear(totalTime);
    if (slaProgresoEl) slaProgresoEl.innerText = formatear(activeTime);
    if (slaSuspendidoEl) slaSuspendidoEl.innerText = formatear(suspendedTime);
    if (slaTotalEl) slaTotalEl.innerText = formatear(totalTime);
    
    mostrarFechaAfectacion();
  } else {
    if (tiempoProgresoEl) tiempoProgresoEl.innerText = '00:00:00';
    if (tiempoSuspendidoEl) tiempoSuspendidoEl.innerText = '00:00:00';
    if (tiempoTotalEl) tiempoTotalEl.innerText = '00:00:00';
    if (slaProgresoEl) slaProgresoEl.innerText = '00:00:00';
    if (slaSuspendidoEl) slaSuspendidoEl.innerText = '00:00:00';
    if (slaTotalEl) slaTotalEl.innerText = '00:00:00';
    
    if (fechaAfectacionMostradaEl) {
      fechaAfectacionMostradaEl.textContent = 'Sin fecha de afectación definida';
      fechaAfectacionMostradaEl.className = 'time-detail text-muted';
    }
  }
  
  if (avancesArray.length > 0) {
    const ultimoAvance = avancesArray[avancesArray.length - 1];
    const elapsedSinceUpdate = ahora - ultimoAvance.timestamp;
    
    if (tiempoUltimoAvanceEl) tiempoUltimoAvanceEl.innerText = formatear(elapsedSinceUpdate < 0 ? 0 : elapsedSinceUpdate);
    if (fechaUltimoAvanceEl) {
      fechaUltimoAvanceEl.innerText = ultimoAvance.timestamp.toLocaleString('es-EC', {
        timeZone: 'America/Guayaquil', year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
      });
      fechaUltimoAvanceEl.className = 'small fw-medium text-primary';
    }
  } else {
    if (tiempoUltimoAvanceEl) tiempoUltimoAvanceEl.innerText = '--:--:--';
    if (fechaUltimoAvanceEl) {
      fechaUltimoAvanceEl.innerText = 'Sin avances registrados';
      fechaUltimoAvanceEl.className = 'small text-muted';
    }
  }
}

setInterval(actualizarCronometro, 1000);

function actualizarSuspensionUI() {
  if (suspensionIndicatorEl) {
    suspensionIndicatorEl.style.display = ticketSuspendido ? 'inline-flex' : 'none';
  }
  
  if (suspendBtnEl) {
    if (ticketSuspendido) {
      suspendBtnEl.innerHTML = '▶️ Reanudar Ticket';
      suspendBtnEl.classList.remove('btn-outline-warning');
      suspendBtnEl.classList.add('btn-outline-success');
    } else {
      suspendBtnEl.innerHTML = '⏸️ Suspender Ticket';
      suspendBtnEl.classList.remove('btn-outline-success');
      suspendBtnEl.classList.add('btn-outline-warning');
    }
  }
  
  if (resueltoIndicatorEl) {
    resueltoIndicatorEl.style.display = ticketResuelto ? 'inline-flex' : 'none';
  }
}

function mostrarToast(mensaje, tipo = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    container.style.zIndex = '1100';
    document.body.appendChild(container);
  }
  
  // Limpiar toasts anteriores del mismo tipo
  const existingToasts = container.querySelectorAll(`.toast-${tipo}`);
  existingToasts.forEach(toast => {
    toast.classList.remove('show');
    setTimeout(() => toast.parentNode?.removeChild(toast), 300);
  });
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo} show`;
  toast.style.cssText = 'margin-bottom:10px;border:none;border-radius:12px;box-shadow:0 4px 25px rgba(0,0,0,0.35);';
  
  const icono = tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-octagon-fill';
  const titulo = tipo === 'success' ? 'Éxito' : 'Error';
  
  toast.innerHTML = `
    <div class="toast-header" style="border-bottom:none;padding:12px 15px;color:white;font-weight:500;">
      <strong class="me-auto"><i class="bi ${icono} me-2"></i>${titulo}</strong>
      <button type="button" class="btn-close btn-close-white" onclick="this.closest('.toast').remove()"></button>
    </div>
    <div class="toast-body" style="padding:15px;font-weight:500;color:white;">${mensaje}</div>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.parentNode?.removeChild(toast), 300);
  }, 5000);
}

function calculateActiveAndSuspendedTime(incidentTime, avances, currentTime) {
  if (!incidentTime || isNaN(incidentTime.getTime()) || currentTime < incidentTime) {
    return { activeTime: 0, suspendedTime: 0, totalTime: 0 };
  }
  
  const totalTime = currentTime - incidentTime;
  
  const events = avances
    .filter(av => (av.tipo === 'suspension' || av.tipo === 'reanudacion') && av.timestamp >= incidentTime && av.timestamp <= currentTime)
    .map(av => ({ time: av.timestamp, type: av.tipo }))
    .sort((a, b) => a.time - b.time);
  
  let activeTime = 0;
  let suspendedTime = 0;
  let currentState = 'active';
  let lastTime = incidentTime;
  
  for (const event of events) {
    const duration = event.time - lastTime;
    if (duration > 0) {
      if (currentState === 'active') activeTime += duration;
      else suspendedTime += duration;
    }
    currentState = (event.type === 'suspension') ? 'suspended' : 'active';
    lastTime = event.time;
  }
  
  const finalDuration = currentTime - lastTime;
  if (finalDuration > 0) {
    if (currentState === 'active') activeTime += finalDuration;
    else suspendedTime += finalDuration;
  }
  
  return {
    activeTime: Math.max(0, Math.round(activeTime)),
    suspendedTime: Math.max(0, Math.round(suspendedTime)),
    totalTime: Math.round(totalTime)
  };
}

// ============================================
// ✅ GUARDAR TICKET (MODIFICADO PARA FIREBASE)
// ============================================

function guardarTicket() {
  const ticketIdEl = document.getElementById('ticketId');
  if (!ticketIdEl?.value.trim()) {
    mostrarToast('Ingrese ID de ticket para guardar', 'error');
    ticketIdEl?.focus();
    ticketIdEl?.classList.add('is-invalid');
    setTimeout(() => ticketIdEl?.classList.remove('is-invalid'), 2000);
    return;
  }
  
  const getVal = (id) => document.getElementById(id)?.value || '';
  
  const avancesParaGuardar = avancesArray.map(avance => ({
    timestamp: avance.timestamp.toISOString(),
    texto: avance.texto,
    tipo: avance.tipo,
    editado: avance.editado
  }));
  
  const ticket = {
    id: ticketActivoId || Date.now().toString(),
    workflowState: estadoActual,
    isSuspended: ticketSuspendido,
    isResolved: ticketResuelto,
    resolutionDate: ticketResuelto ? fechaResolucion?.toISOString() : null,
    noEtr: document.getElementById('noEtrCheck')?.checked || false,
    ticketId: getVal('ticketId'),
    fechaAfectacion: getVal('fechaAfectacion'),
    tramo: getVal('tramo'),
    hostname: getVal('hostname'),
    puertos: getVal('puertos'),
    redAfectada: getVal('redAfectada'),
    onnet: getVal('onnet'),
    offnet: getVal('offnet'),
    pais: getVal('pais'),
    ticketSecundarios: getVal('ticketSecundarios'),
    impacto: getVal('impacto'),
    capacidadAfectada: getVal('capacidadAfectada'),
    diagnostico: getVal('diagnostico'),
    etrHoras: getVal('etrHoras'),
    etrMinutos: getVal('etrMinutos'),
    accionesAdicionales: getVal('accionesAdicionales'),
    avancesArray: avancesParaGuardar,
    estado: ticketResuelto ? "resuelto" : (ticketSuspendido ? "suspendido" : "activo")
  };
  
  // Guardar en Firebase si hay usuario
  if (usuarioActual) {
    guardarTicketEnFirebase(ticket).then(firebaseId => {
      if (firebaseId) ticketActivoId = firebaseId;
    });
  }
  
  // Backup en localStorage (siempre)
  let tks = JSON.parse(localStorage.getItem('tickets')) || [];
  tks = tks.filter(t => t.id !== ticket.id);
  tks.push(ticket);
  localStorage.setItem('tickets', JSON.stringify(tks));
  
  ticketActivoId = ticket.id;
  localStorage.setItem('ultimoTicketActivo', ticketActivoId);
  
  cargarListaTickets();
  hayNuevosAvances = false;
  if (nuevosAvancesBadgeEl) nuevosAvancesBadgeEl.style.display = 'none';
  
  mostrarToast(`Ticket ${getVal('ticketId')} guardado exitosamente`, 'success');
  
  ticketIdEl?.classList.add('is-valid');
  setTimeout(() => ticketIdEl?.classList.remove('is-valid'), 2000);
}

function cargarListaTickets() {
  const listaTicketsEl = document.getElementById('listaTickets');
  if (!listaTicketsEl) return;
  
  // Si hay usuario, Firebase se encarga (escucharTicketsEnTiempoReal)
  if (usuarioActual) return;
  
  listaTicketsEl.innerHTML = '';
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  
  if (tickets.length === 0) {
    listaTicketsEl.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-inbox"></i>
        <p>No hay tickets activos. Crea uno nuevo para comenzar a gestionar incidencias.</p>
        <button class="btn btn-primary mt-3" onclick="nuevoTicket()">
          <i class="bi bi-plus-circle"></i> Crear primer ticket
        </button>
      </div>`;
    return;
  }
  
  tickets.forEach(t => {
    const d = document.createElement('div');
    let estadoClass = 'ticket-activo';
    if (t.isResolved) estadoClass = 'ticket-resuelto';
    else if (t.isSuspended) estadoClass = 'ticket-suspendido';
    
    d.className = `ticket-block ${estadoClass}`;
    d.innerHTML = `${t.ticketId || 'Sin ID'} ${t.isResolved ? '<span class="resuelto-badge"><i class="bi bi-check"></i></span>' : ''} ${t.isSuspended ? '<span class="suspended-badge"><i class="bi bi-pause"></i></span>' : ''}`;
    d.style.cursor = 'pointer';
    d.onclick = () => cargarTicket(t.id);
    listaTicketsEl.appendChild(d);
  });
}

function cargarTicket(id) {
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const t = tickets.find(x => x.id === id);
  if (!t) return;
  
  cargarTicketDesdeFirebase(id, t);
}

function nuevoTicket() {
  ticketActivoId = null;
  estadoActual = 0;
  ticketSuspendido = false;
  ticketResuelto = false;
  fechaResolucion = null;
  avancesArray = [];
  hayNuevosAvances = false;
  
  const camposReset = [
    'ticketId', 'tramo', 'hostname', 'puertos', 'redAfectada', 'onnet', 'offnet', 'pais',
    'ticketSecundarios', 'impacto', 'capacidadAfectada', 'diagnostico', 'accionesAdicionales', 'avanceInput',
    'suspensionManual', 'reanudacionManual', 'motivoSuspension', 'motivoReanudacion', 'fechaAvanceManual'
  ];
  
  camposReset.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.value = '';
      el.classList.remove('is-invalid', 'is-valid', 'input-format-error');
    }
  });
  
  const etrHoras = document.getElementById('etrHoras');
  const etrMinutos = document.getElementById('etrMinutos');
  if (etrHoras) etrHoras.value = '0';
  if (etrMinutos) etrMinutos.value = '0';
  
  const fechaAfectEl = document.getElementById('fechaAfectacion');
  if (fechaAfectEl && fechaAfectEl.value.trim()) validarFormatoFecha('fechaAfectacion');
  
  const suspensionManual = document.getElementById('suspensionManual');
  const reanudacionManual = document.getElementById('reanudacionManual');
  const motivoSuspension = document.getElementById('motivoSuspension');
  const motivoReanudacion = document.getElementById('motivoReanudacion');
  const usarFechaManual = document.getElementById('usarFechaManual');
  const fechaAvanceManual = document.getElementById('fechaAvanceManual');
  const noEtrCheck = document.getElementById('noEtrCheck');
  const etrInputs = document.getElementById('etrInputs');
  
  if (suspensionManual) suspensionManual.value = '';
  if (reanudacionManual) reanudacionManual.value = '';
  if (motivoSuspension) motivoSuspension.value = '';
  if (motivoReanudacion) motivoReanudacion.value = '';
  if (usarFechaManual) usarFechaManual.checked = false;
  if (fechaAvanceManual) {
    fechaAvanceManual.disabled = true;
    fechaAvanceManual.value = '';
  }
  if (noEtrCheck) noEtrCheck.checked = false;
  if (etrInputs) etrInputs.style.display = 'block';
  
  renderizarAvances();
  
  if (tiempoProgresoEl) tiempoProgresoEl.innerText = '00:00:00';
  if (tiempoSuspendidoEl) tiempoSuspendidoEl.innerText = '00:00:00';
  if (tiempoTotalEl) tiempoTotalEl.innerText = '00:00:00';
  if (slaProgresoEl) slaProgresoEl.innerText = '00:00:00';
  if (slaSuspendidoEl) slaSuspendidoEl.innerText = '00:00:00';
  if (slaTotalEl) slaTotalEl.innerText = '00:00:00';
  if (tiempoUltimoAvanceEl) tiempoUltimoAvanceEl.innerText = '--:--:--';
  if (fechaUltimoAvanceEl) {
    fechaUltimoAvanceEl.innerText = 'Sin avances registrados';
    fechaUltimoAvanceEl.className = 'small text-muted';
  }
  if (fechaAfectacionMostradaEl) {
    fechaAfectacionMostradaEl.textContent = 'Sin fecha de afectación definida';
    fechaAfectacionMostradaEl.className = 'time-detail text-muted';
  }
  
  const plantillaEl = document.getElementById('plantillaSeguimiento');
  if (plantillaEl) plantillaEl.innerText = 'Complete los campos del ticket para generar la plantilla de seguimiento...';
  
  actualizarSuspensionUI();
  actualizarCronometro();
  
  if (resolveBtnEl) {
    resolveBtnEl.innerHTML = '🔧 Marcar como resuelto';
    resolveBtnEl.classList.replace('btn-success', 'btn-outline-success');
    resolveBtnEl.disabled = false;
  }
  if (reopenBtnEl) reopenBtnEl.style.display = 'none';
  if (resueltoIndicatorEl) resueltoIndicatorEl.style.display = 'none';
  
  localStorage.removeItem('ultimoTicketActivo');
  
  const ticketIdInput = document.getElementById('ticketId');
  ticketIdInput?.focus();
}

function eliminarTicket() {
  if (!ticketActivoId) {
    mostrarToast('No hay ticket seleccionado para eliminar', 'error');
    return;
  }
  
  const ticketIdEl = document.getElementById('ticketId');
  if (!confirm(`¿Eliminar permanentemente el ticket ${ticketIdEl?.value}? Esta acción no se puede deshacer.`)) return;
  
  let tks = JSON.parse(localStorage.getItem('tickets')) || [];
  tks = tks.filter(t => t.id !== ticketActivoId);
  localStorage.setItem('tickets', JSON.stringify(tks));
  
  nuevoTicket();
  cargarListaTickets();
  
  mostrarToast(`Ticket ${ticketIdEl?.value} eliminado correctamente`, 'success');
}

function toggleEstado() {
  if (ticketResuelto) {
    mostrarToast('No se puede modificar el estado de un ticket ya resuelto', 'warning');
    return;
  }
  
  if (!ticketActivoId) {
    mostrarToast('Seleccione un ticket primero para suspender/reanudar', 'error');
    nuevoTicket();
    return;
  }
  
  const estadoAnterior = ticketSuspendido;
  ticketSuspendido = !ticketSuspendido;
  
  const mensaje = ticketSuspendido ? "Ticket suspendido" : "Ticket reanudado";
  const tipoAvance = ticketSuspendido ? 'suspension' : 'reanudacion';
  
  if (!ticketSuspendido && estadoActual < 2) estadoActual = 2;
  
  const nuevoAvance = { timestamp: new Date(), texto: mensaje, tipo: tipoAvance };
  avancesArray.push(nuevoAvance);
  avancesArray.sort((a, b) => a.timestamp - b.timestamp);
  
  renderizarAvances();
  hayNuevosAvances = true;
  
  // Actualizar localStorage
  let tks = JSON.parse(localStorage.getItem('tickets')) || [];
  const t = tks.find(x => x.id === ticketActivoId);
  if (t) {
    const avancesParaGuardar = avancesArray.map(avance => ({
      timestamp: avance.timestamp.toISOString(),
      texto: avance.texto,
      tipo: avance.tipo,
      editado: avance.editado
    }));
    t.isSuspended = ticketSuspendido;
    t.workflowState = estadoActual;
    t.avancesArray = avancesParaGuardar;
    localStorage.setItem('tickets', JSON.stringify(tks));
  }
  
  actualizarSuspensionUI();
  actualizarPlantilla();
  actualizarCronometro();
  cargarListaTickets();
  
  if (!ticketSuspendido) {
    mostrarToast(`Ticket reanudado exitosamente. Los cronómetros continúan contando el tiempo en progreso.`, 'success');
  } else {
    mostrarToast(`Ticket suspendido correctamente. El tiempo suspendido no cuenta para el SLA.`, 'success');
  }
}

function resolverTicket() {
  if (!ticketActivoId) {
    mostrarToast('Seleccione un ticket primero para resolver', 'error');
    return;
  }
  if (ticketResuelto) {
    mostrarToast('Este ticket ya está marcado como resuelto', 'warning');
    return;
  }
  
  const fechaAfectacion = obtenerFechaAfectacion();
  if (!fechaAfectacion) {
    mostrarToast('Debe definir la "Fecha y hora de afectación" antes de resolver el ticket', 'error');
    document.getElementById('fechaAfectacion')?.focus();
    return;
  }
  
  abrirModalResolucion();
}

function abrirModalResolucion() {
  insertarFechaActual('resolutionDateTime');
  const modal = document.getElementById('resolutionModal');
  if (modal) modal.style.display = 'flex';
  const errorEl = document.getElementById('resolutionError');
  if (errorEl) errorEl.style.display = 'none';
}

function cerrarModalResolucion() {
  const modal = document.getElementById('resolutionModal');
  if (modal) modal.style.display = 'none';
  const resolutionInput = document.getElementById('resolutionDateTime');
  if (resolutionInput) resolutionInput.value = '';
  const errorEl = document.getElementById('resolutionError');
  if (errorEl) errorEl.style.display = 'none';
}

function confirmarResolucion() {
  const resolutionInput = document.getElementById('resolutionDateTime');
  const resolutionValue = resolutionInput?.value.trim();
  const errorEl = document.getElementById('resolutionError');
  const errorMsgEl = document.getElementById('resolutionErrorMessage');
  
  if (!resolutionValue) {
    if (errorMsgEl) errorMsgEl.textContent = 'Debe ingresar la fecha y hora de resolución';
    if (errorEl) errorEl.style.display = 'block';
    resolutionInput?.focus();
    return;
  }
  
  if (!validarFormatoFechaManual(resolutionValue)) {
    if (errorMsgEl) errorMsgEl.textContent = 'Formato inválido. Use: AAAA-MM-DD HH:mm (ej: 2026-02-03 14:30)';
    if (errorEl) errorEl.style.display = 'block';
    return;
  }
  
  const [datePart, timePart] = resolutionValue.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  const fechaUTC = Date.UTC(year, month - 1, day, hours + 5, minutes);
  const fechaResolucionPropuesta = new Date(fechaUTC);
  
  if (isNaN(fechaResolucionPropuesta.getTime())) {
    if (errorMsgEl) errorMsgEl.textContent = 'Fecha inválida para la resolución';
    if (errorEl) errorEl.style.display = 'block';
    return;
  }
  
  const fechaAfectacion = obtenerFechaAfectacion();
  if (!fechaAfectacion) {
    if (errorMsgEl) errorMsgEl.textContent = 'Error: Fecha de afectación no definida';
    if (errorEl) errorEl.style.display = 'block';
    return;
  }
  
  if (fechaResolucionPropuesta < fechaAfectacion) {
    if (errorMsgEl) errorMsgEl.textContent = 'La fecha de resolución no puede ser anterior a la fecha de afectación';
    if (errorEl) errorEl.style.display = 'block';
    return;
  }
  
  const ahoraGMT5 = new Date(new Date().getTime() - (5 * 60 * 60 * 1000));
  if (fechaResolucionPropuesta > ahoraGMT5) {
    if (!confirm('La fecha de resolución está en el futuro. ¿Desea continuar?')) return;
  }
  
  cerrarModalResolucion();
  aplicarResolucion(fechaResolucionPropuesta, resolutionValue);
}

function aplicarResolucion(fechaResolucionPropuesta, fechaTextoOriginal) {
  ticketResuelto = true;
  fechaResolucion = fechaResolucionPropuesta;
  
  const fechaResolucionGMT5 = fechaResolucionPropuesta.toLocaleString('es-EC', {
    timeZone: 'America/Guayaquil', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
  
  const textoResolucion = `✅ TICKET RESUELTO - ${fechaResolucionGMT5} (GMT-5)`;
  
  avancesArray.push({ timestamp: fechaResolucionPropuesta, texto: textoResolucion, tipo: 'resuelto' });
  avancesArray.sort((a, b) => a.timestamp - b.timestamp);
  
  renderizarAvances();
  actualizarPlantilla();
  actualizarCronometro();
  guardarTicket();
  
  // Deshabilitar inputs
  ['#avanceInput', '#suspensionManual', '#reanudacionManual', '#fechaAvanceManual', '#usarFechaManual', '#motivoSuspension', '#motivoReanudacion'].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) el.disabled = true;
  });
  
  document.querySelectorAll('.add-avance-btn, .manual-state-btn').forEach(el => {
    el.disabled = true;
    el.classList.add('disabled');
  });
  
  if (resolveBtnEl) {
    resolveBtnEl.innerHTML = '✓ Resuelto';
    resolveBtnEl.classList.replace('btn-outline-success', 'btn-success');
    resolveBtnEl.disabled = true;
  }
  if (reopenBtnEl) reopenBtnEl.style.display = 'inline-block';
  if (suspendBtnEl) suspendBtnEl.disabled = true;
  if (resueltoIndicatorEl) resueltoIndicatorEl.style.display = 'inline-flex';
  
  const tiempoProgresoFinal = slaProgresoEl?.innerText || '00:00:00';
  mostrarToast(`¡Ticket resuelto! Tiempo final en progreso: ${tiempoProgresoFinal}<br>Fecha de resolución: ${fechaResolucionGMT5}`, 'success');
}

function reabrirTicket() {
  if (!ticketActivoId) {
    mostrarToast('Seleccione un ticket primero para reabrir', 'error');
    return;
  }
  if (!ticketResuelto) {
    mostrarToast('Este ticket no está resuelto', 'warning');
    return;
  }
  
  const ticketIdInput = document.getElementById('ticketId');
  if (!confirm(`¿Reabrir el ticket "${ticketIdInput?.value}"? Los cronómetros se reanudarán desde el momento actual.`)) return;
  
  ticketResuelto = false;
  fechaResolucion = null;
  
  const ahora = new Date();
  avancesArray.push({
    timestamp: ahora,
    texto: `🔄 TICKET REABIERTO - ${ahora.toLocaleString('es-EC', { timeZone: 'America/Guayaquil', hour12: false })}`,
    tipo: 'sistema'
  });
  avancesArray.sort((a, b) => a.timestamp - b.timestamp);
  
  // Habilitar inputs
  ['#avanceInput', '#suspensionManual', '#reanudacionManual', '#fechaAvanceManual', '#usarFechaManual', '#motivoSuspension', '#motivoReanudacion'].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) el.disabled = false;
  });
  
  document.querySelectorAll('.add-avance-btn, .manual-state-btn').forEach(el => {
    el.disabled = false;
    el.classList.remove('disabled');
  });
  
  if (resolveBtnEl) {
    resolveBtnEl.innerHTML = '🔧 Marcar como resuelto';
    resolveBtnEl.classList.replace('btn-success', 'btn-outline-success');
    resolveBtnEl.disabled = false;
  }
  if (reopenBtnEl) reopenBtnEl.style.display = 'none';
  if (suspendBtnEl) suspendBtnEl.disabled = false;
  if (resueltoIndicatorEl) resueltoIndicatorEl.style.display = 'none';
  
  renderizarAvances();
  actualizarPlantilla();
  actualizarCronometro();
  guardarTicket();
  
  mostrarToast(`Ticket reabierto exitosamente. Los cronómetros se han reanudado.`, 'success');
}

function exportarTickets() {
  try {
    // Guardar ticket actual si hay cambios
    if (ticketActivoId && hayNuevosAvances) {
      guardarTicket();
    }
    
    let tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    if (tickets.length === 0) {
      mostrarToast('No hay tickets para exportar', 'error');
      return;
    }
    
    if (confirm("¿Exportar TODOS los tickets?\n✅ ACEPTAR = Todos\n❌ CANCELAR = Seleccionar")) {
      const fechaActual = new Date().toISOString().slice(0, 10);
      const nombreArchivo = `tickets_${tickets.length}_${fechaActual}.json`;
      const dataStr = JSON.stringify(tickets, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 0);
      mostrarToast(`✅ Exportados ${tickets.length} tickets<br>📁 ${nombreArchivo}`, 'success');
    } else {
      let selected = [];
      for (let t of tickets) {
        const id = t.ticketId || `Ticket ${t.id}`;
        const estado = t.isResolved ? '✓ Resuelto' : (t.isSuspended ? '⏸️ Suspendido' : 'Activo');
        if (confirm(`¿Incluir ${id} (${estado})?`)) selected.push(t);
      }
      if (selected.length === 0) {
        mostrarToast('⚠️ Ningún ticket seleccionado', 'warning');
        return;
      }
      const fechaActual = new Date().toISOString().slice(0, 10);
      const nombreArchivo = `tickets_sel_${selected.length}_${fechaActual}.json`;
      const dataStr = JSON.stringify(selected, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 0);
      mostrarToast(`✅ Exportados ${selected.length} tickets<br>📁 ${nombreArchivo}`, 'success');
    }
  } catch (error) {
    console.error('Error exportar:', error);
    mostrarToast(`❌ Error: ${error.message}`, 'error');
  }
}

function importarTickets() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.json')) {
      mostrarToast('❌ Archivo debe ser .json', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const imported = JSON.parse(event.target.result);
        if (!Array.isArray(imported) || imported.length === 0) throw new Error('Archivo inválido');
        
        const existing = JSON.parse(localStorage.getItem('tickets') || '[]');
        
        if (existing.length === 0) {
          localStorage.setItem('tickets', JSON.stringify(imported));
          cargarListaTickets();
          nuevoTicket();
          mostrarToast(`✅ Cargados ${imported.length} tickets`, 'success');
        } else {
          if (confirm(`⚠️ Ya tienes ${existing.length} tickets.\n✅ ACEPTAR = Reemplazar TODOS\n❌ CANCELAR = Solo agregar NUEVOS`)) {
            localStorage.setItem('tickets', JSON.stringify(imported));
            cargarListaTickets();
            nuevoTicket();
            mostrarToast(`✅ Reemplazados por ${imported.length} tickets`, 'success');
          } else {
            const nuevos = imported.filter(nuevo => !existing.some(exist => exist.id === nuevo.id));
            if (nuevos.length === 0) {
              mostrarToast('⚠️ Todos los tickets ya existen', 'warning');
              return;
            }
            const combinados = [...existing, ...nuevos];
            localStorage.setItem('tickets', JSON.stringify(combinados));
            cargarListaTickets();
            nuevoTicket();
            mostrarToast(`✅ Agregados ${nuevos.length} tickets nuevos<br>Total: ${combinados.length}`, 'success');
          }
        }
      } catch (err) {
        console.error('Error importar:', err);
        mostrarToast(`❌ Error: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
  };
  
  input.click();
}

function generarCronologiaTXT() {
  const fechaAfectacion = obtenerFechaAfectacion();
  if (!fechaAfectacion) {
    mostrarToast('Debe definir la "Fecha y hora de afectación" para generar la cronología', 'error');
    document.getElementById('fechaAfectacion')?.focus();
    return;
  }
  
  const ticketIdEl = document.getElementById('ticketId');
  if (!ticketIdEl?.value.trim()) {
    mostrarToast('Debe ingresar el ID del ticket para generar la cronología', 'error');
    ticketIdEl?.focus();
    return;
  }
  
  const ahora = ticketResuelto ? fechaResolucion : new Date();
  const { activeTime, suspendedTime, totalTime } = calculateActiveAndSuspendedTime(fechaAfectacion, avancesArray, ahora);
  
  const fechaAfectacionStr = fechaAfectacion.toLocaleString('es-EC', {
    timeZone: 'America/Guayaquil', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
  
  const fechaGeneracion = ahora.toLocaleString('es-EC', {
    timeZone: 'America/Guayaquil', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  
  let historialFormateado = '';
  if (avancesArray.length === 0) {
    historialFormateado = '  Sin avances registrados\n';
  } else {
    historialFormateado = avancesArray.map((avance, index) => {
      const fechaStr = avance.timestamp.toLocaleString('es-EC', {
        timeZone: 'America/Guayaquil', year: '2-digit', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
      });
      let icono = '•';
      if (avance.tipo === 'suspension') icono = '⏸️';
      else if (avance.tipo === 'reanudacion') icono = '▶️';
      else if (avance.tipo === 'resuelto') icono = '✅';
      const indicadorEdicion = avance.editado ? ' ✏️' : '';
      return `${index + 1}. ${icono} [${fechaStr}] ${avance.texto}${indicadorEdicion}`;
    }).join('\n');
  }
  
  const contenido = `╔══════════════════════════════════════════════════════════════════════════════╗
║ CRONOLOGÍA DETALLADA DEL TICKET - INFORME SLA COMPLETO ║
╚══════════════════════════════════════════════════════════════════════════════╝

ID Ticket: ${ticketIdEl.value}
Tramo afectado: ${document.getElementById('tramo')?.value || 'No especificado'}
Hostname: ${document.getElementById('hostname')?.value || 'No especificado'}
Puertos: ${document.getElementById('puertos')?.value || 'No especificados'}
Fecha afectación: ${fechaAfectacionStr} (GMT-5)
Estado actual: ${ticketResuelto ? 'RESUELTO' : (ticketSuspendido ? 'SUSPENDIDO' : 'EN PROGRESO')}
${ticketResuelto ? `Fecha resolución: ${fechaResolucion?.toLocaleString('es-EC', {timeZone: 'America/Guayaquil', hour12: false})} (GMT-5)` : ''}

┌──────────────────────────────────────────────────────────────────────────────┐
│ TIEMPOS SLA CALCULADOS DESDE LA FECHA DE AFECTACIÓN │
├──────────────────────────────────────────────────────────────────────────────┤
│ Tiempo total transcurrido: ${formatear(totalTime)} │
│ Tiempo en progreso: ${formatear(activeTime)} │
│ Tiempo suspendido: ${formatear(suspendedTime)} │
│ ${ticketResuelto ? '* Ticket resuelto - tiempos congelados' : ''} │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ HISTORIAL DE AVANCES (orden cronológico) │
├──────────────────────────────────────────────────────────────────────────────┤
${historialFormateado || 'Sin avances registrados'}
└──────────────────────────────────────────────────────────────────────────────┘

Generado el: ${fechaGeneracion} (GMT-5)
Sistema de gestión de incidencias v2.9

╔══════════════════════════════════════════════════════════════════════════════╗
║ Nota SLA: Los tiempos se calculan exclusivamente desde la fecha de ║
║ afectación considerando todos los eventos de suspensión y reanudación. ║
║ El tiempo suspendido se excluye del cómputo para el cumplimiento del SLA. ║
║ ${ticketResuelto ? 'Ticket resuelto - tiempos finales congelados en la fecha de resolución.' : ''} ║
╚══════════════════════════════════════════════════════════════════════════════╝`;

  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cronologia_ticket_${ticketIdEl.value.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.txt`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
  
  mostrarToast(`Cronología generada exitosamente:<br>${a.download}`, 'success');
}

function copiarCronologia() {
  const fechaAfectacion = obtenerFechaAfectacion();
  if (!fechaAfectacion) {
    mostrarToast('Debe definir la "Fecha y hora de afectación" para generar la cronología', 'error');
    document.getElementById('fechaAfectacion')?.focus();
    return;
  }
  
  const ticketIdEl = document.getElementById('ticketId');
  if (!ticketIdEl?.value.trim()) {
    mostrarToast('Debe ingresar el ID del ticket para generar la cronología', 'error');
    ticketIdEl?.focus();
    return;
  }
  
  const ahora = ticketResuelto ? fechaResolucion : new Date();
  const { activeTime, suspendedTime, totalTime } = calculateActiveAndSuspendedTime(fechaAfectacion, avancesArray, ahora);
  
  const fechaAfectacionStr = fechaAfectacion.toLocaleString('es-EC', {
    timeZone: 'America/Guayaquil', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
  
  const fechaGeneracion = ahora.toLocaleString('es-EC', {
    timeZone: 'America/Guayaquil', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  
  let historialFormateado = '';
  if (avancesArray.length === 0) {
    historialFormateado = '  Sin avances registrados\n';
  } else {
    historialFormateado = avancesArray.map((avance, index) => {
      const fechaStr = avance.timestamp.toLocaleString('es-EC', {
        timeZone: 'America/Guayaquil', year: '2-digit', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
      });
      let icono = '•';
      if (avance.tipo === 'suspension') icono = '⏸️';
      else if (avance.tipo === 'reanudacion') icono = '▶️';
      else if (avance.tipo === 'resuelto') icono = '✅';
      const indicadorEdicion = avance.editado ? ' ✏️' : '';
      return `${index + 1}. ${icono} [${fechaStr}] ${avance.texto}${indicadorEdicion}`;
    }).join('\n');
  }
  
  const contenidoCronologia = `CRONOLOGÍA DETALLADA DEL TICKET - INFORME SLA COMPLETO
═══════════════════════════════════════════════════════════════════════════════

ID Ticket: ${ticketIdEl.value}
Tramo afectado: ${document.getElementById('tramo')?.value || 'No especificado'}
Hostname: ${document.getElementById('hostname')?.value || 'No especificado'}
Puertos: ${document.getElementById('puertos')?.value || 'No especificados'}
Fecha afectación: ${fechaAfectacionStr} (GMT-5)
Estado actual: ${ticketResuelto ? 'RESUELTO' : (ticketSuspendido ? 'SUSPENDIDO' : 'EN PROGRESO')}
${ticketResuelto ? `Fecha resolución: ${fechaResolucion?.toLocaleString('es-EC', {timeZone: 'America/Guayaquil', hour12: false})} (GMT-5)` : ''}

TIEMPOS SLA:
• Tiempo total transcurrido: ${formatear(totalTime)}
• Tiempo en progreso: ${formatear(activeTime)}
• Tiempo suspendido: ${formatear(suspendedTime)}
${ticketResuelto ? '⚠️ Ticket resuelto - tiempos congelados' : ''}

HISTORIAL DE AVANCES:
${historialFormateado || 'Sin avances registrados'}

Generado el: ${fechaGeneracion} (GMT-5)
Sistema de gestión de incidencias v2.9

Nota SLA: Los tiempos se calculan exclusivamente desde la fecha de afectación considerando todos los eventos de suspensión y reanudación. El tiempo suspendido se excluye del cómputo para el cumplimiento del SLA.
${ticketResuelto ? 'Ticket resuelto - tiempos finales en la fecha de resolución.' : ''}`;

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(contenidoCronologia).then(() => {
      mostrarToast('✅ Cronología con tiempos SLA copiada al portapapeles', 'success');
    }).catch(err => {
      console.error('Error al copiar:', err);
      mostrarToast('❌ Error al copiar. Seleccione manualmente el texto.', 'error');
    });
  } else {
    // Fallback para navegadores antiguos
    const textArea = document.createElement('textarea');
    textArea.value = contenidoCronologia;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    mostrarToast('✅ Cronología copiada al portapapeles', 'success');
  }
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  configurarTema();
  themeToggleBtn?.addEventListener('click', alternarTema);
  establecerFechaActualGMT5();
  
  // Cargar lista de tickets (localStorage si no hay usuario)
  cargarListaTickets();
  
  // Recordar último ticket editado
  const ultimoTicketId = localStorage.getItem('ultimoTicketActivo');
  if (ultimoTicketId && !usuarioActual) {
    const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    const existe = tickets.find(t => t.id == ultimoTicketId);
    if (existe) cargarTicket(ultimoTicketId);
  }
  
  // Escuchar tecla Enter en login
  const loginPassword = document.getElementById('loginPassword');
  if (loginPassword) {
    loginPassword.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') login();
    });
  }
});
// ============================================
// ✅ FUNCIONES DE LOGIN Y MENÚ (Agregar al final)
// ============================================

// Verificar autenticación al cargar
if (typeof window.auth !== 'undefined') {
    window.firebase?.onAuthStateChanged?.(window.auth, (user) => {
        if (!user && !window.location.href.includes('login.html')) {
            window.location.href = 'login.html';
        }
    });
}

// Función para cargar usuarios en el selector de reasignación
async function cargarUsuariosParaReasignar() {
    if (!window.usuarioActual) return;
    
    const select = document.getElementById('selectUsuario');
    if (!select) return;
    
    select.innerHTML = '<option>Cargando...</option>';
    
    try {
        const usersSnapshot = await window.firebase?.getDocs?.(
            window.firebase?.query?.(
                window.firebase?.collection(window.db, "tickets"),
                window.firebase?.where(window.db, "estado", "==", "activo")
            )
        );
        
        const usuarios = new Map();
        usersSnapshot?.forEach(doc => {
            const data = doc.data();
            if (data.creadoPorEmail) usuarios.set(data.creadoPor, data.creadoPorEmail);
            if (data.asignadoAEmail) usuarios.set(data.asignadoA, data.asignadoAEmail);
        });
        
        select.innerHTML = '<option value="">-- Seleccionar persona --</option>';
        usuarios.forEach((email, uid) => {
            if (uid !== window.usuarioActual?.uid) {
                const option = document.createElement('option');
                option.value = uid;
                option.textContent = email.split('@')[0];
                option.dataset.email = email;
                select.appendChild(option);
            }
        });
    } catch (error) {
        console.error("Error cargando usuarios:", error);
        select.innerHTML = '<option>Error al cargar</option>';
    }
}

// Función para reasignar ticket
async function reasignarTicket() {
    if (!ticketActivoId) {
        mostrarToast('Selecciona un ticket para reasignar', 'error');
        return;
    }
    
    const select = document.getElementById('selectUsuario');
    const nuevoUsuarioId = select?.value;
    const nuevoUsuarioEmail = select?.options[select.selectedIndex]?.dataset?.email;
    
    if (!nuevoUsuarioId || !nuevoUsuarioEmail) {
        mostrarToast('Selecciona una persona para reasignar', 'error');
        return;
    }
    
    if (!confirm(`¿Reasignar ticket a ${nuevoUsuarioEmail.split('@')[0]}?`)) return;
    
    try {
        const ticketRef = window.firebase?.doc(window.db, "tickets", ticketActivoId);
        await window.firebase?.updateDoc(ticketRef, {
            asignadoA: nuevoUsuarioId,
            asignadoAEmail: nuevoUsuarioEmail,
            fechaReasignacion: new Date(),
            reasignadoPor: window.usuarioActual?.uid
        });
        
        mostrarToast(`✅ Ticket reasignado a ${nuevoUsuarioEmail.split('@')[0]}`, 'success');
        cargarUsuariosParaReasignar();
    } catch (error) {
        mostrarToast(`❌ Error: ${error.message}`, 'error');
    }
}
