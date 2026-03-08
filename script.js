let ticketActivoId = null;
let ticketSuspendido = false;
let ticketResuelto = false;
let fechaResolucion = null;
let avancesArray = [];
let hayNuevosAvances = false;
let temaActual = localStorage.getItem('temaPreferido') || 'light';
let modalConfirmCallback = null;
// Variables para campos dinámicos Hostname/Puertos
let hostnamePuertoPairs = [];
let pairCounter = 0;
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
    document.getElementById(inputId).value = fechaFormateada;
    if (inputId === 'fechaAfectacion') {
        validarFormatoFecha('fechaAfectacion');
        actualizarCronometro();
    }
    mostrarToast(`Fecha y hora actual (GMT-5) insertada: ${fechaFormateada}`, 'success');
}

function validarFormatoFecha(inputId) {
    const input = document.getElementById(inputId);
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

function obtenerFechaAfectacion() {
    const fechaInput = document.getElementById('fechaAfectacion');
    if (!fechaInput.value.trim()) return null;
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

function toggleNoEtr() {
    const noEtrCheck = document.getElementById('noEtrCheck');
    const etrInputs = document.getElementById('etrInputs');
    const etrHoras = document.getElementById('etrHoras');
    const etrMinutos = document.getElementById('etrMinutos');
    if (noEtrCheck.checked) {
        etrInputs.style.display = 'none';
        etrHoras.value = '0';
        etrMinutos.value = '0';
    } else {
        etrInputs.style.display = 'block';
    }
    actualizarPlantilla();
}

// ============================================
// FUNCIONES PARA CAMPOS DINÁMICOS HOSTNAME/PUERTOS
// ============================================
function inicializarHostnamePuertos() {
    const container = document.getElementById('hostnamePuertosContainer');
    if (!container) return;
    if (hostnamePuertoPairs.length === 0) {
        agregarCampoHostnamePuerto();
    }
}

function agregarCampoHostnamePuerto() {
    pairCounter++;
    const pairId = `pair-${pairCounter}`;
    const pairData = { id: pairId, numero: pairCounter, hostname: '', puertos: '' };
    hostnamePuertoPairs.push(pairData);
    renderizarHostnamePuertos();
    actualizarPlantilla();
}

function renderizarHostnamePuertos() {
    const container = document.getElementById('hostnamePuertosContainer');
    if (!container) return;
    container.innerHTML = '';
    hostnamePuertoPairs.forEach((pair, index) => {
        const pairHTML = `<div class="hostname-puerto-pair" data-pair-id="${pair.id}"> <button type="button" class="btn-remove" onclick="eliminarCampoHostnamePuerto('${pair.id}')" title="Eliminar este equipo" ${hostnamePuertoPairs.length === 1 ? 'style="display:none;"' : ''}> <i class="bi bi-trash"></i> </button> <div class="hostname-puerto-label"> <span class="pair-number-badge">#${index + 1}</span> <span>Equipo afectado</span> </div> <div class="row g-2"> <div class="col-md-6"> <label class="form-label small">Hostname</label> <input type="text" class="form-control form-control-sm" id="hostname-${pair.id}" placeholder="Ej: RTR-CORE-01" value="${pair.hostname}" onchange="actualizarValorHostnamePuerto('${pair.id}', 'hostname', this.value)"> </div> <div class="col-md-6"> <label class="form-label small">Puertos</label> <input type="text" class="form-control form-control-sm" id="puertos-${pair.id}" placeholder="Ej: 1/0/1, 1/0/2" value="${pair.puertos}" onchange="actualizarValorHostnamePuerto('${pair.id}', 'puertos', this.value)"> </div> </div> </div>`;
        container.innerHTML += pairHTML;
    });
}

function eliminarCampoHostnamePuerto(pairId) {
    if (hostnamePuertoPairs.length <= 1) {
        mostrarToast('Debe mantener al menos un equipo registrado', 'warning');
        return;
    }
    hostnamePuertoPairs = hostnamePuertoPairs.filter(p => p.id !== pairId);
    hostnamePuertoPairs.forEach((pair, index) => { pair.numero = index + 1; });
    renderizarHostnamePuertos();
    actualizarPlantilla();
}

function actualizarValorHostnamePuerto(pairId, campo, valor) {
    const pair = hostnamePuertoPairs.find(p => p.id === pairId);
    if (pair) {
        pair[campo] = valor;
        actualizarPlantilla();
        hayNuevosAvances = true;
    }
}

function obtenerHostnamePuertosTexto() {
    if (hostnamePuertoPairs.length === 0) {
        return '   - No especificado';
    }
    let texto = '';
    hostnamePuertoPairs.forEach((pair, index) => {
        const hostname = pair.hostname.trim() || 'No especificado';
        const puertos = pair.puertos.trim() || 'No especificados';
        texto += `- Hostname ${index + 1}: ${hostname}\n`;
        texto += `Puertos: ${puertos}\n`;
        if (index < hostnamePuertoPairs.length - 1) { texto += `\n`; }
    });
    return texto;
}

function cargarHostnamePuertosGuardados(ticket) {
    if (ticket.hostnamePuertoPairs && Array.isArray(ticket.hostnamePuertoPairs)) {
        hostnamePuertoPairs = ticket.hostnamePuertoPairs;
        pairCounter = hostnamePuertoPairs.length;
    } else {
        const hostnameViejo = ticket.hostname || '';
        const puertosViejos = ticket.puertos || '';
        if (hostnameViejo || puertosViejos) {
            pairCounter = 1;
            hostnamePuertoPairs = [{ id: 'pair-1', numero: 1, hostname: hostnameViejo, puertos: puertosViejos }];
        } else {
            hostnamePuertoPairs = [];
            pairCounter = 0;
        }
    }
    renderizarHostnamePuertos();
}

function obtenerHostnamePuertosParaGuardar() {
    return hostnamePuertoPairs.map(pair => ({
        id: pair.id, numero: pair.numero, hostname: pair.hostname, puertos: pair.puertos
    }));
}
// ============================================
// FIN FUNCIONES HOSTNAME/PUERTOS
// ============================================

function agregarSuspensionManual() {
    if (ticketResuelto) {
        mostrarToast('No se pueden registrar suspensiones en un ticket resuelto', 'warning');
        return;
    }
    const input = document.getElementById('suspensionManual');
    const motivoInput = document.getElementById('motivoSuspension');
    const valor = input.value.trim();
    const motivo = motivoInput.value.trim();
    if (!valor) { mostrarToast('Ingrese fecha y hora para registrar la suspensión', 'error'); input.focus(); return; }
    if (!validarFormatoFecha('suspensionManual')) return;
    const [datePart, timePart] = valor.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    const fechaUTC = Date.UTC(year, month - 1, day, hours + 5, minutes);
    const fechaSuspension = new Date(fechaUTC);
    if (isNaN(fechaSuspension.getTime())) { mostrarToast('Fecha inválida para la suspensión', 'error'); return; }
    const fechaAfectacion = obtenerFechaAfectacion();
    if (fechaAfectacion && fechaSuspension < fechaAfectacion) {
        mostrarToast('La suspensión no puede ser anterior a la fecha de afectación', 'error');
        return;
    }
    ticketSuspendido = true;
    const textoCompleto = `Tiempo Seguimiento suspendido${motivo ? ` | Motivo: ${motivo} ` : ''}`;
    const avance = { timestamp: fechaSuspension, texto: textoCompleto, tipo: 'suspension' };
    avancesArray.push(avance);
    avancesArray.sort((a, b) => a.timestamp - b.timestamp);
    renderizarAvances();
    input.value = ''; motivoInput.value = ''; input.classList.remove('input-format-error');
    hayNuevosAvances = true;
    actualizarSuspensionUI(); actualizarPlantilla(); actualizarCronometro();
    guardarTicket(); actualizarDashboardStats();
    mostrarToast(`Suspensión registrada: ${fechaSuspension.toLocaleString('es-EC', { timeZone: 'America/Guayaquil', hour12: false })}`, 'success');
}

function agregarReanudacionManual() {
    if (ticketResuelto) {
        mostrarToast('No se pueden registrar reanudaciones en un ticket resuelto', 'warning');
        return;
    }
    const input = document.getElementById('reanudacionManual');
    const motivoInput = document.getElementById('motivoReanudacion');
    const valor = input.value.trim();
    const motivo = motivoInput.value.trim();
    if (!valor) { mostrarToast('Ingrese fecha y hora para registrar la reanudación', 'error'); input.focus(); return; }
    if (!validarFormatoFecha('reanudacionManual')) return;
    const [datePart, timePart] = valor.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    const fechaUTC = Date.UTC(year, month - 1, day, hours + 5, minutes);
    const fechaReanudacion = new Date(fechaUTC);
    if (isNaN(fechaReanudacion.getTime())) { mostrarToast('Fecha inválida para la reanudación', 'error'); return; }
    const fechaAfectacion = obtenerFechaAfectacion();
    if (fechaAfectacion && fechaReanudacion < fechaAfectacion) {
        mostrarToast('La reanudación no puede ser anterior a la fecha de afectación', 'error');
        return;
    }
    ticketSuspendido = false;
    if (estadoActual < 2) { estadoActual = 2; }
    const textoCompleto = `Tiempo Seguimiento reanudado${motivo ? ` | Motivo: ${motivo} ` : ''}`;
    const avance = { timestamp: fechaReanudacion, texto: textoCompleto, tipo: 'reanudacion' };
    avancesArray.push(avance);
    avancesArray.sort((a, b) => a.timestamp - b.timestamp);
    renderizarAvances();
    input.value = ''; motivoInput.value = ''; input.classList.remove('input-format-error');
    hayNuevosAvances = true;
    actualizarSuspensionUI(); actualizarPlantilla(); actualizarCronometro();
    guardarTicket(); actualizarDashboardStats();
    mostrarToast(`Reanudación registrada: ${fechaReanudacion.toLocaleString('es-EC', { timeZone: 'America/Guayaquil', hour12: false })}`, 'success');
}

function toggleFechaManualAvance() {
    const checkbox = document.getElementById('usarFechaManual');
    const input = document.getElementById('fechaAvanceManual');
    const btnCalendar = input.parentElement.querySelector('.btn-calendar');
    input.disabled = !checkbox.checked;
    btnCalendar.disabled = !checkbox.checked;
    if (checkbox.checked) { insertarFechaActual('fechaAvanceManual'); }
}

function agregarAvance() {
    if (ticketResuelto) { mostrarToast('No se pueden agregar avances a un ticket resuelto', 'warning'); return; }
    if (!avanceInputEl.value.trim()) { mostrarToast('Por favor ingrese un avance o comentario antes de agregar', 'error'); avanceInputEl.focus(); return; }
    let fechaAvance;
    const usarManual = document.getElementById('usarFechaManual').checked;
    if (usarManual) {
        const valorManual = document.getElementById('fechaAvanceManual').value.trim();
        if (!valorManual) { mostrarToast('Seleccione una fecha y hora para el avance manual', 'error'); return; }
        if (!validarFormatoFecha('fechaAvanceManual')) return;
        const [datePart, timePart] = valorManual.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);
        const fechaUTC = Date.UTC(year, month - 1, day, hours + 5, minutes);
        fechaAvance = new Date(fechaUTC);
        if (isNaN(fechaAvance.getTime())) { mostrarToast('Formato de fecha inválido para el avance', 'error'); return; }
        const fechaAfectacion = obtenerFechaAfectacion();
        if (fechaAfectacion && fechaAvance < fechaAfectacion) {
            mostrarToast('La fecha del avance no puede ser anterior a la fecha de afectación', 'error');
            return;
        }
        if (avancesArray.length > 0) {
            const ultimoAvance = avancesArray[avancesArray.length - 1];
            if (fechaAvance < ultimoAvance.timestamp) {
                if (!confirm('La fecha del avance es anterior al último avance registrado. ¿Desea continuar?')) { return; }
            }
        }
    } else {
        fechaAvance = new Date();
    }
    const nuevoAvance = { timestamp: fechaAvance, texto: avanceInputEl.value.trim(), tipo: 'normal' };
    avancesArray.push(nuevoAvance);
    avancesArray.sort((a, b) => a.timestamp - b.timestamp);
    renderizarAvances();
    avanceInputEl.value = '';
    document.getElementById('usarFechaManual').checked = false;
    document.getElementById('fechaAvanceManual').disabled = true;
    document.getElementById('fechaAvanceManual').value = '';
    hayNuevosAvances = true;
    if (estadoActual < 2 && !ticketSuspendido) { estadoActual = 2; }
    actualizarPlantilla();
    avanceInputEl.classList.add('is-valid');
    setTimeout(() => { avanceInputEl.classList.remove('is-valid'); }, 2000);
}

function renderizarAvances() {
    historialAvancesEl.innerHTML = '';
    if (avancesArray.length === 0) {
        historialAvancesEl.innerHTML = '<p class="text-muted text-center">No hay avances registrados aún</p>';
        return;
    }
    avancesArray.sort((a, b) => a.timestamp - b.timestamp);
    avancesArray.forEach((avance, index) => {
        const fechaFormateada = avance.timestamp.toLocaleString('es-EC', {
            timeZone: 'America/Guayaquil', year: '2-digit', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false
        });
        let claseCSS = ''; let remitente = 'Operador'; let esEditable = false;
        if (avance.tipo === 'suspension') { claseCSS = 'suspension sistema'; remitente = 'Sistema'; }
        else if (avance.tipo === 'reanudacion') { claseCSS = 'reanudacion sistema'; remitente = 'Sistema'; }
        else if (avance.tipo === 'resuelto') { claseCSS = 'sistema resuelto'; remitente = 'Sistema'; }
        else if (avance.tipo === 'sistema') { claseCSS = 'sistema'; remitente = 'Sistema'; }
        else { esEditable = true; }
        const tieneEdicion = avance.editado ?
            `<div class="avance-edited-indicator"><i class="bi bi-pencil-square"></i> Editado: ${new Date(avance.editado).toLocaleString('es-EC', { timeZone: 'America/Guayaquil', hour12: false, year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>`
            : '';
        const botonesAccion = (esEditable && !ticketResuelto) ?
            `<div class="avance-actions"><button class="btn-edit-avance" title="Editar avance" onclick="iniciarEdicionAvance(${index})"><i class="bi bi-pencil"></i></button><button class="btn-delete-avance" title="Eliminar avance" onclick="eliminarAvance(${index})"><i class="bi bi-trash"></i></button></div>`
            : '';
        const avanceHTML =
            `<div class="avance-entry ${claseCSS}" data-index="${index}"> <div class="avance-time"> <span>${fechaFormateada}</span> <span>${remitente}${avance.editado ? ' <i class="bi bi-pencil-square" style="font-size:0.7em;color:#ffc107"></i>' : ''}</span> </div> <div class="avance-texto">${avance.texto.replace(/\n/g, '<br>')}</div> ${tieneEdicion}${botonesAccion} </div>`;
        historialAvancesEl.innerHTML += avanceHTML;
    });
    historialAvancesEl.scrollTop = historialAvancesEl.scrollHeight;
    if (hayNuevosAvances) {
        nuevosAvancesBadgeEl.style.display = 'inline-block';
        nuevosAvancesBadgeEl.textContent = `${avancesArray.length} avances`;
    } else {
        nuevosAvancesBadgeEl.style.display = 'none';
    }
}

function iniciarEdicionAvance(index) {
    if (ticketResuelto) { mostrarToast('No se pueden editar avances en un ticket resuelto', 'warning'); return; }
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
    avanceEntry.innerHTML = `<div class="avance-time"><span>${fechaFormateada}</span><span>Operador <small>(editando)</small></span></div> <div class="avance-edit-mode"> <textarea id="editAvanceTextarea_${index}" class="form-control">${avance.texto}</textarea> <div class="d-flex justify-content-end mt-2 gap-2"> <button class="btn-save-edit" onclick="guardarEdicionAvance(${index})"><i class="bi bi-check-lg"></i> Guardar</button> <button class="btn-cancel-edit" onclick="cancelarEdicionAvance(${index})"><i class="bi bi-x-lg"></i> Cancelar</button> </div> </div>`;
    setTimeout(() => {
        const textarea = document.getElementById(`editAvanceTextarea_${index}`);
        if (textarea) { textarea.focus(); textarea.setSelectionRange(textarea.value.length, textarea.value.length); }
    }, 100);
}

function guardarEdicionAvance(index) {
    const textarea = document.getElementById(`editAvanceTextarea_${index}`);
    if (!textarea) return;
    const nuevoTexto = textarea.value.trim();
    if (!nuevoTexto) { mostrarToast('El avance no puede estar vacío', 'error'); return; }
    avancesArray[index] = { ...avancesArray[index], texto: nuevoTexto, editado: new Date().toISOString() };
    avancesArray.sort((a, b) => a.timestamp - b.timestamp);
    renderizarAvances(); actualizarPlantilla(); hayNuevosAvances = true;
    guardarTicket();
    mostrarToast('✅ Avance editado exitosamente', 'success');
}

function cancelarEdicionAvance(index) { renderizarAvances(); mostrarToast('Edición cancelada', 'info'); }

function eliminarAvance(index) {
    if (ticketResuelto) { mostrarToast('No se pueden eliminar avances en un ticket resuelto', 'warning'); return; }
    const avance = avancesArray[index];
    if (avance.tipo !== 'normal' && avance.tipo !== undefined) {
        mostrarToast('Solo se pueden eliminar avances creados por operadores', 'warning');
        return;
    }
    mostrarModalConfirmacion('Eliminar Avance', '¿Está seguro de eliminar este avance? Esta acción no se puede deshacer.', () => {
        avancesArray.splice(index, 1);
        avancesArray.sort((a, b) => a.timestamp - b.timestamp);
        renderizarAvances(); actualizarPlantilla(); hayNuevosAvances = true;
        guardarTicket();
        mostrarToast('🗑️ Avance eliminado exitosamente', 'success');
    });
}

function actualizarPlantilla() {
    const ticketIdEl = document.getElementById('ticketId');
    const tramoEl = document.getElementById('tramo');
    const redAfectadaEl = document.getElementById('redAfectada');
    const onnetEl = document.getElementById('onnet');
    const offnetEl = document.getElementById('offnet');
    const paisEl = document.getElementById('pais');
    const diagnosticoEl = document.getElementById('diagnostico');
    const accionesAdicionalesEl = document.getElementById('accionesAdicionales');
    const ticketSecundariosEl = document.getElementById('ticketSecundarios');
    const impactoEl = document.getElementById('impacto');
    const capacidadAfectadaEl = document.getElementById('capacidadAfectada');
    const noEtrCheck = document.getElementById('noEtrCheck');
    let estadoTexto = "🟡 En Progreso";
    if (ticketResuelto) { estadoTexto = "✅ Resuelto"; }
    else if (ticketSuspendido) { estadoTexto = "⏸️ Suspendido"; }

    let etrTxt = 'No definido';
    if (!noEtrCheck.checked) {
        const horas = parseInt(document.getElementById('etrHoras').value) || 0;
        const minutos = parseInt(document.getElementById('etrMinutos').value) || 0;
        if (horas > 0 || minutos > 0) { etrTxt = `${horas}h ${minutos}m`; }
    } else if (noEtrCheck.checked) {
        etrTxt = 'No hay ETR definido';
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
            let prefijo = '';
            if (avance.tipo === 'resuelto') prefijo = '✅ ';
            const indicadorEdicion = avance.editado ? ' ✏️' : '';
            return `*_${fechaStr}_* - ${prefijo}${avance.texto}${indicadorEdicion}`;
        }).join('\n');
    }

    const fechaAfectacion = obtenerFechaAfectacion();
    const fechaAfectacionTexto = fechaAfectacion ?
        fechaAfectacion.toLocaleString('es-EC', { timeZone: 'America/Guayaquil', hour12: false }) :
        'No definida';

    // ACTUALIZAR TIEMPOS SLA ANTES DE GENERAR PLANTILLA
    const ahora = ticketResuelto ? fechaResolucion : new Date();
    const { activeTime, suspendedTime, totalTime } = fechaAfectacion ?
        calculateActiveAndSuspendedTime(fechaAfectacion, avancesArray, ahora) :
        { activeTime: 0, suspendedTime: 0, totalTime: 0 };

    const ticketsSecundariosTexto = ticketSecundariosEl.value.trim() ?
        ticketSecundariosEl.value.split(/[\n,]+/).map(t => t.trim()).filter(t => t.length > 0).map(t => `   - ${t}`).join('\n')
        : '   - Ninguno';

    const hostnamePuertosTexto = obtenerHostnamePuertosTexto();

    const plantillaTexto =
        `========================================
📋 TICKET DE INCIDENCIA - SEGUIMIENTO
🎫 Ticket: ${ticketIdEl.value || '(sin ID)'}
📊 Estado: ${estadoTexto}
🛤️ Tramo: ${tramoEl.value || '-'}
🖥️ EQUIPOS AFECTADOS:
${hostnamePuertosTexto}
🌐 Red afectada: ${redAfectadaEl.value || '-'}
📅 Fecha de afectación (GMT-5): ${fechaAfectacionTexto}
${ticketResuelto ? `🏁 Fecha de resolución (GMT-5): ${fechaResolucion.toLocaleString('es-EC', { timeZone: 'America/Guayaquil', hour12: false })}` : ''}
⏱️ TIEMPOS SLA:
• Tiempo en progreso: ${formatear(activeTime)}
• Tiempo suspendido: ${formatear(suspendedTime)}
• Tiempo total transcurrido: ${formatear(totalTime)}
${ticketResuelto ? '⚠️ TICKET RESUELTO ⚠️' : ''}
🔗 Red Onnet: ${onnetEl.value || '-'}
🏢 Proveedor Offnet: ${offnetEl.value || '-'}
🌍 País: ${paisEl.value || '-'}
📝 INFORMACIÓN ADICIONAL:
• Ticket secundarios:
${ticketsSecundariosTexto}
• Impacto: ${impactoEl.value || 'Sin impacto definido'}
• Capacidad afectada: ${capacidadAfectadaEl.value || 'No especificada'}
🔍 DIAGNÓSTICO INICIAL:
${diagnosticoEl.value || 'Sin diagnóstico'}
⏰ ETR ESTIMADO: ${etrTxt}
📜 HISTORIAL DE AVANCES (orden cronológico):
${historialTexto}
🔧 ACCIONES ADICIONALES:
${accionesAdicionalesEl.value.trim() || 'Sin acciones adicionales definidas'}
========================================`;
    document.getElementById('plantillaSeguimiento').innerText = plantillaTexto;
}

