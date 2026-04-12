:root {
--bg-primary: linear-gradient(to bottom, #e9ecef, #f8f9fa);
--bg-card: white;
--text-primary: #212529;
--text-secondary: #6c757d;
--border-color: #e9ecef;
--card-shadow: 0 8px 24px rgba(0,0,0,0.08);
--input-bg: white;
--input-border: #ced4da;
--input-placeholder: #6c757d;
--avance-bg: white;
--avance-border: #e9ecef;
--avance-suspension-bg: #fff0f0;
--avance-suspension-border: #f8d7da;
--avance-reanudacion-bg: #f0fff0;
--avance-reanudacion-border: #d4edda;
--avance-sistema-bg: #e7f3ff;
--avance-sistema-border: #b8daff;
--time-container-bg: linear-gradient(120deg, #1e3c72, #2a5298);
--alert-gmt5-bg: linear-gradient(135deg, #1d4350, #2b6974);
--acciones-bg: #e3f2fd;
--new-fields-bg: #f0f7ff;
--toast-success-bg: linear-gradient(135deg, #10b981, #0ea5e9);
--toast-error-bg: linear-gradient(135deg, #ef4444, #f97316);
--suspension-manual-bg: #fff8f8;
--suspension-manual-border: #f5c6cb;
--progreso-manual-bg: #f8fff8;
--progreso-manual-border: #c3e6cb;
--cronologia-btn-bg: linear-gradient(135deg, #0ea5e9, #0d9488);
--sla-report-bg: linear-gradient(135deg, #7e3af2, #4f46e5);
--resuelto-badge-bg: #4ade80;
--resuelto-indicator-bg: #4ade80;
--reason-textarea-bg: #f8fdff;
--reason-textarea-border: #bae6fd;
}
[data-bs-theme="dark"] {
--bg-primary: linear-gradient(to bottom, #0f172a, #0a0f1d);
--bg-card: #1e293b;
--text-primary: #f1f5f9;
--text-secondary: #94a3b8;
--border-color: #334155;
--card-shadow: 0 8px 24px rgba(0,0,0,0.35);
--input-bg: #1e293b;
--input-border: #334155;
--input-placeholder: #64748b;
--avance-bg: #1e293b;
--avance-border: #334155;
--avance-suspension-bg: #2a1a1a;
--avance-suspension-border: #4a2a2a;
--avance-reanudacion-bg: #1a2a1a;
--avance-reanudacion-border: #2a4a2a;
--avance-sistema-bg: #1a253a;
--avance-sistema-border: #2a3a5a;
--time-container-bg: linear-gradient(120deg, #0f172a, #1e293b);
--alert-gmt5-bg: linear-gradient(135deg, #0a1a25, #0f2535);
--acciones-bg: #1a253a;
--new-fields-bg: #1a2233;
--toast-success-bg: linear-gradient(135deg, #0ea5e9, #10b981);
--toast-error-bg: linear-gradient(135deg, #f97316, #ef4444);
--suspension-manual-bg: #2a1a1a;
--suspension-manual-border: #4a2a2a;
--progreso-manual-bg: #1a2a1a;
--progreso-manual-border: #2a4a2a;
--cronologia-btn-bg: linear-gradient(135deg, #0ea5e9, #0f766e);
--sla-report-bg: linear-gradient(135deg, #6d28d9, #4f46e5);
--resuelto-badge-bg: #4ade80;
--resuelto-indicator-bg: #4ade80;
--reason-textarea-bg: #0c1a33;
--reason-textarea-border: #334155;
}
body {
background: var(--bg-primary);
padding: 25px;
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
color: var(--text-primary);
transition: background-color 0.3s, color 0.3s;
min-height: 100vh;
}
body::before {
content: '';
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background: var(--bg-primary);
z-index: -2;
transition: background 0.3s ease;
}
body::after {
content: '';
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background:
radial-gradient(circle at 10% 20%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 25%),
radial-gradient(circle at 90% 80%, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 30%);
z-index: -1;
transition: opacity 0.3s ease;
opacity: 0.7;
}
h1 {
color: #0d6efd;
font-weight: 600;
text-shadow: 1px 1px 3px rgba(0,0,0,0.1);
margin-bottom: 10px;
}
[data-bs-theme="dark"] h1 {
color: #60a5fa;
text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
}
.subtitle {
color: var(--text-secondary);
font-size: 1.1rem;
margin-bottom: 30px;
}
.dashboard-stats {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
gap: 20px;
margin-bottom: 30px;
animation: slideDown 0.5s ease;
}
@keyframes slideDown {
from { opacity: 0; transform: translateY(-20px); }
to { opacity: 1; transform: translateY(0); }
}
.stat-card {
background: var(--bg-card);
border-radius: 16px;
padding: 20px;
display: flex;
align-items: center;
gap: 15px;
box-shadow: var(--card-shadow);
transition: all 0.3s ease;
border: 1px solid var(--border-color);
}
.stat-card:hover {
transform: translateY(-5px);
box-shadow: 0 12px 30px rgba(0,0,0,0.15);
}
.stat-icon {
width: 60px;
height: 60px;
border-radius: 12px;
display: flex;
align-items: center;
justify-content: center;
font-size: 1.8rem;
color: white;
}
.stat-icon.bg-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.bg-success { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-icon.bg-warning { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
.stat-icon.bg-info { background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); }
.stat-content h3 {
font-size: 2rem;
font-weight: 700;
margin: 0;
color: var(--text-primary);
}
.stat-content p {
margin: 0;
color: var(--text-secondary);
font-size: 0.9rem;
}
.ticket-en-curso-container {
animation: slideDown 0.5s ease;
}
.ticket-en-curso-container .card {
border-left: 4px solid #0d6efd;
background: linear-gradient(135deg, #f8f9fa, #ffffff);
}
[data-bs-theme="dark"] .ticket-en-curso-container .card {
background: linear-gradient(135deg, #1e293b, #0f172a);
border-left-color: #3b82f6;
}
.ticket-en-curso-container h5 {
color: #0d6efd;
font-weight: 600;
}
[data-bs-theme="dark"] .ticket-en-curso-container h5 {
color: #60a5fa;
}
.container-grid {
display: grid;
grid-template-columns: 2fr 1fr;
gap: 24px;
max-width: 1400px;
margin: auto;
}
.card {
border: none;
border-radius: 16px;
box-shadow: var(--card-shadow);
overflow: hidden;
transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s;
background-color: var(--bg-card);
}
.card:hover {
transform: translateY(-5px);
box-shadow: 0 12px 30px rgba(0,0,0,0.2);
}
.ticket-dropdown-container {
width: 100%;
padding: 10px;
}
.ticket-dropdown {
width: 100%;
padding: 12px 16px;
border-radius: 10px;
border: 2px solid var(--input-border);
background-color: var(--input-bg);
color: var(--text-primary);
font-size: 1rem;
font-weight: 500;
cursor: pointer;
transition: all 0.3s ease;
box-shadow: 0 2px 8px rgba(0,0,0,0.1);
appearance: none;
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230d6efd' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
background-repeat: no-repeat;
background-position: right 16px center;
padding-right: 40px;
}
.ticket-dropdown:hover {
border-color: #0d6efd;
box-shadow: 0 4px 12px rgba(13, 110, 253, 0.2);
}
.ticket-dropdown:focus {
outline: none;
border-color: #0d6efd;
box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
}
.ticket-activo-option { color: #198754; }
.ticket-suspendido-option { color: #dc3545; }
.ticket-resuelto-option { color: #6c757d; }
.ticket-escalonado-option { color: #fd7e14; }
.ticket-restablecido-option { color: #0d6efd; }
[data-bs-theme="dark"] .ticket-dropdown {
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2360a5fa' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
}
#ticketSecundarios {
min-height: 76px;
resize: vertical;
font-family: 'Courier New', monospace;
font-size: 0.95rem;
}
.form-section {
margin-bottom: 1.5rem;
padding-bottom: 1.5rem;
border-bottom: 1px solid var(--border-color);
}
.form-section:last-child {
border-bottom: none;
margin-bottom: 0;
padding-bottom: 0;
}
.ticket-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 1.5rem;
padding-bottom: 1rem;
border-bottom: 2px solid var(--border-color);
}
.suspension-indicator {
background: #e74c3c;
color: white;
padding: 4px 12px;
border-radius: 20px;
font-weight: 500;
display: inline-flex;
align-items: center;
gap: 6px;
box-shadow: 0 2px 6px rgba(0,0,0,0.15);
animation: pulse 2s infinite;
}
.resuelto-indicator {
background: var(--resuelto-indicator-bg);
color: #0f172a;
padding: 4px 12px;
border-radius: 20px;
font-weight: 500;
display: inline-flex;
align-items: center;
gap: 6px;
box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
@keyframes pulse {
0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
50% { opacity: 0.92; box-shadow: 0 0 0 8px rgba(255,255,255,0); }
}
pre {
background: var(--input-bg);
border-radius: 12px;
padding: 16px;
font-size: 0.95rem;
border-left: 4px solid #0d6efd;
line-height: 1.5;
max-height: 300px;
overflow: auto;
margin-top: 10px;
white-space: pre-wrap;
color: var(--text-primary);
border-color: #3b82f6;
}
[data-bs-theme="dark"] pre {
border-color: #60a5fa;
}
.add-avance-btn {
border-radius: 50px !important;
padding: 14px !important;
font-size: 1.1rem !important;
box-shadow: 0 4px 10px rgba(0,123,255,0.3);
transition: all 0.2s;
margin-top: 10px;
background: #0d6efd;
border-color: #0d6efd;
color: white;
}
.add-avance-btn:hover {
box-shadow: 0 6px 15px rgba(0,123,255,0.4);
transform: translateY(-1px);
background: #0b5ed7;
border-color: #0b5ed7;
}
.form-label {
font-weight: 600;
color: var(--text-primary);
margin-bottom: 0.5rem;
}
.form-control, .form-select {
border-radius: 10px;
padding: 10px 15px;
border: 1px solid var(--input-border);
transition: border-color 0.3s, box-shadow 0.3s;
background-color: var(--input-bg);
color: var(--text-primary);
}
.form-control::placeholder, .form-select option {
color: var(--input-placeholder);
}
.form-control:focus, .form-select:focus {
border-color: #0d6efd;
box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
background-color: var(--input-bg);
}
.empty-state {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
padding: 30px;
color: var(--text-secondary);
text-align: center;
}
.empty-state i {
font-size: 3rem;
margin-bottom: 15px;
opacity: 0.7;
}
.empty-state p {
font-size: 1.1rem;
max-width: 500px;
}
.action-buttons {
display: flex;
justify-content: center;
flex-wrap: wrap;
gap: 10px;
margin: 25px 0;
}
.btn {
border-radius: 50px;
padding: 10px 25px;
font-weight: 500;
transition: all 0.3s;
}
.btn:hover {
transform: translateY(-2px);
}
.time-container {
background: var(--time-container-bg);
color: white;
border-radius: 16px;
padding: 20px;
margin: 15px 0;
box-shadow: 0 6px 16px rgba(0,0,0,0.25);
}
.time-label {
font-size: 1.1rem;
opacity: 0.9;
margin-bottom: 8px;
display: block;
text-align: left;
padding-left: 10px;
}
.time-value {
font-size: 2.8rem;
font-weight: 700;
letter-spacing: -1.5px;
font-family: 'Courier New', monospace;
text-shadow: 0 2px 10px rgba(0,0,0,0.3);
margin: 8px 0;
text-align: center;
}
.time-detail {
font-size: 0.95rem;
opacity: 0.85;
margin-top: 5px;
text-align: center;
}
.time-section {
margin-bottom: 15px;
padding-bottom: 15px;
border-bottom: 1px solid rgba(255,255,255,0.2);
}
.time-section:last-child {
border-bottom: none;
margin-bottom: 0;
padding-bottom: 0;
}
.time-progreso { color: #4ade80; }
.time-suspendido { color: #f87171; }
.time-total { color: #fbbf24; font-size: 3.2rem; }
.alert-gmt5 {
background: var(--alert-gmt5-bg);
color: white;
border-radius: 12px;
padding: 12px 15px;
margin: 15px 0;
font-weight: 500;
display: flex;
align-items: center;
gap: 10px;
}
.acciones-container {
background: var(--acciones-bg);
border-left: 4px solid #0d6efd;
padding: 15px;
border-radius: 0 8px 8px 0;
margin: 15px 0;
}
.acciones-title {
display: flex;
align-items: center;
gap: 8px;
font-weight: 600;
color: #0a4a82;
margin-bottom: 8px;
}
[data-bs-theme="dark"] .acciones-title {
color: #60a5fa;
}
.avance-container {
display: flex;
flex-direction: column;
gap: 12px;
max-height: 240px;
overflow-y: auto;
padding: 10px 5px;
background-color: var(--input-bg);
border-radius: 10px;
}
.avance-entry {
background: var(--avance-bg);
border-radius: 12px 12px 12px 0;
padding: 12px 15px;
box-shadow: 0 2px 6px rgba(0,0,0,0.08);
max-width: 85%;
align-self: flex-end;
position: relative;
border: 1px solid var(--avance-border);
}
.avance-entry::after {
content: '';
position: absolute;
bottom: -6px;
right: 15px;
width: 12px;
height: 12px;
background: var(--avance-bg);
border-right: 1px solid var(--avance-border);
border-bottom: 1px solid var(--avance-border);
transform: rotate(45deg);
}
.avance-entry.suspension {
background-color: var(--avance-suspension-bg);
border-color: var(--avance-suspension-border);
align-self: center;
max-width: 95%;
border-radius: 12px;
}
.avance-entry.suspension::after { display: none; }
.avance-entry.reanudacion::after { display: none; }
.avance-entry.reanudacion {
background-color: var(--avance-reanudacion-bg);
border-color: var(--avance-reanudacion-border);
align-self: center;
max-width: 95%;
border-radius: 12px;
}
.avance-entry.sistema {
background-color: var(--avance-sistema-bg);
border-color: var(--avance-sistema-border);
align-self: flex-start;
border-radius: 12px 12px 0 12px;
}
.avance-entry.sistema::after {
content: '';
position: absolute;
bottom: -6px;
left: 15px;
right: auto;
width: 12px;
height: 12px;
background: var(--avance-sistema-bg);
border-left: 1px solid var(--avance-sistema-border);
border-bottom: 1px solid var(--avance-sistema-border);
transform: rotate(45deg);
}
.avance-time {
font-size: 0.75rem;
color: var(--text-secondary);
margin-bottom: 4px;
font-weight: 500;
display: flex;
justify-content: space-between;
}
.avance-texto {
line-height: 1.5;
word-wrap: break-word;
color: var(--text-primary);
}
.avance-entry.suspension .avance-texto,
.avance-entry.reanudacion .avance-texto {
font-weight: 600;
color: #f87171;
}
.avance-entry.reanudacion .avance-texto { color: #4ade80; }
.avance-entry.sistema .avance-texto { color: #60a5fa; font-style: italic; }
.avance-entry.resuelto .avance-texto { color: #4ade80; font-weight: bold; }
.export-import-container {
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
border-radius: 16px;
padding: 20px;
margin-top: 20px;
box-shadow: 0 8px 20px rgba(0,0,0,0.15);
color: white;
}
[data-bs-theme="dark"] .export-import-container {
background: linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%);
box-shadow: 0 8px 20px rgba(0,0,0,0.35);
}
.export-import-title {
display: flex;
align-items: center;
gap: 10px;
margin-bottom: 15px;
font-weight: 600;
font-size: 1.2rem;
}
.export-import-buttons {
display: flex;
gap: 15px;
justify-content: center;
flex-wrap: wrap;
}
.export-import-buttons .btn {
border-radius: 50px;
padding: 10px 25px;
font-weight: 500;
box-shadow: 0 4px 10px rgba(0,0,0,0.2);
transition: all 0.3s;
}
.export-import-buttons .btn-export {
background: #4361ee;
border-color: #4361ee;
color: white;
}
.export-import-buttons .btn-import {
background: #f72585;
border-color: #f72585;
color: white;
}
.avances-header {
display: flex;
justify-content: space-between;
align-items: center;
padding: 8px 0;
border-bottom: 1px solid var(--border-color);
margin-bottom: 10px;
}
.nuevo-avance-badge {
background: linear-gradient(135deg, #ff6b6b, #ee5a24);
color: white;
padding: 2px 10px;
border-radius: 20px;
font-size: 0.85rem;
font-weight: 500;
animation: pulse 2s infinite;
}
#themeToggle {
position: fixed;
bottom: 30px;
right: 30px;
z-index: 1000;
width: 56px;
height: 56px;
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
box-shadow: 0 4px 20px rgba(0,0,0,0.35);
transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
font-size: 1.5rem;
background: white;
color: #6c757d;
border: 2px solid #e9ecef;
cursor: pointer;
}
#themeToggle:hover {
transform: scale(1.1) rotate(20deg);
box-shadow: 0 6px 25px rgba(0,0,0,0.45);
background: #f8f9fa;
}
[data-bs-theme="dark"] #themeToggle {
background-color: #1e293b;
color: #facc15;
border: 2px solid #334155;
}
.toast-container {
position: fixed;
bottom: 100px;
right: 30px;
z-index: 1100;
max-width: 350px;
}
.toast {
border-radius: 12px;
box-shadow: 0 4px 25px rgba(0,0,0,0.35);
margin-bottom: 15px;
border: none;
opacity: 0;
transform: translateX(300px) scale(0.8);
transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
max-width: 350px;
display: flex;
align-items: center;
gap: 12px;
padding: 16px 20px;
color: white;
font-weight: 500;
}
.toast.show {
opacity: 1;
transform: translateX(0) scale(1);
}
.toast-hide {
animation: slideOutRight 0.4s ease forwards;
}
@keyframes slideOutRight {
from { transform: translateX(0); opacity: 1; }
to { transform: translateX(100%); opacity: 0; }
}
.toast-icon { font-size: 1.5rem; }
.toast-content { flex: 1; }
.toast-title { font-weight: 700; margin-bottom: 2px; }
.toast-message { font-size: 0.9rem; opacity: 0.95; }
.toast-close {
background: rgba(255, 255, 255, 0.2);
border: none;
color: white;
width: 28px;
height: 28px;
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
cursor: pointer;
transition: all 0.3s;
}
.toast-close:hover {
background: rgba(255, 255, 255, 0.3);
transform: rotate(90deg);
}
.toast-success { background: var(--toast-success-bg); }
.toast-error { background: var(--toast-error-bg); }
footer.text-center {
margin-top: 40px;
padding-top: 20px;
border-top: 1px solid var(--border-color);
}
[data-bs-theme="dark"] footer.text-center {
border-top-color: #334155;
}
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: var(--input-bg); border-radius: 10px; }
::-webkit-scrollbar-thumb { background: #6c757d; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #5a6268; }
.theme-transition {
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background: var(--bg-primary);
z-index: 9999;
display: flex;
align-items: center;
justify-content: center;
opacity: 0;
pointer-events: none;
transition: opacity 0.4s ease;
}
.theme-transition.active {
opacity: 1;
pointer-events: all;
}
.theme-transition .spinner {
width: 60px;
height: 60px;
border: 5px solid rgba(255,255,255,0.3);
border-top: 5px solid white;
border-radius: 50%;
animation: spin 1s linear infinite;
}
@keyframes spin {
0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }
}
.manual-state-section {
border-radius: 12px;
padding: 15px;
margin-top: 15px;
}
.suspension-manual-section {
background: var(--suspension-manual-bg);
border: 1px solid var(--suspension-manual-border);
}
.progreso-manual-section {
background: var(--progreso-manual-bg);
border: 1px solid var(--progreso-manual-border);
margin-top: 15px;
}
.manual-state-title {
display: flex;
align-items: center;
gap: 10px;
font-weight: 600;
margin-bottom: 12px;
font-size: 1.1rem;
}
.suspension-manual-title { color: #c0392b; }
[data-bs-theme="dark"] .suspension-manual-title { color: #f87171; }
.progreso-manual-title { color: #27ae60; }
[data-bs-theme="dark"] .progreso-manual-title { color: #4ade80; }
.manual-state-btn {
font-weight: 500;
box-shadow: 0 3px 8px rgba(0,0,0,0.2);
}
.suspension-manual-btn {
background: linear-gradient(135deg, #e74c3c, #c0392b);
border: none;
color: white;
}
.progreso-manual-btn {
background: linear-gradient(135deg, #2ecc71, #27ae60);
border: none;
color: white;
}
.cronologia-container {
display: flex;
flex-direction: column;
gap: 10px;
margin-top: 15px;
}
.cronologia-btn {
background: var(--cronologia-btn-bg) !important;
border: none !important;
color: white !important;
font-weight: 500;
box-shadow: 0 4px 12px rgba(14, 165, 233, 0.35);
transition: all 0.3s;
}
.copiar-cronologia-btn {
background: linear-gradient(135deg, #4f46e5, #7e3af2) !important;
border: none !important;
color: white !important;
font-weight: 500;
box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
transition: all 0.3s;
}
.btn-resumen-1 {
background: linear-gradient(135deg, #0ea5e9, #0d9488) !important;
border: none !important;
color: white !important;
font-weight: 500;
box-shadow: 0 4px 12px rgba(14, 165, 233, 0.35);
transition: all 0.3s;
}
.btn-resumen-1:hover {
transform: translateY(-2px);
box-shadow: 0 6px 16px rgba(14, 165, 233, 0.45);
}
[data-bs-theme="dark"] .btn-resumen-1 {
background: linear-gradient(135deg, #0ea5e9, #0f766e) !important;
}
.btn-resumen-2 {
background: linear-gradient(135deg, #f59e0b, #d97706) !important;
border: none !important;
color: white !important;
font-weight: 500;
box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);
transition: all 0.3s;
}
.btn-resumen-2:hover {
transform: translateY(-2px);
box-shadow: 0 6px 16px rgba(245, 158, 11, 0.45);
}
[data-bs-theme="dark"] .btn-resumen-2 {
background: linear-gradient(135deg, #d97706, #b45309) !important;
}
.manual-avance-section {
background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
border-radius: 12px;
padding: 15px;
margin-top: 15px;
border: 1px solid #bae6fd;
}
[data-bs-theme="dark"] .manual-avance-section {
background: linear-gradient(135deg, #0c1a33, #1e293b);
border: 1px solid #334155;
}
.manual-avance-title {
display: flex;
align-items: center;
gap: 10px;
font-weight: 600;
margin-bottom: 12px;
color: #0c4a6e;
}
[data-bs-theme="dark"] .manual-avance-title {
color: #93c5fd;
}
.sla-report-container {
background: var(--sla-report-bg);
border-radius: 16px;
padding: 20px;
margin-top: 20px;
box-shadow: 0 8px 20px rgba(0,0,0,0.25);
color: white;
}
.sla-report-title {
display: flex;
align-items: center;
gap: 10px;
margin-bottom: 15px;
font-weight: 600;
font-size: 1.3rem;
}
.sla-report-item {
display: flex;
justify-content: space-between;
padding: 8px 0;
border-bottom: 1px solid rgba(255,255,255,0.2);
}
.sla-report-item:last-child {
border-bottom: none;
font-weight: 600;
font-size: 1.1rem;
}
.sla-progreso { color: #4ade80; }
.sla-suspendido { color: #f87171; }
.sla-total { color: #fbbf24; }
.input-group-datetime {
display: flex;
gap: 8px;
align-items: stretch;
margin-bottom: 12px;
}
.input-group-datetime input {
border-radius: 8px 0 0 8px !important;
flex: 1;
font-family: 'Courier New', monospace;
font-size: 1.05rem;
cursor: pointer;
}
.input-group-datetime .btn-calendar,
.input-group-datetime .btn-now {
border-radius: 0 8px 8px 0 !important;
background: linear-gradient(135deg, #3b82f6, #2563eb);
border: 1px solid #2563eb;
color: white;
padding: 0 15px;
transition: all 0.2s;
min-width: 42px;
display: flex;
align-items: center;
justify-content: center;
}
.input-group-datetime .btn-now {
border-radius: 8px !important;
background: linear-gradient(135deg, #10b981, #059669);
border-color: #059669;
min-width: 42px;
}
.input-group-datetime .btn-calendar:hover,
.input-group-datetime .btn-now:hover {
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.input-group-datetime .btn-calendar:disabled,
.input-group-datetime .btn-now:disabled {
opacity: 0.5;
cursor: not-allowed;
transform: none;
}
.input-datetime-text::placeholder {
color: #64748b;
font-style: italic;
font-family: 'Courier New', monospace;
opacity: 0.85;
}
[data-bs-theme="dark"] .input-datetime-text::placeholder {
color: #94a3b8;
}
.input-format-error {
border-color: #ef4444 !important;
box-shadow: 0 0 0 0.2rem rgba(239, 68, 68, 0.25) !important;
background-color: #fff1f1 !important;
}
[data-bs-theme="dark"] .input-format-error {
background-color: #2a1a1a !important;
}
.format-label {
font-size: 0.82rem;
color: #64748b;
margin-top: 4px;
display: block;
text-align: right;
font-family: monospace;
}
[data-bs-theme="dark"] .format-label {
color: #94a3b8;
}
.etr-section {
margin-top: 15px;
border-radius: 12px;
overflow: hidden;
background: linear-gradient(135deg, #f8f9fa, #e9ecef) !important;
border: 1px solid #dee2e6 !important;
}
[data-bs-theme="dark"] .etr-section {
background: linear-gradient(135deg, #1e293b, #0f172a) !important;
border-color: #334155 !important;
}
.etr-inputs-container {
display: flex;
gap: 15px;
align-items: stretch;
flex-wrap: nowrap;
}
.etr-input-group {
flex: 1;
min-width: 0;
}
.etr-input-group .input-group {
width: 100%;
}
.etr-input-group .input-group-text {
background: linear-gradient(135deg, #0d6efd, #0dcaf0);
font-weight: 600;
white-space: nowrap;
min-width: 80px;
color: white;
border: none;
}
[data-bs-theme="dark"] .etr-input-group .input-group-text {
background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}
.etr-input-group input[type="number"] {
text-align: center;
font-weight: 600;
font-size: 1.1rem;
border-left: none;
}
.etr-input-group input[type="number"]:focus {
box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
.etr-input-group input[type="number"]::-webkit-inner-spin-button,
.etr-input-group input[type="number"]::-webkit-outer-spin-button {
opacity: 1;
}
.no-etr-check {
margin-top: 8px;
margin-bottom: 12px;
padding: 12px;
background: linear-gradient(135deg, #fff8e1, #ffe0b2);
border-radius: 8px;
border-left: 4px solid #ffc107;
}
[data-bs-theme="dark"] .no-etr-check {
background: linear-gradient(135deg, #3a2d0f, #4a3a1f);
border-left-color: #d4a017;
}
.etr-contador-container {
background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
border: 2px solid #bae6fd;
border-radius: 12px;
padding: 20px;
margin-top: 15px;
text-align: center;
animation: slideDown 0.5s ease;
}
[data-bs-theme="dark"] .etr-contador-container {
background: linear-gradient(135deg, #0c1a33, #1e293b);
border-color: #334155;
}
.etr-contador-label {
font-size: 0.95rem;
color: #0c4a6e;
margin-bottom: 10px;
display: flex;
align-items: center;
justify-content: center;
gap: 8px;
font-weight: 600;
}
[data-bs-theme="dark"] .etr-contador-label {
color: #93c5fd;
}
.etr-contador-tiempo {
font-size: 3rem;
font-weight: 700;
font-family: 'Courier New', monospace;
color: #0ea5e9;
letter-spacing: -2px;
margin: 10px 0;
text-shadow: 0 2px 10px rgba(14, 165, 233, 0.3);
}
[data-bs-theme="dark"] .etr-contador-tiempo {
color: #38bdf8;
}
.etr-contador-tiempo.expired {
color: #ef4444;
animation: pulse 1s infinite;
}
.etr-contador-tiempo.warning {
color: #f59e0b;
}
.etr-contador-barra {
width: 100%;
height: 12px;
background: #e2e8f0;
border-radius: 6px;
overflow: hidden;
margin: 15px 0;
position: relative;
}
[data-bs-theme="dark"] .etr-contador-barra {
background: #334155;
}
.etr-contador-progreso {
height: 100%;
background: linear-gradient(90deg, #10b981, #0ea5e9);
border-radius: 6px;
transition: width 1s linear, background 0.3s;
width: 100%;
}
.etr-contador-progreso.warning {
background: linear-gradient(90deg, #f59e0b, #f97316);
}
.etr-contador-progreso.expired {
background: linear-gradient(90deg, #ef4444, #dc2626);
}
.etr-contador-estado {
font-size: 0.9rem;
font-weight: 600;
padding: 6px 16px;
border-radius: 20px;
display: inline-block;
background: #d1fae5;
color: #059669;
}
.etr-contador-estado.warning {
background: #fef3c7;
color: #d97706;
}
.etr-contador-estado.expired {
background: #fee2e2;
color: #dc2626;
}
[data-bs-theme="dark"] .etr-contador-estado {
background: #064e3b;
color: #6ee7b7;
}
[data-bs-theme="dark"] .etr-contador-estado.warning {
background: #422006;
color: #fcd34d;
}
[data-bs-theme="dark"] .etr-contador-estado.expired {
background: #7f1d1d;
color: #fca5a5;
}
.modal-resolution {
display: none;
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background-color: rgba(0, 0, 0, 0.6);
z-index: 2000;
justify-content: center;
align-items: center;
backdrop-filter: blur(4px);
animation: fadeIn 0.3s;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal-resolution-content {
background: var(--bg-card);
border-radius: 20px;
width: 95%;
max-width: 550px;
box-shadow: 0 15px 50px rgba(0, 0, 0, 0.4);
overflow: hidden;
transform: translateY(20px);
animation: slideUp 0.4s forwards;
}
@keyframes slideUp { to { transform: translateY(0); } }
.modal-header-resolution {
background: linear-gradient(135deg, #1e3c72, #2a5298);
color: white;
padding: 20px;
text-align: center;
}
.modal-header-resolution h3 {
margin: 0;
font-weight: 600;
display: flex;
align-items: center;
justify-content: center;
gap: 10px;
}
.modal-body-resolution { padding: 25px; }
.resolution-instruction {
background: var(--new-fields-bg);
border-left: 4px solid #4361ee;
padding: 15px;
border-radius: 0 8px 8px 0;
margin-bottom: 20px;
font-size: 0.95rem;
}
.input-resolution-container { margin: 20px 0; }
.modal-footer-resolution {
display: flex;
justify-content: center;
gap: 15px;
padding: 20px;
border-top: 1px solid var(--border-color);
}
.btn-resolution {
border-radius: 50px;
padding: 10px 30px;
font-weight: 500;
transition: all 0.3s;
min-width: 140px;
}
.btn-resolution-confirm {
background: linear-gradient(135deg, #10b981, #0ea5e9);
border: none;
color: white;
box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
}
.btn-resolution-cancel {
background: var(--input-bg);
border: 1px solid var(--input-border);
color: var(--text-primary);
}
.resolution-error {
color: #ef4444;
font-size: 0.85rem;
margin-top: 8px;
display: none;
animation: shake 0.5s;
}
@keyframes shake {
0%, 100% { transform: translateX(0); }
25% { transform: translateX(-5px); }
75% { transform: translateX(5px); }
}
#fechaAfectacionMostrada {
color: white !important;
opacity: 1 !important;
text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
.avance-actions {
display: flex;
gap: 6px;
margin-top: 6px;
opacity: 0;
transition: opacity 0.3s ease;
}
.avance-entry:hover .avance-actions { opacity: 1; }
.btn-edit-avance, .btn-delete-avance, .btn-save-edit, .btn-cancel-edit {
padding: 2px 6px;
font-size: 0.8rem;
border-radius: 4px;
border: none;
cursor: pointer;
display: flex;
align-items: center;
justify-content: center;
min-width: 28px;
}
.btn-edit-avance {
background: #e9ecef;
color: #495055;
border: 1px solid #ced4da;
}
.btn-edit-avance:hover {
background: #0d6efd;
color: white;
border-color: #0d6efd;
transform: scale(1.05);
}
.btn-delete-avance {
background: #f8f9fa;
color: #dc3545;
border: 1px solid #dee2e6;
}
.btn-delete-avance:hover {
background: #dc3545;
color: white;
border-color: #dc3545;
transform: scale(1.05);
}
.btn-save-edit {
background: #198754;
color: white;
border: none;
font-weight: 500;
}
.btn-cancel-edit {
background: #6c757d;
color: white;
border: none;
font-weight: 500;
}
.avance-edit-mode {
background: #e3f2fd !important;
border-color: #0d6efd !important;
padding: 12px !important;
border-radius: 12px !important;
box-shadow: 0 2px 8px rgba(13, 110, 253, 0.15);
}
.avance-edited-indicator {
font-size: 0.75rem;
color: var(--text-secondary);
margin-top: 4px;
display: flex;
align-items: center;
gap: 4px;
padding-left: 2px;
}
[data-bs-theme="dark"] .avance-edit-mode {
background: #1a253a !important;
border-color: #3b82f6 !important;
}
[data-bs-theme="dark"] .avance-edit-mode textarea {
background: var(--input-bg);
color: var(--text-primary);
border: 1px solid var(--input-border);
}
[data-bs-theme="dark"] .btn-edit-avance {
background: #334155;
border-color: #475569;
color: #cbd5e1;
}
[data-bs-theme="dark"] .btn-edit-avance:hover {
background: #3b82f6;
border-color: #3b82f6;
}
[data-bs-theme="dark"] .btn-delete-avance {
background: #334155;
border-color: #475569;
color: #f87171;
}
[data-bs-theme="dark"] .btn-delete-avance:hover {
background: #ef4444;
border-color: #ef4444;
color: white;
}
.modal-confirm {
display: none;
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background: rgba(0, 0, 0, 0.7);
backdrop-filter: blur(5px);
z-index: 3000;
justify-content: center;
align-items: center;
animation: fadeIn 0.3s;
}
.modal-confirm-content {
background: var(--bg-card);
border-radius: 20px;
padding: 30px;
max-width: 450px;
width: 90%;
text-align: center;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
animation: slideUp 0.4s;
}
.modal-confirm-icon {
width: 80px;
height: 80px;
border-radius: 50%;
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
display: flex;
align-items: center;
justify-content: center;
margin: 0 auto 20px;
font-size: 2.5rem;
color: white;
animation: pulse 2s infinite;
}
.modal-confirm-content h3 {
font-size: 1.5rem;
margin-bottom: 15px;
color: var(--text-primary);
}
.modal-confirm-content p {
color: var(--text-secondary);
margin-bottom: 25px;
line-height: 1.6;
}
.modal-confirm-buttons {
display: flex;
gap: 15px;
justify-content: center;
}
.btn-confirm-cancel, .btn-confirm-ok {
padding: 12px 30px;
border-radius: 50px;
border: none;
font-weight: 600;
cursor: pointer;
transition: all 0.3s;
display: flex;
align-items: center;
gap: 8px;
}
.btn-confirm-cancel {
background: var(--input-bg);
color: var(--text-primary);
border: 2px solid var(--border-color);
}
.btn-confirm-ok {
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}
.modal-info {
display: none;
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background: rgba(0, 0, 0, 0.7);
backdrop-filter: blur(5px);
z-index: 3000;
justify-content: center;
align-items: center;
animation: fadeIn 0.3s;
}
.modal-info-content {
background: var(--bg-card);
border-radius: 20px;
max-width: 600px;
width: 90%;
max-height: 80vh;
overflow: hidden;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
animation: slideUp 0.4s;
}
.modal-info-header {
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
padding: 20px;
display: flex;
justify-content: space-between;
align-items: center;
}
.modal-info-header h3 {
margin: 0;
display: flex;
align-items: center;
gap: 10px;
}
.btn-close-modal {
background: rgba(255, 255, 255, 0.2);
border: none;
color: white;
width: 36px;
height: 36px;
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
cursor: pointer;
transition: all 0.3s;
}
.btn-close-modal:hover {
background: rgba(255, 255, 255, 0.3);
transform: rotate(90deg);
}
.modal-info-body {
padding: 25px;
overflow-y: auto;
max-height: calc(80vh - 80px);
}
.hostname-puerto-pair {
background: linear-gradient(135deg, #f8f9fa, #e9ecef);
border: 1px solid #dee2e6;
border-radius: 12px;
padding: 15px;
margin-bottom: 12px;
position: relative;
transition: all 0.3s ease;
}
[data-bs-theme="dark"] .hostname-puerto-pair {
background: linear-gradient(135deg, #1e293b, #0f172a);
border-color: #334155;
}
.hostname-puerto-pair:hover {
box-shadow: 0 4px 12px rgba(0,0,0,0.1);
transform: translateY(-2px);
}
.hostname-puerto-pair .btn-remove {
position: absolute;
top: 10px;
right: 10px;
width: 28px;
height: 28px;
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
padding: 0;
background: #ef4444;
color: white;
border: none;
opacity: 0;
transition: all 0.3s ease;
}
.hostname-puerto-pair:hover .btn-remove { opacity: 1; }
.hostname-puerto-pair .btn-remove:hover { background: #dc2626; transform: scale(1.1); }
.hostname-puerto-label {
font-size: 0.85rem;
font-weight: 600;
color: #6c757d;
margin-bottom: 4px;
display: flex;
align-items: center;
gap: 6px;
}
[data-bs-theme="dark"] .hostname-puerto-label { color: #94a3b8; }
.pair-number-badge {
background: linear-gradient(135deg, #0d6efd, #0dcaf0);
color: white;
padding: 2px 8px;
border-radius: 12px;
font-size: 0.75rem;
font-weight: 600;
}
.info-adicional-box {
background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
border: 1px solid #bae6fd;
border-radius: 12px;
padding: 20px;
margin-bottom: 20px;
}
[data-bs-theme="dark"] .info-adicional-box {
background: linear-gradient(135deg, #0c1a33, #1e293b);
border: 1px solid #334155;
}
.info-adicional-box .form-label {
font-weight: 600;
color: #1e40af;
margin-bottom: 8px;
}
[data-bs-theme="dark"] .info-adicional-box .form-label {
color: #93c5fd;
}
.info-adicional-box textarea,
.info-adicional-box input {
border-radius: 8px;
border: 1px solid #cbd5e1;
padding: 10px 12px;
}
[data-bs-theme="dark"] .info-adicional-box textarea,
[data-bs-theme="dark"] .info-adicional-box input {
border-color: #475569;
background-color: #0f172a;
}
.info-adicional-box small {
font-size: 0.8rem;
color: #64748b;
margin-top: 4px;
display: block;
}
[data-bs-theme="dark"] .info-adicional-box small {
color: #94a3b8;
}
@keyframes pulse {
0% { transform: scale(1); }
50% { transform: scale(1.05); }
100% { transform: scale(1); }
}
.btn-resumen-1:active,
.btn-resumen-2:active,
.cronologia-btn:active,
.copiar-cronologia-btn:active {
animation: pulse 0.3s ease;
}
.btn-copiado-exito {
animation: copiedSuccess 0.5s ease forwards;
}
@keyframes copiedSuccess {
0% {
transform: scale(1);
box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
50% {
transform: scale(1.08);
box-shadow: 0 8px 25px rgba(40, 167, 69, 0.5);
}
100% {
transform: scale(1);
box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
}
.toast-success {
background: linear-gradient(135deg, #10b981, #0ea5e9);
border-left: 4px solid #059669;
}
.toast-error {
background: linear-gradient(135deg, #ef4444, #f97316);
border-left: 4px solid #dc2626;
}
.toast-warning {
background: linear-gradient(135deg, #f59e0b, #f97316);
border-left: 4px solid #d97706;
}
.toast-info {
background: linear-gradient(135deg, #3b82f6, #0ea5e9);
border-left: 4px solid #2563eb;
}
.date-picker-modal {
display: none;
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background: rgba(0, 0, 0, 0.7);
backdrop-filter: blur(5px);
z-index: 4000;
justify-content: center;
align-items: center;
animation: fadeIn 0.3s;
}
.date-picker-content {
background: var(--bg-card);
border-radius: 20px;
padding: 25px;
max-width: 400px;
width: 90%;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
animation: slideUp 0.4s;
}
.date-picker-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 20px;
padding-bottom: 15px;
border-bottom: 1px solid var(--border-color);
}
.date-picker-header h4 {
margin: 0;
color: var(--text-primary);
font-size: 1.2rem;
}
.date-picker-close {
background: none;
border: none;
font-size: 1.5rem;
color: var(--text-secondary);
cursor: pointer;
transition: all 0.3s;
}
.date-picker-close:hover {
color: #ef4444;
transform: rotate(90deg);
}
.date-picker-body {
display: flex;
flex-direction: column;
gap: 15px;
}
.date-picker-date input,
.date-picker-time input {
width: 100%;
padding: 12px 15px;
border-radius: 10px;
border: 2px solid var(--input-border);
background: var(--input-bg);
color: var(--text-primary);
font-size: 1.1rem;
font-family: 'Courier New', monospace;
}
.date-picker-buttons {
display: flex;
gap: 10px;
margin-top: 15px;
}
.date-picker-buttons .btn {
flex: 1;
padding: 12px 20px;
border-radius: 50px;
font-weight: 600;
border: none;
cursor: pointer;
transition: all 0.3s;
}
.btn-date-confirm {
background: linear-gradient(135deg, #10b981, #0ea5e9);
color: white;
}
.btn-date-cancel {
background: var(--input-bg);
border: 2px solid var(--border-color);
color: var(--text-primary);
}
.modal-export-selection {
display: none;
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background: rgba(0, 0, 0, 0.7);
backdrop-filter: blur(5px);
z-index: 3000;
justify-content: center;
align-items: center;
animation: fadeIn 0.3s;
}
.modal-export-content {
background: var(--bg-card);
border-radius: 20px;
width: 90%;
max-width: 700px;
max-height: 85vh;
overflow: hidden;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
animation: slideUp 0.4s;
display: flex;
flex-direction: column;
}
.modal-export-header {
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
padding: 20px 25px;
display: flex;
justify-content: space-between;
align-items: center;
}
.modal-export-header h3 {
margin: 0;
display: flex;
align-items: center;
gap: 10px;
font-size: 1.3rem;
}
.modal-export-body {
padding: 25px;
overflow-y: auto;
flex: 1;
}
.export-destination-section {
background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
border: 1px solid #bae6fd;
border-radius: 12px;
padding: 20px;
margin-bottom: 20px;
}
[data-bs-theme="dark"] .export-destination-section {
background: linear-gradient(135deg, #0c1a33, #1e293b);
border-color: #334155;
}
.export-destination-section .form-label {
display: flex;
align-items: center;
gap: 8px;
color: #1e40af;
font-weight: 600;
margin-bottom: 10px;
}
[data-bs-theme="dark"] .export-destination-section .form-label {
color: #93c5fd;
}
.export-destination-section .form-select {
border-radius: 10px;
padding: 12px 15px;
font-size: 1rem;
border: 2px solid #cbd5e1;
transition: all 0.3s;
}
.export-destination-section .form-select:focus {
border-color: #667eea;
box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}
.export-tickets-list {
background: var(--input-bg);
border: 1px solid var(--border-color);
border-radius: 12px;
padding: 15px;
margin-bottom: 20px;
max-height: 350px;
overflow-y: auto;
}
.export-list-header {
display: flex;
justify-content: space-between;
align-items: center;
padding-bottom: 12px;
border-bottom: 1px solid var(--border-color);
margin-bottom: 12px;
position: sticky;
top: 0;
background: var(--input-bg);
z-index: 1;
}
.checkbox-label {
display: flex;
align-items: center;
gap: 8px;
cursor: pointer;
font-weight: 600;
color: var(--text-primary);
}
.checkbox-label input[type="checkbox"] {
width: 18px;
height: 18px;
cursor: pointer;
accent-color: #667eea;
}
.selected-count {
background: linear-gradient(135deg, #667eea, #764ba2);
color: white;
padding: 4px 12px;
border-radius: 20px;
font-size: 0.85rem;
font-weight: 600;
}
.tickets-checkbox-container {
display: flex;
flex-direction: column;
gap: 8px;
}
.ticket-checkbox-item {
display: flex;
align-items: center;
gap: 12px;
padding: 12px 15px;
background: var(--bg-card);
border: 1px solid var(--border-color);
border-radius: 10px;
cursor: pointer;
transition: all 0.3s;
}
.ticket-checkbox-item:hover {
border-color: #667eea;
background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
transform: translateX(5px);
}
.ticket-checkbox-item input[type="checkbox"] {
width: 20px;
height: 20px;
cursor: pointer;
accent-color: #667eea;
}
.ticket-checkbox-item .ticket-info {
flex: 1;
}
.ticket-checkbox-item .ticket-id {
font-weight: 700;
color: var(--text-primary);
font-size: 1rem;
}
.ticket-checkbox-item .ticket-tramo {
font-size: 0.85rem;
color: var(--text-secondary);
}
.ticket-checkbox-item .ticket-estado {
padding: 3px 10px;
border-radius: 12px;
font-size: 0.75rem;
font-weight: 600;
}
.estado-activo { background: #d1fae5; color: #059669; }
.estado-suspendido { background: #fee2e2; color: #dc2626; }
.estado-resuelto { background: #e5e7eb; color: #6b7280; }
[data-bs-theme="dark"] .estado-activo { background: #064e3b; color: #6ee7b7; }
[data-bs-theme="dark"] .estado-suspendido { background: #7f1d1d; color: #fca5a5; }
[data-bs-theme="dark"] .estado-resuelto { background: #374151; color: #9ca3af; }
.export-preview-info {
background: linear-gradient(135deg, #fef3c7, #fde68a);
border: 1px solid #f59e0b;
border-radius: 12px;
padding: 15px 20px;
margin-bottom: 0;
}
[data-bs-theme="dark"] .export-preview-info {
background: linear-gradient(135deg, #422006, #78350f);
border-color: #b45309;
}
.export-preview-info p {
margin: 5px 0;
font-size: 0.9rem;
color: #92400e;
}
[data-bs-theme="dark"] .export-preview-info p {
color: #fcd34d;
}
.export-preview-info strong {
color: #78350f;
}
[data-bs-theme="dark"] .export-preview-info strong {
color: #fbbf24;
}
.modal-export-footer {
display: flex;
justify-content: center;
gap: 15px;
padding: 20px 25px;
border-top: 1px solid var(--border-color);
background: var(--bg-card);
}
.btn-export-cancel {
background: var(--input-bg);
border: 2px solid var(--border-color);
color: var(--text-primary);
border-radius: 50px;
padding: 12px 30px;
font-weight: 600;
cursor: pointer;
transition: all 0.3s;
display: flex;
align-items: center;
gap: 8px;
}
.btn-export-cancel:hover {
border-color: #dc3545;
color: #dc3545;
transform: translateY(-2px);
}
.btn-export-confirm {
background: linear-gradient(135deg, #10b981, #0ea5e9);
border: none;
color: white;
border-radius: 50px;
padding: 12px 30px;
font-weight: 600;
cursor: pointer;
transition: all 0.3s;
display: flex;
align-items: center;
gap: 8px;
box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}
.btn-export-confirm:hover {
transform: translateY(-2px);
box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
}
.btn-export-confirm:disabled {
background: #9ca3af;
cursor: not-allowed;
box-shadow: none;
transform: none;
}
@media (max-width: 992px) {
.container-grid { grid-template-columns: 1fr; }
.card { margin-bottom: 20px; }
.dashboard-stats { grid-template-columns: 1fr; }
.etr-inputs-container { flex-direction: column; }
}
@media (max-width: 768px) {
.toast { min-width: auto; max-width: calc(100vw - 40px); }
.modal-confirm-content, .modal-info-content { width: 95%; }
.input-group-datetime {
    flex-wrap: wrap;
}
.input-group-datetime input {
    width: 100%;
    border-radius: 8px !important;
    margin-bottom: 8px;
}
.input-group-datetime .btn-calendar,
.input-group-datetime .btn-now {
    border-radius: 8px !important;
    width: 50%;
}
.modal-export-content {
    width: 95%;
    max-height: 90vh;
}
.modal-export-footer {
    flex-direction: column;
}
.btn-export-cancel,
.btn-export-confirm {
    width: 100%;
    justify-content: center;
}
.etr-contador-tiempo {
    font-size: 2rem;
}
}
/* Modal Cuadro de Cierre */
.modal-cuadro-cierre {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    z-index: 5000;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s;
}

.modal-cuadro-cierre-content {
    background: var(--bg-card);
    border-radius: 20px;
    width: 90%;
    max-width: 900px;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    animation: slideUp 0.4s;
    display: flex;
    flex-direction: column;
}

.modal-cuadro-cierre-header {
    background: linear-gradient(135deg, #6c757d, #495057);
    color: white;
    padding: 20px 25px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-cuadro-cierre-header h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.3rem;
}

.modal-cuadro-cierre-body {
    padding: 25px;
    overflow-y: auto;
    flex: 1;
}

.cuadro-cierre-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
}

.cuadro-cierre-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.cuadro-cierre-field label {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.9rem;
}

.cuadro-cierre-field input,
.cuadro-cierre-field select,
.cuadro-cierre-field textarea {
    padding: 10px 12px;
    border: 2px solid var(--input-border);
    border-radius: 8px;
    background: var(--input-bg);
    color: var(--text-primary);
    font-size: 0.95rem;
    font-family: 'Courier New', monospace;
}

.cuadro-cierre-field input[readonly] {
    background: var(--bg-card);
    cursor: not-allowed;
}

.cuadro-cierre-field textarea {
    resize: vertical;
    min-height: 60px;
}

.modal-cuadro-cierre-footer {
    display: flex;
    justify-content: center;
    gap: 15px;
    padding: 20px 25px;
    border-top: 1px solid var(--border-color);
    background: var(--bg-card);
}

.btn-cuadro-cierre-cancel,
.btn-cuadro-cierre-generate {
    padding: 12px 30px;
    border-radius: 50px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
    border: none;
}

.btn-cuadro-cierre-cancel {
    background: var(--input-bg);
    border: 2px solid var(--border-color);
    color: var(--text-primary);
}

.btn-cuadro-cierre-cancel:hover {
    border-color: #dc3545;
    color: #dc3545;
    transform: translateY(-2px);
}

.btn-cuadro-cierre-generate {
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
}

.btn-cuadro-cierre-generate:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(40, 167, 69, 0.5);
}

@media (max-width: 768px) {
    .cuadro-cierre-grid {
        grid-template-columns: 1fr;
    }
    
    .modal-cuadro-cierre-content {
        width: 95%;
        max-height: 95vh;
    }
    
    .modal-cuadro-cierre-footer {
        flex-direction: column;
    }
    
    .btn-cuadro-cierre-cancel,
    .btn-cuadro-cierre-generate {
        width: 100%;
        justify-content: center;
    }
}
/* ============ ANIMACIONES PARA ALERTAS SLA ============ */
@keyframes iconPulse {
    0%, 100% { 
        transform: scale(1); 
        filter: drop-shadow(0 0 0 rgba(255, 107, 107, 0));
    }
    50% { 
        transform: scale(1.15); 
        filter: drop-shadow(0 0 15px rgba(255, 107, 107, 0.8));
    }
}

.icon-pulse-animation {
    animation: iconPulse 1.5s ease-in-out infinite;
}

@keyframes pulse-alert {
    0%, 100% { 
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); 
    }
    50% { 
        box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); 
    }
}

.tiempo-total.critical-alert,
#tiempoTotal.critical-alert {
    color: #ef4444 !important;
    text-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
    animation: iconPulse 1s ease-in-out infinite;
}

.toast-warning, .toast-error {
    animation: iconPulse 2s ease-in-out infinite;
}
@keyframes iconPulse {
    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(255, 107, 107, 0)); }
    50% { transform: scale(1.15); filter: drop-shadow(0 0 15px rgba(255, 107, 107, 0.8)); }
}
@keyframes pulse-alert {
    0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
    50% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
}
.critical-alert {
    color: #ef4444 !important;
    text-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
    animation: iconPulse 1s ease-in-out infinite;
}