// ============================================
// FUNCIONES DE COPIADO MEJORADAS CON FEEDBACK
// ============================================
function copiarPlantilla(btn) {
    // FORZAR ACTUALIZACIÓN DE LA PLANTILLA CON TIEMPOS ACTUALES ANTES DE COPIAR
    actualizarPlantilla();
    const plantillaEl = document.getElementById('plantillaSeguimiento');
    const originalHTML = btn.innerHTML;
    const originalClasses = btn.className;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(plantillaEl.innerText).then(() => {
            mostrarFeedbackExito(btn, originalHTML, originalClasses, '✅ ¡Copiado!');
        }).catch(err => {
            console.warn('Clipboard API falló, usando método alternativo:', err);
            copiarConFallback(plantillaEl, btn, originalHTML, originalClasses);
        });
    } else {
        copiarConFallback(plantillaEl, btn, originalHTML, originalClasses);
    }
}

function copiarConFallback(plantillaEl, btn, originalHTML, originalClasses) {
    try {
        const textArea = document.createElement('textarea');
        textArea.value = plantillaEl.innerText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const exito = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (exito) {
            mostrarFeedbackExito(btn, originalHTML, originalClasses, '✅ ¡Copiado!');
        } else {
            throw new Error('execCommand falló');
        }
    } catch (err) {
        console.error('Error al copiar:', err);
        mostrarToast('❌ Error al copiar. Seleccione el texto manualmente y presione Ctrl+C', 'error');
        btn.innerHTML = originalHTML;
        btn.className = originalClasses;
    }
}

function mostrarFeedbackExito(btn, originalHTML, originalClasses, mensajeExito = '✅ ¡Copiado!') {
    const existingToasts = document.querySelectorAll('.toast-success, .toast-error');
    existingToasts.forEach(toast => {
        toast.classList.remove('show');
        setTimeout(() => { if (toast.parentNode) { toast.parentNode.removeChild(toast); } }, 300);
    });
    // Cambiar texto del botón temporalmente
    btn.innerHTML = mensajeExito;
    btn.className = 'btn btn-success w-100 mt-3';
    btn.style.animation = 'pulse 0.5s ease';

    mostrarToast('✅ Contenido copiado al portapapeles exitosamente', 'success');

    // Efecto visual en la card
    const card = document.querySelector('.container-grid > div:last-child .card');
    if (card) {
        card.style.boxShadow = '0 0 20px rgba(40, 167, 69, 0.6)';
        card.style.transform = 'scale(1.02)';
        setTimeout(() => {
            card.style.boxShadow = '';
            card.style.transform = '';
        }, 1000);
    }

    // Restaurar botón después de 2 segundos
    setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.className = originalClasses;
        btn.style.animation = '';
    }, 2000);
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
    const fecha = obtenerFechaAfectacion();
    if (fecha) {
        const opciones = { timeZone: 'America/Guayaquil', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
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
        tiempoProgresoEl.innerText = formatear(activeTime);
        tiempoSuspendidoEl.innerText = formatear(suspendedTime);
        tiempoTotalEl.innerText = formatear(totalTime);
        slaProgresoEl.innerText = formatear(activeTime);
        slaSuspendidoEl.innerText = formatear(suspendedTime);
        slaTotalEl.innerText = formatear(totalTime);
        mostrarFechaAfectacion();
    } else {
        tiempoProgresoEl.innerText = '00:00:00';
        tiempoSuspendidoEl.innerText = '00:00:00';
        tiempoTotalEl.innerText = '00:00:00';
        slaProgresoEl.innerText = '00:00:00';
        slaSuspendidoEl.innerText = '00:00:00';
        slaTotalEl.innerText = '00:00:00';
        fechaAfectacionMostradaEl.textContent = 'Sin fecha de afectación definida';
        fechaAfectacionMostradaEl.className = 'time-detail text-muted';
    }
    if (avancesArray.length > 0) {
        const ultimoAvance = avancesArray[avancesArray.length - 1];
        const elapsedSinceUpdate = ahora - ultimoAvance.timestamp;
        tiempoUltimoAvanceEl.innerText = formatear(elapsedSinceUpdate < 0 ? 0 : elapsedSinceUpdate);
        fechaUltimoAvanceEl.innerText = ultimoAvance.timestamp.toLocaleString('es-EC', {
            timeZone: 'America/Guayaquil', year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
        });
        fechaUltimoAvanceEl.className = 'small fw-medium text-primary';
    } else {
        tiempoUltimoAvanceEl.innerText = '--:--:--';
        fechaUltimoAvanceEl.innerText = 'Sin avances registrados';
        fechaUltimoAvanceEl.className = 'small text-muted';
    }
}

setInterval(actualizarCronometro, 1000);

function actualizarSuspensionUI() {
    if (ticketSuspendido) { suspensionIndicatorEl.style.display = 'inline-flex'; }
    else { suspensionIndicatorEl.style.display = 'none'; }
    if (ticketSuspendido) {
        suspendBtnEl.innerHTML = '🔄 Reanudar Ticket';
        suspendBtnEl.classList.remove('btn-outline-warning');
        suspendBtnEl.classList.add('btn-outline-success');
    } else {
        suspendBtnEl.innerHTML = '⏸️ Suspender Ticket';
        suspendBtnEl.classList.remove('btn-outline-success');
        suspendBtnEl.classList.add('btn-outline-warning');
    }
    if (ticketResuelto) { resueltoIndicatorEl.style.display = 'inline-flex'; }
    else { resueltoIndicatorEl.style.display = 'none'; }
}

function mostrarToast(mensaje, tipo = 'success') { mostrarToastMejorado(mensaje, tipo); }

function mostrarToastMejorado(mensaje, tipo = 'success', titulo = '') {
    const container = document.querySelector('.toast-container');
    const toastId = 'toast-' + Date.now();
    const icons = { success: 'bi-check-circle-fill', error: 'bi-exclamation-octagon-fill', warning: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill' };
    const titulos = { success: '¡Éxito!', error: 'Error', warning: 'Advertencia', info: 'Información' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.id = toastId;
    toast.innerHTML = `<i class="bi ${icons[tipo]} toast-icon"></i> <div class="toast-content"> <div class="toast-title">${titulo || titulos[tipo]}</div> <div class="toast-message">${mensaje}</div> </div> <button class="toast-close" onclick="cerrarToast('${toastId}')"><i class="bi bi-x-lg"></i></button>`;
    container.appendChild(toast);
    setTimeout(() => { cerrarToast(toastId); }, 5000);
}

function cerrarToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
        toast.classList.add('toast-hide');
        setTimeout(() => { if (toast.parentNode) { toast.parentNode.removeChild(toast); } }, 400);
    }
}

function mostrarModalConfirmacion(titulo, mensaje, callback) {
    const modal = document.getElementById('modalConfirm');
    const titleEl = document.getElementById('modalConfirmTitle');
    const messageEl = document.getElementById('modalConfirmMessage');
    const btnOk = document.getElementById('btnConfirmOk');
    titleEl.textContent = titulo;
    messageEl.textContent = mensaje;
    modalConfirmCallback = callback;
    btnOk.onclick = () => { closeModalConfirm(); if (callback) callback(); };
    modal.style.display = 'flex';
}

function closeModalConfirm() {
    const modal = document.getElementById('modalConfirm');
    modal.style.display = 'none';
    modalConfirmCallback = null;
}

function mostrarModalInfo(titulo, contenido) {
    const modal = document.getElementById('modalInfo');
    const headerEl = modal.querySelector('.modal-info-header h3');
    const bodyEl = document.getElementById('modalInfoBody');
    headerEl.innerHTML = `<i class="bi bi-info-circle"></i> ${titulo}`;
    bodyEl.innerHTML = contenido;
    modal.style.display = 'flex';
}

function closeModalInfo() {
    const modal = document.getElementById('modalInfo');
    modal.style.display = 'none';
}

function actualizarDashboardStats() {
    const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    const total = tickets.length;
    const activos = tickets.filter(t => !t.isResolved && !t.isSuspended).length;
    const suspendidos = tickets.filter(t => t.isSuspended && !t.isResolved).length;
    const resueltos = tickets.filter(t => t.isResolved).length;
    animarNumero('totalTickets', total);
    animarNumero('activeTickets', activos);
    animarNumero('suspendedTickets', suspendidos);
    animarNumero('resolvedTickets', resueltos);
}

function animarNumero(elementId, valorFinal) {
    const element = document.getElementById(elementId);
    if (!element) return;
    const duracion = 1000;
    const inicio = parseInt(element.textContent) || 0;
    const cambio = valorFinal - inicio;
    const inicioTiempo = performance.now();
    function actualizarNumero(tiempoActual) {
        const tiempoTranscurrido = tiempoActual - inicioTiempo;
        const progreso = Math.min(tiempoTranscurrido / duracion, 1);
        const easeOutQuart = 1 - Math.pow(1 - progreso, 4);
        const valorActual = Math.floor(inicio + cambio * easeOutQuart);
        element.textContent = valorActual;
        if (progreso < 1) { requestAnimationFrame(actualizarNumero); }
    }
    requestAnimationFrame(actualizarNumero);
}

function calculateActiveAndSuspendedTime(incidentTime, avances, currentTime) {
    if (!incidentTime || isNaN(incidentTime.getTime()) || currentTime < incidentTime) {
        return { activeTime: 0, suspendedTime: 0, totalTime: 0 };
    }
    const totalTime = currentTime - incidentTime;
    const events = avances.filter(av => (av.tipo === 'suspension' || av.tipo === 'reanudacion') && av.timestamp >= incidentTime && av.timestamp <= currentTime).map(av => ({ time: av.timestamp, type: av.tipo })).sort((a, b) => a.time - b.time);
    let activeTime = 0; let suspendedTime = 0; let currentState = 'active'; let lastTime = incidentTime;
    for (const event of events) {
        const duration = event.time - lastTime;
        if (duration > 0) { if (currentState === 'active') { activeTime += duration; } else { suspendedTime += duration; } }
        currentState = (event.type === 'suspension') ? 'suspended' : 'active';
        lastTime = event.time;
    }
    const finalDuration = currentTime - lastTime;
    if (finalDuration > 0) { if (currentState === 'active') { activeTime += finalDuration; } else { suspendedTime += finalDuration; } }
    activeTime = Math.max(0, Math.round(activeTime));
    suspendedTime = Math.max(0, Math.round(suspendedTime));
    return { activeTime, suspendedTime, totalTime: Math.round(totalTime) };
}

function guardarTicket() {
    const ticketIdEl = document.getElementById('ticketId');
    if (!ticketIdEl.value.trim()) { mostrarToast('Ingrese ID de ticket para guardar', 'error'); ticketIdEl.focus(); ticketIdEl.classList.add('is-invalid'); setTimeout(() => { ticketIdEl.classList.remove('is-invalid'); }, 2000); return; }
    const fechaAfectacionEl = document.getElementById('fechaAfectacion');
    const tramoEl = document.getElementById('tramo');
    const redAfectadaEl = document.getElementById('redAfectada');
    const onnetEl = document.getElementById('onnet');
    const offnetEl = document.getElementById('offnet');
    const paisEl = document.getElementById('pais');
    const diagnosticoEl = document.getElementById('diagnostico');
    const accionesAdicionalesEl = document.getElementById('accionesAdicionales');
    const ticketSecundariosEl = document.getElementById('ticketSecundarios');
    const impactoEl = document.getElementById('impacto');
    const capacidadAfectadaEl = document.getElementById('capacidadAfectada');
    const noEtrCheck = document.getElementById('noEtrCheck');
    const avancesParaGuardar = avancesArray.map(avance => ({ timestamp: avance.timestamp.toISOString(), texto: avance.texto, tipo: avance.tipo, editado: avance.editado }));
    const etrHoras = document.getElementById('etrHoras').value;
    const etrMinutos = document.getElementById('etrMinutos').value;
    const ticket = {
        id: ticketActivoId || Date.now(), workflowState: estadoActual, isSuspended: ticketSuspendido, isResolved: ticketResuelto,
        resolutionDate: ticketResuelto ? fechaResolucion.toISOString() : null, noEtr: noEtrCheck.checked, ticketId: ticketIdEl.value,
        fechaAfectacion: fechaAfectacionEl.value.trim(), tramo: tramoEl.value, hostnamePuertoPairs: obtenerHostnamePuertosParaGuardar(),
        redAfectada: redAfectadaEl.value, onnet: onnetEl.value, offnet: offnetEl.value, pais: paisEl.value, ticketSecundarios: ticketSecundariosEl.value,
        impacto: impactoEl.value, capacidadAfectada: capacidadAfectadaEl.value, diagnostico: diagnosticoEl.value, etrHoras: etrHoras, etrMinutos: etrMinutos,
        accionesAdicionales: accionesAdicionalesEl.value, avancesArray: avancesParaGuardar
    };
    let tks = JSON.parse(localStorage.getItem('tickets')) || [];
    tks = tks.filter(t => t.id !== ticket.id);
    tks.push(ticket);
    localStorage.setItem('tickets', JSON.stringify(tks));
    ticketActivoId = ticket.id;
    localStorage.setItem('ultimoTicketActivo', ticketActivoId);
    cargarListaTickets();
    hayNuevosAvances = false;
    nuevosAvancesBadgeEl.style.display = 'none';
    mostrarToast(`Ticket ${ticketIdEl.value} guardado exitosamente`, 'success');
    ticketIdEl.classList.add('is-valid');
    setTimeout(() => { ticketIdEl.classList.remove('is-valid'); }, 2000);
    actualizarDashboardStats();
}

function cargarListaTickets() {
    const listaTicketsEl = document.getElementById('listaTickets');
    listaTicketsEl.innerHTML = '';
    const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    if (tickets.length === 0) {
        listaTicketsEl.innerHTML = `<div class="ticket-dropdown-container"><select class="ticket-dropdown" disabled><option value="">N/A - N/A</option></select></div>`;
        return;
    }
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'ticket-dropdown-container';
    const select = document.createElement('select');
    select.className = 'ticket-dropdown';
    const defaultOption = document.createElement('option');
    defaultOption.value = ''; defaultOption.textContent = 'N/A - N/A'; defaultOption.disabled = true; defaultOption.selected = !ticketActivoId;
    select.appendChild(defaultOption);
    tickets.forEach(t => {
        const option = document.createElement('option');
        option.value = t.id;
        let estadoIcon = ''; let estadoClass = '';
        if (t.isResolved) { estadoIcon = ' ✅'; estadoClass = 'ticket-resuelto-option'; }
        else if (t.isSuspended) { estadoIcon = ' ⏸️'; estadoClass = 'ticket-suspendido-option'; }
        else if (t.workflowState === 1) { estadoIcon = ' 📊'; estadoClass = 'ticket-escalonado-option'; }
        else if (t.workflowState === 3) { estadoIcon = ' 🔄'; estadoClass = 'ticket-restablecido-option'; }
        else { estadoIcon = ' 🟢'; estadoClass = 'ticket-activo-option'; }
        option.textContent = `${t.ticketId} - ${t.tramo || 'Sin tramo'}${estadoIcon}`;
        option.className = estadoClass;
        if (t.id === ticketActivoId) { option.selected = true; }
        select.appendChild(option);
    });
    select.addEventListener('change', (e) => { if (e.target.value) { cargarTicket(parseInt(e.target.value)); } });
    dropdownContainer.appendChild(select);
    listaTicketsEl.appendChild(dropdownContainer);
}

function cargarTicket(id) {
    const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
    const t = tickets.find(x => x.id === id);
    if (!t) return;
    ticketActivoId = id;
    estadoActual = t.workflowState ?? 0;
    ticketSuspendido = t.isSuspended ?? false;
    ticketResuelto = t.isResolved || false;
    fechaResolucion = t.resolutionDate ? new Date(t.resolutionDate) : null;
    document.getElementById('ticketId').value = t.ticketId || '';
    document.getElementById('fechaAfectacion').value = t.fechaAfectacion || '';
    document.getElementById('tramo').value = t.tramo || '';
    cargarHostnamePuertosGuardados(t);
    document.getElementById('redAfectada').value = t.redAfectada || '';
    document.getElementById('onnet').value = t.onnet || '';
    document.getElementById('offnet').value = t.offnet || '';
    document.getElementById('pais').value = t.pais || '';
    document.getElementById('ticketSecundarios').value = t.ticketSecundarios || '';
    document.getElementById('impacto').value = t.impacto || '';
    document.getElementById('capacidadAfectada').value = t.capacidadAfectada || '';
    document.getElementById('diagnostico').value = t.diagnostico || '';
    document.getElementById('accionesAdicionales').value = t.accionesAdicionales || '';
    const etrHorasEl = document.getElementById('etrHoras');
    const etrMinutosEl = document.getElementById('etrMinutos');
    if (t.etrHoras !== undefined && t.etrMinutos !== undefined) {
        etrHorasEl.value = t.etrHoras || '0'; etrMinutosEl.value = t.etrMinutos || '0';
    } else { etrHorasEl.value = '0'; etrMinutosEl.value = '0'; }
    const noEtrCheck = document.getElementById('noEtrCheck');
    if (t.noEtr) { noEtrCheck.checked = true; document.getElementById('etrInputs').style.display = 'none'; }
    else { noEtrCheck.checked = false; document.getElementById('etrInputs').style.display = 'block'; }
    if (t.avancesArray && Array.isArray(t.avancesArray)) {
        avancesArray = t.avancesArray.map(avance => ({ timestamp: new Date(avance.timestamp), texto: avance.texto, tipo: avance.tipo || 'normal', editado: avance.editado || null })).sort((a, b) => a.timestamp - b.timestamp);
    } else { avancesArray = []; }
    renderizarAvances();
    document.getElementById('usarFechaManual').checked = false;
    document.getElementById('fechaAvanceManual').disabled = true;
    document.getElementById('fechaAvanceManual').value = '';
    hayNuevosAvances = false;
    nuevosAvancesBadgeEl.style.display = 'none';
    actualizarSuspensionUI(); actualizarPlantilla(); actualizarCronometro(); mostrarFechaAfectacion();
    if (ticketResuelto) {
        resolveBtnEl.innerHTML = '✅ Resuelto'; resolveBtnEl.classList.replace('btn-outline-success', 'btn-success'); resolveBtnEl.disabled = true; reopenBtnEl.style.display = 'inline-block';
    } else {
        resolveBtnEl.innerHTML = '🏁 Marcar como resuelto'; resolveBtnEl.classList.replace('btn-success', 'btn-outline-success'); resolveBtnEl.disabled = false; reopenBtnEl.style.display = 'none';
    }
    cargarListaTickets();
    document.querySelector('.container-grid').scrollIntoView({ behavior: 'smooth' });
}

function nuevoTicket() {
    ticketActivoId = null; estadoActual = 0; ticketSuspendido = false; ticketResuelto = false; fechaResolucion = null; avancesArray = []; hayNuevosAvances = false;
    hostnamePuertoPairs = []; pairCounter = 0;
    const camposReset = ['ticketId', 'tramo', 'redAfectada', 'onnet', 'offnet', 'pais', 'ticketSecundarios', 'impacto', 'capacidadAfectada', 'diagnostico', 'accionesAdicionales', 'avanceInput', 'suspensionManual', 'reanudacionManual', 'motivoSuspension', 'motivoReanudacion', 'fechaAvanceManual'];
    camposReset.forEach(id => { const el = document.getElementById(id); if (el) { el.value = ''; el.classList.remove('is-invalid', 'is-valid', 'input-format-error'); } });
    document.getElementById('etrHoras').value = '0'; document.getElementById('etrMinutos').value = '0';
    const fechaAfectEl = document.getElementById('fechaAfectacion');
    if (fechaAfectEl && fechaAfectEl.value.trim()) { validarFormatoFecha('fechaAfectacion'); }
    document.getElementById('suspensionManual').value = ''; document.getElementById('reanudacionManual').value = '';
    document.getElementById('motivoSuspension').value = ''; document.getElementById('motivoReanudacion').value = '';
    document.getElementById('usarFechaManual').checked = false; document.getElementById('fechaAvanceManual').disabled = true; document.getElementById('fechaAvanceManual').value = '';
    document.getElementById('noEtrCheck').checked = false; document.getElementById('etrInputs').style.display = 'block';
    renderizarAvances(); inicializarHostnamePuertos();
    tiempoProgresoEl.innerText = '00:00:00'; tiempoSuspendidoEl.innerText = '00:00:00'; tiempoTotalEl.innerText = '00:00:00';
    slaProgresoEl.innerText = '00:00:00'; slaSuspendidoEl.innerText = '00:00:00'; slaTotalEl.innerText = '00:00:00';
    tiempoUltimoAvanceEl.innerText = '--:--:--'; fechaUltimoAvanceEl.innerText = 'Sin avances registrados';
    fechaAfectacionMostradaEl.textContent = 'Sin fecha de afectación definida'; fechaAfectacionMostradaEl.className = 'time-detail text-muted';
    document.getElementById('plantillaSeguimiento').innerText = 'Complete los campos del ticket para generar la plantilla de seguimiento...';
    actualizarSuspensionUI(); actualizarCronometro();
    resolveBtnEl.innerHTML = '🏁 Marcar como resuelto'; resolveBtnEl.classList.replace('btn-success', 'btn-outline-success'); resolveBtnEl.disabled = false; reopenBtnEl.style.display = 'none';
    resueltoIndicatorEl.style.display = 'none';
    localStorage.removeItem('ultimoTicketActivo');
    cargarListaTickets(); actualizarDashboardStats();
    document.getElementById('ticketId').focus();
}

function eliminarTicket() {
    if (!ticketActivoId) { mostrarToast('No hay ticket seleccionado para eliminar. Por favor seleccione un ticket de la lista.', 'error'); return; }
    const ticketIdEl = document.getElementById('ticketId');
    mostrarModalConfirmacion('Eliminar Ticket', `¿Eliminar permanentemente el ticket ${ticketIdEl.value}? Esta acción no se puede deshacer.`, () => {
        let tks = JSON.parse(localStorage.getItem('tickets')) || [];
        tks = tks.filter(t => t.id !== ticketActivoId);
        localStorage.setItem('tickets', JSON.stringify(tks));
        nuevoTicket(); cargarListaTickets();
        mostrarToast(`Ticket ${ticketIdEl.value} eliminado correctamente`, 'success');
        actualizarDashboardStats();
    });
}

function toggleEstado() {
    if (ticketResuelto) { mostrarToast('No se puede modificar el estado de un ticket ya resuelto', 'warning'); return; }
    if (!ticketActivoId) { mostrarToast('Seleccione un ticket primero para suspender/reanudar. Puede crear uno nuevo o seleccionar de la lista.', 'error'); nuevoTicket(); return; }
    ticketSuspendido = !ticketSuspendido;
    const mensaje = ticketSuspendido ? "Ticket suspendido" : "Ticket reanudado";
    const tipoAvance = ticketSuspendido ? 'suspension' : 'reanudacion';
    if (!ticketSuspendido && estadoActual < 2) { estadoActual = 2; }
    const nuevoAvance = { timestamp: new Date(), texto: mensaje, tipo: tipoAvance };
    avancesArray.push(nuevoAvance); avancesArray.sort((a, b) => a.timestamp - b.timestamp);
    renderizarAvances(); hayNuevosAvances = true;
    let tks = JSON.parse(localStorage.getItem('tickets')) || [];
    const t = tks.find(x => x.id === ticketActivoId);
    if (t) {
        const avancesParaGuardar = avancesArray.map(avance => ({ timestamp: avance.timestamp.toISOString(), texto: avance.texto, tipo: avance.tipo, editado: avance.editado }));
        t.isSuspended = ticketSuspendido; t.workflowState = estadoActual; t.avancesArray = avancesParaGuardar;
        localStorage.setItem('tickets', JSON.stringify(tks));
    }
    actualizarSuspensionUI(); actualizarPlantilla(); actualizarCronometro(); cargarListaTickets(); actualizarDashboardStats();
    if (!ticketSuspendido) { mostrarToast(`Ticket reanudado exitosamente. Los cronómetros continúan contando el tiempo en progreso.`, 'success'); }
    else { mostrarToast(`Ticket suspendido correctamente. El tiempo suspendido no cuenta para el SLA.`, 'success'); }
}

function resolverTicket() {
    if (!ticketActivoId) { mostrarToast('Seleccione un ticket primero para resolver', 'error'); return; }
    if (ticketResuelto) { mostrarToast('Este ticket ya está marcado como resuelto', 'warning'); return; }
    const fechaAfectacion = obtenerFechaAfectacion();
    if (!fechaAfectacion) { mostrarToast('Debe definir la "Fecha y hora de afectación" antes de resolver el ticket', 'error'); document.getElementById('fechaAfectacion').focus(); return; }
    abrirModalResolucion();
}

function abrirModalResolucion() {
    insertarFechaActual('resolutionDateTime');
    document.getElementById('resolutionModal').style.display = 'flex';
    document.getElementById('resolutionError').style.display = 'none';
}

function cerrarModalResolucion() {
    document.getElementById('resolutionModal').style.display = 'none';
    document.getElementById('resolutionDateTime').value = '';
    document.getElementById('resolutionError').style.display = 'none';
}

function confirmarResolucion() {
    const resolutionInput = document.getElementById('resolutionDateTime');
    const resolutionValue = resolutionInput.value.trim();
    const errorEl = document.getElementById('resolutionError');
    const errorMsgEl = document.getElementById('resolutionErrorMessage');
    if (!resolutionValue) { errorMsgEl.textContent = 'Debe ingresar la fecha y hora de resolución'; errorEl.style.display = 'block'; resolutionInput.focus(); return; }
    if (!validarFormatoFechaManual(resolutionValue)) { errorMsgEl.textContent = 'Formato inválido. Use: AAAA-MM-DD HH:mm (ej: 2026-02-03 14:30)'; errorEl.style.display = 'block'; return; }
    const [datePart, timePart] = resolutionValue.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    const fechaUTC = Date.UTC(year, month - 1, day, hours + 5, minutes);
    const fechaResolucionPropuesta = new Date(fechaUTC);
    if (isNaN(fechaResolucionPropuesta.getTime())) { errorMsgEl.textContent = 'Fecha inválida para la resolución'; errorEl.style.display = 'block'; return; }
    const fechaAfectacion = obtenerFechaAfectacion();
    if (!fechaAfectacion) { errorMsgEl.textContent = 'Error: Fecha de afectación no definida'; errorEl.style.display = 'block'; return; }
    if (fechaResolucionPropuesta < fechaAfectacion) { errorMsgEl.textContent = 'La fecha de resolución no puede ser anterior a la fecha de afectación'; errorEl.style.display = 'block'; return; }
    const ahoraGMT5 = new Date(new Date().getTime() - (5 * 60 * 60 * 1000));
    if (fechaResolucionPropuesta > ahoraGMT5) { if (!confirm('La fecha de resolución está en el futuro. ¿Desea continuar?')) { return; } }
    cerrarModalResolucion(); aplicarResolucion(fechaResolucionPropuesta, resolutionValue);
}

function validarFormatoFechaManual(fechaStr) {
    const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-3]):[0-5]\d$/;
    return regex.test(fechaStr);
}

function aplicarResolucion(fechaResolucionPropuesta, fechaTextoOriginal) {
    ticketResuelto = true; fechaResolucion = fechaResolucionPropuesta;
    const fechaResolucionGMT5 = fechaResolucionPropuesta.toLocaleString('es-EC', { timeZone: 'America/Guayaquil', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
    const textoResolucion = `✅ TICKET RESUELTO - ${fechaResolucionGMT5} (GMT-5)`;
    avancesArray.push({ timestamp: fechaResolucionPropuesta, texto: textoResolucion, tipo: 'resuelto' });
    avancesArray.sort((a, b) => a.timestamp - b.timestamp);
    renderizarAvances(); actualizarPlantilla(); actualizarCronometro(); guardarTicket();
    document.querySelectorAll('#avanceInput, #suspensionManual, #reanudacionManual, #fechaAvanceManual, #usarFechaManual, #motivoSuspension, #motivoReanudacion').forEach(el => { el.disabled = true; });
    document.querySelectorAll('.add-avance-btn, .manual-state-btn').forEach(el => { el.disabled = true; el.classList.add('disabled'); });
    resolveBtnEl.innerHTML = '✅ Resuelto'; resolveBtnEl.classList.replace('btn-outline-success', 'btn-success'); resolveBtnEl.disabled = true;
    reopenBtnEl.style.display = 'inline-block'; suspendBtnEl.disabled = true; resueltoIndicatorEl.style.display = 'inline-flex';
    const tiempoProgresoFinal = document.getElementById('slaProgreso').innerText;
    mostrarToast(`¡Ticket resuelto! Tiempo final en progreso: ${tiempoProgresoFinal}<br>Fecha de resolución: ${fechaResolucionGMT5}`, 'success');
    actualizarDashboardStats();
}

function reabrirTicket() {
    if (!ticketActivoId) { mostrarToast('Seleccione un ticket primero para reabrir', 'error'); return; }
    if (!ticketResuelto) { mostrarToast('Este ticket no está resuelto', 'warning'); return; }
    mostrarModalConfirmacion('Reabrir Ticket', `¿Reabrir el ticket "${document.getElementById('ticketId').value}"? Los cronómetros se reanudarán desde el momento actual y podrán agregarse nuevos avances.`, () => {
        ticketResuelto = false; fechaResolucion = null;
        const ahora = new Date();
        avancesArray.push({ timestamp: ahora, texto: `🔄 TICKET REABIERTO - ${ahora.toLocaleString('es-EC', { timeZone: 'America/Guayaquil', hour12: false })}`, tipo: 'sistema' });
        avancesArray.sort((a, b) => a.timestamp - b.timestamp);
        document.querySelectorAll('#avanceInput, #suspensionManual, #reanudacionManual, #fechaAvanceManual, #usarFechaManual, #motivoSuspension, #motivoReanudacion').forEach(el => { el.disabled = false; });
        document.querySelectorAll('.add-avance-btn, .manual-state-btn').forEach(el => { el.disabled = false; el.classList.remove('disabled'); });
        resolveBtnEl.innerHTML = '🏁 Marcar como resuelto'; resolveBtnEl.classList.replace('btn-success', 'btn-outline-success'); resolveBtnEl.disabled = false;
        reopenBtnEl.style.display = 'none'; suspendBtnEl.disabled = false; resueltoIndicatorEl.style.display = 'none';
        renderizarAvances(); actualizarPlantilla(); actualizarCronometro(); guardarTicket();
        mostrarToast(`Ticket reabierto exitosamente. Los cronómetros se han reanudado y ahora puede continuar gestionando la incidencia.`, 'success');
        actualizarDashboardStats();
    });
}

// ============================================
// NUEVA FUNCIÓN DE EXPORTAR CON MODAL DE SELECCIÓN
// ============================================
function exportarTickets() {
    try {
        if (ticketActivoId && hayNuevosAvances) {
            guardarTicket();
        }

        let tickets = JSON.parse(localStorage.getItem('tickets')) || [];

        if (tickets.length === 0) {
            mostrarToast('No hay tickets para exportar. Cree al menos un ticket primero.', 'error');
            return;
        }

        // Abrir modal de selección
        abrirModalSeleccionExportar(tickets);

    } catch (error) {
        console.error('Error exportar:', error);
        mostrarToast(`❌ Error: ${error.message}`, 'error');
    }
}

// ============================================
// ABRIR MODAL DE SELECCIÓN DE TICKETS
// ============================================
function abrirModalSeleccionExportar(tickets) {
    const modal = document.getElementById('modalSeleccionExportar');
    const container = document.getElementById('ticketsCheckboxContainer');
    const selectDestino = document.getElementById('exportDestino');
    const otroDestinoContainer = document.getElementById('otroDestinoContainer');
    const otroDestinoInput = document.getElementById('otroDestinoInput');

    // Limpiar contenedor
    container.innerHTML = '';

    // Generar lista de tickets con checkboxes
    tickets.forEach((t, index) => {
        let estadoIcon = '';
        let estadoClass = '';
        let estadoTexto = '';

        if (t.isResolved) {
            estadoIcon = '✅';
            estadoClass = 'estado-resuelto';
            estadoTexto = 'Resuelto';
        } else if (t.isSuspended) {
            estadoIcon = '⏸️';
            estadoClass = 'estado-suspendido';
            estadoTexto = 'Suspendido';
        } else {
            estadoIcon = '🟢';
            estadoClass = 'estado-activo';
            estadoTexto = 'Activo';
        }

        const ticketId = t.ticketId || `Ticket-${t.id}`;
        const tramo = t.tramo || 'Sin tramo';

        const itemHTML = `
            <label class="ticket-checkbox-item">
                <input type="checkbox" class="ticket-export-checkbox" 
                       value="${t.id}" 
                       data-ticket-id="${ticketId}"
                       onchange="actualizarContadorSeleccion()">
                <div class="ticket-info">
                    <div class="ticket-id">${estadoIcon} ${ticketId}</div>
                    <div class="ticket-tramo">🛤️ ${tramo}</div>
                </div>
                <span class="ticket-estado ${estadoClass}">${estadoTexto}</span>
            </label>
        `;

        container.innerHTML += itemHTML;
    });

    // Actualizar preview del nombre de archivo
    selectDestino.addEventListener('change', function () {
        if (this.value === 'Otro') {
            otroDestinoContainer.style.display = 'block';
            otroDestinoInput.focus();
        } else {
            otroDestinoContainer.style.display = 'none';
        }
        actualizarPreviewNombreArchivo();
    });

    otroDestinoInput.addEventListener('input', actualizarPreviewNombreArchivo);

    // Inicializar contador
    actualizarContadorSeleccion();
    actualizarPreviewNombreArchivo();

    // Mostrar modal
    modal.style.display = 'flex';
}

// ============================================
// CERRAR MODAL DE EXPORTACIÓN
// ============================================
function cerrarModalExportar() {
    const modal = document.getElementById('modalSeleccionExportar');
    modal.style.display = 'none';

    // Resetear valores
    document.getElementById('exportDestino').value = '';
    document.getElementById('otroDestinoInput').value = '';
    document.getElementById('otroDestinoContainer').style.display = 'none';
    document.getElementById('selectAllTickets').checked = false;
}

// ============================================
// SELECCIONAR/DESELECCIONAR TODOS
// ============================================
function toggleSelectAllTickets() {
    const selectAll = document.getElementById('selectAllTickets');
    const checkboxes = document.querySelectorAll('.ticket-export-checkbox');

    checkboxes.forEach(cb => {
        cb.checked = selectAll.checked;
    });

    actualizarContadorSeleccion();
    actualizarPreviewNombreArchivo();
}

// ============================================
// ACTUALIZAR CONTADOR DE SELECCIONADOS
// ============================================
function actualizarContadorSeleccion() {
    const checkboxes = document.querySelectorAll('.ticket-export-checkbox:checked');
    const countEl = document.getElementById('selectedTicketsCount');
    const btnConfirm = document.querySelector('.btn-export-confirm');

    countEl.textContent = `${checkboxes.length} seleccionados`;

    // Habilitar/deshabilitar botón de exportar
    if (btnConfirm) {
        btnConfirm.disabled = checkboxes.length === 0;
    }

    actualizarPreviewNombreArchivo();
}

// ============================================
// ACTUALIZAR PREVIEW DEL NOMBRE DE ARCHIVO
// ============================================
function actualizarPreviewNombreArchivo() {
    const selectDestino = document.getElementById('exportDestino');
    const otroDestinoInput = document.getElementById('otroDestinoInput');
    const checkboxes = document.querySelectorAll('.ticket-export-checkbox:checked');
    const fileNamePreview = document.getElementById('exportFileNamePreview');
    const datePreview = document.getElementById('exportDatePreview');

    let destino = selectDestino.value;
    if (destino === 'Otro') {
        destino = otroDestinoInput.value.trim() || 'Otro';
    }

    const fechaActual = new Date();
    const fechaStr = fechaActual.toLocaleString('es-EC', {
        timeZone: 'America/Guayaquil',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).replace(/[/:\s]/g, '-');

    const cantidad = checkboxes.length;
    const nombreBase = destino || '---';

    if (fileNamePreview) {
        fileNamePreview.textContent = `tickets_${nombreBase}_${cantidad}_${fechaStr}.json`;
    }

    if (datePreview) {
        datePreview.textContent = fechaActual.toLocaleString('es-EC', {
            timeZone: 'America/Guayaquil',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
}

// ============================================
// CONFIRMAR EXPORTACIÓN DE TICKETS SELECCIONADOS
// ============================================
function confirmarExportacionSeleccion() {
    const checkboxes = document.querySelectorAll('.ticket-export-checkbox:checked');
    const selectDestino = document.getElementById('exportDestino');
    const otroDestinoInput = document.getElementById('otroDestinoInput');

    if (checkboxes.length === 0) {
        mostrarToast('⚠️ Debe seleccionar al menos un ticket para exportar', 'warning');
        return;
    }

    let destino = selectDestino.value;
    if (!destino) {
        mostrarToast('⚠️ Debe seleccionar un destino para la exportación', 'warning');
        selectDestino.focus();
        return;
    }

    if (destino === 'Otro') {
        destino = otroDestinoInput.value.trim();
        if (!destino) {
            mostrarToast('⚠️ Debe especificar el destino', 'warning');
            otroDestinoInput.focus();
            return;
        }
    }

    // Obtener IDs de tickets seleccionados
    const selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

    // Obtener tickets completos
    let todosLosTickets = JSON.parse(localStorage.getItem('tickets')) || [];
    const ticketsSeleccionados = todosLosTickets.filter(t => selectedIds.includes(t.id));

    // Generar nombre de archivo
    const fechaActual = new Date();
    const fechaStr = fechaActual.toLocaleString('es-EC', {
        timeZone: 'America/Guayaquil',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).replace(/[/:\s]/g, '-');

    const nombreArchivo = `tickets_${destino}_${ticketsSeleccionados.length}_${fechaStr}.json`;

    // Crear archivo JSON
    const dataStr = JSON.stringify(ticketsSeleccionados, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();

    // Limpieza
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 0);

    // Cerrar modal y mostrar mensaje de éxito
    cerrarModalExportar();
    mostrarToast(
        `✅ Exportados ${ticketsSeleccionados.length} tickets<br>
         📁 ${nombreArchivo}<br>
         📤 Destino: <strong>${destino}</strong>`,
        'success'
    );
}

// ============================================
// IMPORTAR TICKETS (SE MANTIENE IGUAL)
// ============================================
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
                if (!Array.isArray(imported) || imported.length === 0) {
                    throw new Error('Archivo inválido');
                }
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
                actualizarDashboardStats();
            } catch (err) {
                console.error('Error importar:', err);
                mostrarToast(`❌ Error: ${err.message}`, 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function importarTickets() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.name.toLowerCase().endsWith('.json')) { mostrarToast('❌ Archivo debe ser .json', 'error'); return; }
        const reader = new FileReader();
        reader.onload = event => {
            try {
                const imported = JSON.parse(event.target.result);
                if (!Array.isArray(imported) || imported.length === 0) { throw new Error('Archivo inválido'); }
                const existing = JSON.parse(localStorage.getItem('tickets') || '[]');
                if (existing.length === 0) {
                    localStorage.setItem('tickets', JSON.stringify(imported));
                    cargarListaTickets(); nuevoTicket();
                    mostrarToast(`✅ Cargados ${imported.length} tickets`, 'success');
                } else {
                    if (confirm(`⚠️ Ya tienes ${existing.length} tickets.\n✅ ACEPTAR = Reemplazar TODOS\n❌ CANCELAR = Solo agregar NUEVOS`)) {
                        localStorage.setItem('tickets', JSON.stringify(imported));
                        cargarListaTickets(); nuevoTicket();
                        mostrarToast(`✅ Reemplazados por ${imported.length} tickets`, 'success');
                    } else {
                        const nuevos = imported.filter(nuevo => !existing.some(exist => exist.id === nuevo.id));
                        if (nuevos.length === 0) { mostrarToast('⚠️ Todos los tickets ya existen', 'warning'); return; }
                        const combinados = [...existing, ...nuevos];
                        localStorage.setItem('tickets', JSON.stringify(combinados));
                        cargarListaTickets(); nuevoTicket();
                        mostrarToast(`✅ Agregados ${nuevos.length} tickets nuevos<br>Total: ${combinados.length}`, 'success');
                    }
                }
                actualizarDashboardStats();
            } catch (err) { console.error('Error importar:', err); mostrarToast(`❌ Error: ${err.message}`, 'error'); }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ============================================
// FUNCIONES DE COPIADO MEJORADAS CON ACTUALIZACIÓN DE TIEMPOS
// ============================================
function generarCronologiaTXT() {
    const btn = document.querySelector('.cronologia-btn');
    const originalHTML = btn.innerHTML;
    const fechaAfectacion = obtenerFechaAfectacion();
    if (!fechaAfectacion) { mostrarToast('⚠️ Debe definir la "Fecha y hora de afectación" para generar la cronología', 'warning'); document.getElementById('fechaAfectacion').focus(); return; }
    const ticketIdEl = document.getElementById('ticketId');
    if (!ticketIdEl.value.trim()) { mostrarToast('⚠️ Debe ingresar el ID del ticket para generar la cronología', 'warning'); ticketIdEl.focus(); return; }

    // ACTUALIZAR PLANTILLA PRIMERO PARA OBTENER TIEMPOS ACTUALES
    actualizarPlantilla();

    const ahora = ticketResuelto ? fechaResolucion : new Date();
    const { activeTime, suspendedTime, totalTime } = calculateActiveAndSuspendedTime(fechaAfectacion, avancesArray, ahora);
    const fechaAfectacionStr = fechaAfectacion.toLocaleString('es-EC', { timeZone: 'America/Guayaquil', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
    const fechaGeneracion = ahora.toLocaleString('es-EC', { timeZone: 'America/Guayaquil', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    let historialFormateado = '';
    if (avancesArray.length === 0) { historialFormateado = '  Sin avances registrados\n'; }
    else {
        historialFormateado = avancesArray.map((avance, index) => {
            const fechaStr = avance.timestamp.toLocaleString('es-EC', { timeZone: 'America/Guayaquil', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
            let icono = '•';
            if (avance.tipo === 'suspension') icono = '⏸️';
            else if (avance.tipo === 'reanudacion') icono = '▶️';
            else if (avance.tipo === 'resuelto') icono = '✅';
            const indicadorEdicion = avance.editado ? ' ✏️' : '';
            return `${index + 1}. ${icono} [${fechaStr}] ${avance.texto}${indicadorEdicion}`;
        }).join('\n');
    }

    const ticketsSecundariosValor = document.getElementById('ticketSecundarios').value.trim();
    const ticketsSecundariosFormato = ticketsSecundariosValor ? ticketsSecundariosValor.split(/[\n,]+/).map(t => t.trim()).filter(t => t.length > 0).map(t => `- ${t}`).join('\n') : '   - Ninguno';

    const contenido = `╔══════════════════════════════════════════════════════════════════════════════╗
║ CRONOLOGÍA DETALLADA DEL TICKET - INFORME SLA COMPLETO
╚══════════════════════════════════════════════════════════════════════════════╝
ID Ticket        : ${ticketIdEl.value}
Tramo afectado   : ${document.getElementById('tramo').value || 'No especificado'}
${obtenerHostnamePuertosTexto().split('\n').map(l => 'Hostname/Puertos : ' + l).join('\n')}
Fecha afectación : ${fechaAfectacionStr} (GMT-5)
Estado actual    : ${ticketResuelto ? 'RESUELTO' : (ticketSuspendido ? 'SUSPENDIDO' : 'EN PROGRESO')}
${ticketResuelto ? `Fecha resolución : ${fechaResolucion.toLocaleString('es-EC', { timeZone: 'America/Guayaquil', hour12: false })} (GMT-5)` : ''}
┌──────────────────────────────────────────────────────────────────────────────┐
│ TIEMPOS SLA CALCULADOS DESDE LA FECHA DE AFECTACIÓN
├──────────────────────────────────────────────────────────────────────────────┤
│ Tiempo total transcurrido : ${formatear(totalTime)}
│ Tiempo en progreso        : ${formatear(activeTime)}
│ Tiempo suspendido         : ${formatear(suspendedTime)}
│ ${ticketResuelto ? '* Ticket resuelto - tiempos finales congelados' : ''}
└──────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────┐
│ HISTORIAL DE AVANCES (orden cronológico)
├──────────────────────────────────────────────────────────────────────────────┤
${historialFormateado || '  Sin avances registrados'}
└──────────────────────────────────────────────────────────────────────────────┘
Generado el: ${fechaGeneracion} (GMT-5) | Sistema de gestión de incidencias v2.9
╔══════════════════════════════════════════════════════════════════════════════╗
║ Nota SLA: Los tiempos se calculan exclusivamente desde la fecha de afectación
║ considerando todos los eventos de suspensión y reanudación.
║ El tiempo suspendido se excluye del cómputo para el cumplimiento del SLA.
${ticketResuelto ? '║ Ticket resuelto - tiempos finales congelados en la fecha de resolución.' : ''}
╚══════════════════════════════════════════════════════════════════════════════╝`;
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `cronologia_ticket_${ticketIdEl.value.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);

    mostrarToast(`✅ Cronología generada y descargada: ${a.download}`, 'success');

    // Feedback visual en el botón
    btn.innerHTML = '✅ ¡Descargado!';
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.transform = '';
    }, 2000);
}

function copiarCronologia() {
    const btn = document.querySelector('.copiar-cronologia-btn');
    const originalHTML = btn.innerHTML;
    const originalClasses = btn.className;
    const fechaAfectacion = obtenerFechaAfectacion();
    if (!fechaAfectacion) { mostrarToast('⚠️ Debe definir la "Fecha y hora de afectación" para generar la cronología', 'warning'); document.getElementById('fechaAfectacion').focus(); return; }
    const ticketIdEl = document.getElementById('ticketId');
    if (!ticketIdEl.value.trim()) { mostrarToast('⚠️ Debe ingresar el ID del ticket para generar la cronología', 'warning'); ticketIdEl.focus(); return; }

    // ACTUALIZAR PLANTILLA PRIMERO PARA OBTENER TIEMPOS ACTUALES
    actualizarPlantilla();

    const ahora = ticketResuelto ? fechaResolucion : new Date();
    const { activeTime, suspendedTime, totalTime } = calculateActiveAndSuspendedTime(fechaAfectacion, avancesArray, ahora);
    const fechaAfectacionStr = fechaAfectacion.toLocaleString('es-EC', { timeZone: 'America/Guayaquil', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
    const fechaGeneracion = ahora.toLocaleString('es-EC', { timeZone: 'America/Guayaquil', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    let historialFormateado = '';
    if (avancesArray.length === 0) { historialFormateado = '  Sin avances registrados\n'; }
    else {
        historialFormateado = avancesArray.map((avance, index) => {
            const fechaStr = avance.timestamp.toLocaleString('es-EC', { timeZone: 'America/Guayaquil', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
            let icono = '•';
            if (avance.tipo === 'suspension') icono = '⏸️';
            else if (avance.tipo === 'reanudacion') icono = '▶️';
            else if (avance.tipo === 'resuelto') icono = '✅';
            const indicadorEdicion = avance.editado ? ' ✏️' : '';
            return `${index + 1}. ${icono} [${fechaStr}] ${avance.texto}${indicadorEdicion}`;
        }).join('\n');
    }

    const contenidoCronologia = `╔══════════════════════════════════════════════════════════════════════════════╗
║ CRONOLOGÍA DETALLADA DEL TICKET - INFORME SLA COMPLETO
╚══════════════════════════════════════════════════════════════════════════════╝
ID Ticket        : ${ticketIdEl.value}
Tramo afectado   : ${document.getElementById('tramo').value || 'No especificado'}
${obtenerHostnamePuertosTexto().split('\n').map(l => 'Hostname/Puertos : ' + l).join('\n')}
Fecha afectación : ${fechaAfectacionStr} (GMT-5)
Estado actual    : ${ticketResuelto ? 'RESUELTO' : (ticketSuspendido ? 'SUSPENDIDO' : 'EN PROGRESO')}
${ticketResuelto ? `Fecha resolución : ${fechaResolucion.toLocaleString('es-EC', { timeZone: 'America/Guayaquil', hour12: false })} (GMT-5)` : ''}
┌──────────────────────────────────────────────────────────────────────────────┐
│ TIEMPOS SLA CALCULADOS DESDE LA FECHA DE AFECTACIÓN
├──────────────────────────────────────────────────────────────────────────────┤
│ Tiempo total transcurrido : ${formatear(totalTime)}
│ Tiempo en progreso        : ${formatear(activeTime)}
│ Tiempo suspendido         : ${formatear(suspendedTime)}
│ ${ticketResuelto ? '* Ticket resuelto - tiempos congelados en la fecha de resolución' : ''}
└──────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────┐
│ HISTORIAL DE AVANCES (orden cronológico)
├──────────────────────────────────────────────────────────────────────────────┤
${historialFormateado}
└──────────────────────────────────────────────────────────────────────────────┘
Generado el: ${fechaGeneracion} (GMT-5) | Sistema de gestión de incidencias v2.9
╔══════════════════════════════════════════════════════════════════════════════╗
║ Nota SLA: Los tiempos se calculan exclusivamente desde la fecha de afectación
║ considerando todos los eventos de suspensión y reanudación.
║ El tiempo suspendido se excluye del cómputo para el cumplimiento del SLA.
${ticketResuelto ? '║ Ticket resuelto - tiempos finales en la fecha de resolución.' : ''}
╚══════════════════════════════════════════════════════════════════════════════╝`;
    navigator.clipboard.writeText(contenidoCronologia).then(() => {
        mostrarFeedbackExito(btn, originalHTML, originalClasses, '✅ ¡Cronología Copiada!');
    }).catch(err => {
        console.error('Error al copiar:', err);
        mostrarToast('❌ Error al copiar al portapapeles', 'error');
        btn.innerHTML = originalHTML;
        btn.className = originalClasses;
    });
}

// ============================================
// FUNCIÓN SIMPLIFICADA PARA CONTAR TICKETS SECUNDARIOS
// ============================================
function analizarTicketsSecundarios(textoTickets) {
    if (!textoTickets || !textoTickets.trim()) {
        return {
            resumen: 'No hay tickets secundarios registrados',
            total: 0
        };
    }

    // Dividir por líneas o comas
    const lineas = textoTickets.split(/[\n,]+/).map(t => t.trim()).filter(t => t.length > 0);

    // Simplemente contar cuántos tickets hay
    const totalTickets = lineas.length;

    // Construir resumen simple
    let resumen = totalTickets > 0 ? `${totalTickets} ticket${totalTickets > 1 ? 's' : ''} secundario${totalTickets > 1 ? 's' : ''}` : 'No hay tickets secundarios';

    return {
        resumen: resumen,
        total: totalTickets
    };
}

// ============================================
// FUNCIÓN PARA OBTENER ÚLTIMO AVANCE (SOLO TEXTO)
// ============================================
function obtenerUltimoAvanceTexto() {
    if (avancesArray.length === 0) {
        return null;
    }
    // Obtener el último avance ordenado por timestamp
    const avancesOrdenados = [...avancesArray].sort((a, b) => b.timestamp - a.timestamp);
    const ultimoAvance = avancesOrdenados[0];

    // Excluir avances de sistema (suspensión, reanudación, resuelto)
    if (ultimoAvance.tipo === 'suspension' || ultimoAvance.tipo === 'reanudacion' || ultimoAvance.tipo === 'resuelto' || ultimoAvance.tipo === 'sistema') {
        // Si el último es de sistema, buscar el último avance de operador
        const avanceOperador = avancesOrdenados.find(av => av.tipo === 'normal' || av.tipo === undefined);
        return avanceOperador ? avanceOperador.texto : null;
    }

    return ultimoAvance.texto;
}

function copiarResumen1() {
    const btn = document.querySelector('.btn-resumen-1');
    const originalHTML = btn.innerHTML;
    const originalClasses = btn.className;
    const ticketIdEl = document.getElementById('ticketId');
    const tramoEl = document.getElementById('tramo');
    const redAfectadaEl = document.getElementById('redAfectada');
    const onnetEl = document.getElementById('onnet');
    const offnetEl = document.getElementById('offnet');
    const paisEl = document.getElementById('pais');
    const ticketSecundariosEl = document.getElementById('ticketSecundarios');

    if (!ticketIdEl.value.trim()) {
        mostrarToast('⚠️ Debe ingresar el ID del ticket', 'warning');
        ticketIdEl.focus();
        return;
    }

    const fechaAfectacion = obtenerFechaAfectacion();
    if (!fechaAfectacion) {
        mostrarToast('⚠️ Debe definir la "Fecha y hora de afectación"', 'warning');
        document.getElementById('fechaAfectacion').focus();
        return;
    }

    // ACTUALIZAR PLANTILLA PRIMERO PARA OBTENER TIEMPOS ACTUALES
    actualizarPlantilla();

    // Obtener estado
    let estadoTexto = 'En Progreso';
    if (ticketResuelto) estadoTexto = 'Resuelto';
    else if (ticketSuspendido) estadoTexto = 'Suspendido';

    // Fechas formateadas
    const fechaAfectacionStr = fechaAfectacion.toLocaleString('es-EC', {
        timeZone: 'America/Guayaquil',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    let fechaResolucionStr = '';
    if (ticketResuelto && fechaResolucion) {
        fechaResolucionStr = fechaResolucion.toLocaleString('es-EC', {
            timeZone: 'America/Guayaquil',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    // TIEMPOS SLA ACTUALIZADOS
    const ahora = ticketResuelto ? fechaResolucion : new Date();
    const { activeTime, suspendedTime, totalTime } = calculateActiveAndSuspendedTime(fechaAfectacion, avancesArray, ahora);

    // ANALIZAR TICKETS SECUNDARIOS (VERSIÓN SIMPLIFICADA)
    const ticketsSecundariosTexto = ticketSecundariosEl.value.trim();
    let analisisTickets = analizarTicketsSecundarios(ticketsSecundariosTexto);

    // Construir resumen
    let resumen = `Ticket: ${ticketIdEl.value}`;
    resumen += `\nEstado: ${estadoTexto}`;
    resumen += `\nTramo: ${tramoEl.value || 'No especificado'}`;
    resumen += `\nRed afectada: ${redAfectadaEl.value || 'No especificada'}`;
    resumen += `\nFecha de afectación (GMT-5): ${fechaAfectacionStr}`;

    if (fechaResolucionStr) {
        resumen += `\nFecha de resolución (GMT-5): ${fechaResolucionStr}`;
    }

    resumen += `\n----------------------------------------`;
    resumen += `\nTIEMPOS SLA (ACTUALIZADOS):`;
    resumen += `\nTiempo en progreso: ${formatear(activeTime)}`;
    resumen += `\nTiempo suspendido: ${formatear(suspendedTime)}`;
    resumen += `\nTiempo total transcurrido: ${formatear(totalTime)}`;

    if (ticketResuelto) {
        resumen += `\n⚠️ TICKET RESUELTO ⚠️`;
    }

    resumen += `\n----------------------------------------`;
    resumen += `\nRed Onnet: ${onnetEl.value || 'No especificado'}`;
    resumen += `\nProveedor Offnet: ${offnetEl.value || 'No especificado'}`;
    resumen += `\nPaís: ${paisEl.value || 'No especificado'}`;
    resumen += `\n----------------------------------------`;
    resumen += `\nINFORMACIÓN ADICIONAL:`;
    resumen += `\ntickets secundarios: ${analisisTickets.total}`;

    // Copiar al portapapeles
    navigator.clipboard.writeText(resumen).then(() => {
        mostrarFeedbackExito(btn, originalHTML, originalClasses, '✅ ¡Resumen 1 Copiado!');
    }).catch(err => {
        console.error('Error al copiar:', err);
        mostrarToast('❌ Error al copiar al portapapeles', 'error');
        btn.innerHTML = originalHTML;
        btn.className = originalClasses;
    });
}

function copiarResumen2() {
    const btn = document.querySelector('.btn-resumen-2');
    const originalHTML = btn.innerHTML;
    const originalClasses = btn.className;
    const ticketIdEl = document.getElementById('ticketId');
    const tramoEl = document.getElementById('tramo');
    const redAfectadaEl = document.getElementById('redAfectada');
    const onnetEl = document.getElementById('onnet');
    const offnetEl = document.getElementById('offnet');
    const paisEl = document.getElementById('pais');
    const ticketSecundariosEl = document.getElementById('ticketSecundarios');
    const impactoEl = document.getElementById('impacto');
    const diagnosticoEl = document.getElementById('diagnostico');
    const accionesAdicionalesEl = document.getElementById('accionesAdicionales');

    if (!ticketIdEl.value.trim()) {
        mostrarToast('⚠️ Debe ingresar el ID del ticket', 'warning');
        ticketIdEl.focus();
        return;
    }

    const fechaAfectacion = obtenerFechaAfectacion();
    if (!fechaAfectacion) {
        mostrarToast('⚠️ Debe definir la "Fecha y hora de afectación"', 'warning');
        document.getElementById('fechaAfectacion').focus();
        return;
    }

    // ACTUALIZAR PLANTILLA PRIMERO PARA OBTENER TIEMPOS ACTUALES
    actualizarPlantilla();

    // Obtener estado
    let estadoTexto = 'En Progreso';
    if (ticketResuelto) estadoTexto = 'Resuelto';
    else if (ticketSuspendido) estadoTexto = 'Suspendido';

    // Fechas formateadas
    const fechaAfectacionStr = fechaAfectacion.toLocaleString('es-EC', {
        timeZone: 'America/Guayaquil',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    // TIEMPOS SLA ACTUALIZADOS
    const ahora = ticketResuelto ? fechaResolucion : new Date();
    const { activeTime, suspendedTime, totalTime } = calculateActiveAndSuspendedTime(fechaAfectacion, avancesArray, ahora);

    // ANALIZAR TICKETS SECUNDARIOS (VERSIÓN SIMPLIFICADA)
    const ticketsSecundariosTexto = ticketSecundariosEl.value.trim();
    let analisisTickets = analizarTicketsSecundarios(ticketsSecundariosTexto);

    // OBTENER ÚLTIMO AVANCE (SOLO TEXTO, SIN FECHA)
    const ultimoAvanceTexto = obtenerUltimoAvanceTexto();

    // Construir resumen
    let resumen = `Ticket: ${ticketIdEl.value}`;
    resumen += `\nEstado: ${estadoTexto}`;
    resumen += `\nTramo: ${tramoEl.value || 'No especificado'}`;
    resumen += `\nRed afectada: ${redAfectadaEl.value || 'No especificada'}`;
    resumen += `\nFecha de afectación (GMT-5): ${fechaAfectacionStr}`;
    resumen += `\n----------------------------------------`;
    resumen += `\nTIEMPOS SLA (ACTUALIZADOS):`;
    resumen += `\nTiempo en progreso: ${formatear(activeTime)}`;
    resumen += `\nTiempo suspendido: ${formatear(suspendedTime)}`;
    resumen += `\nTiempo total transcurrido: ${formatear(totalTime)}`;
    resumen += `\n----------------------------------------`;
    resumen += `\nRed Onnet: ${onnetEl.value || 'No especificado'}`;
    resumen += `\nProveedor Offnet: ${offnetEl.value || 'No especificado'}`;
    resumen += `\nPaís: ${paisEl.value || 'No especificado'}`;
    resumen += `\n----------------------------------------`;
    resumen += `\nINFORMACIÓN ADICIONAL:`;
    resumen += `\ntickets secundarios: ${analisisTickets.total}`;
    if (impactoEl.value.trim()) {
        resumen += `\nImpacto: ${impactoEl.value}`;
    }
    resumen += `\n----------------------------------------`;

    if (diagnosticoEl.value.trim()) {
        resumen += `\nDIAGNÓSTICO INICIAL:`;
        resumen += `\n${diagnosticoEl.value}`;

    }
    resumen += `\n----------------------------------------`;

    // ETR
    const noEtrCheck = document.getElementById('noEtrCheck');
    let etrTxt = 'No definido';
    if (!noEtrCheck.checked) {
        const horas = parseInt(document.getElementById('etrHoras').value) || 0;
        const minutos = parseInt(document.getElementById('etrMinutos').value) || 0;
        if (horas > 0 || minutos > 0) {
            etrTxt = `${horas}h ${minutos}m`;
        }
    }
    resumen += `\nETR: ${etrTxt}`;

    resumen += `\n----------------------------------------`;

    // AGREGAR ÚLTIMO AVANCE (SOLO EN RESUMEN 2)
    if (ultimoAvanceTexto) {
        resumen += `\nÚLTIMO AVANCE:`;
        resumen += `\n${ultimoAvanceTexto}`;
        resumen += `\n----------------------------------------`;
    }







    // Copiar al portapapeles
    navigator.clipboard.writeText(resumen).then(() => {
        mostrarFeedbackExito(btn, originalHTML, originalClasses, '✅ ¡Resumen 2 Copiado!');
    }).catch(err => {
        console.error('Error al copiar:', err);
        mostrarToast('❌ Error al copiar al portapapeles', 'error');
        btn.innerHTML = originalHTML;
        btn.className = originalClasses;
    });
}

document.addEventListener('DOMContentLoaded', function () {
    inicializarHostnamePuertos();
    cargarListaTickets();
    actualizarDashboardStats();
    const ultimoTicketId = localStorage.getItem('ultimoTicketActivo');
    if (ultimoTicketId) {
        const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
        const existe = tickets.find(t => t.id == ultimoTicketId);
        if (existe) { cargarTicket(ultimoTicketId); }
    }
});
