// --- 1. ESTADO Y DATOS ---
const state = {
    currentView: 'login', 
    user: null,
    role: null,
    notifications: [],
    showNotifications: false,
    showProfileMenu: false,
    isMenuOpen: false,
    showFilters: false, 
    filters: { location: 'todos', specialty: 'todos', rating: 'todos' },
    
    selectedSupplier: null,
    selectedProduct: null,
    searchTerm: '',
    isRecording: false,
    recordingTime: 0,
    alertMessage: null
};

// Base de datos simulada
const DB = {
    suppliers: [
        { id: 1, name: "ConstruMateriales Perú S.A.", rating: 4.8, reviews: 156, location: "Lima", specialty: "Materiales Generales", certifications: ["ISO 9001"], products: [{ id: 101, name: "Bolsa de Cemento Sol", price: 28.50, imageUrl: "https://promart.vteximg.com.br/arquivos/ids/7133522-700-700/22662.jpg" }] },
        { id: 2, name: "EcoCementos del Sur", rating: 4.6, reviews: 89, location: "Arequipa", specialty: "Cementos Ecológicos", certifications: ["Sostenibilidad"], products: [{ id: 201, name: "Bolsa Eco R-40", price: 32.00, imageUrl: "https://storage.googleapis.com/pacasmayo-profesional/images/tipoi16102023.png" }] },
        { id: 3, name: "Acero Premium Trujillo", rating: 4.9, reviews: 203, location: "Trujillo", specialty: "Acero y Metales", certifications: ["Calidad"], products: [{ id: 301, name: "Varilla 1/2\"", price: 45.00, imageUrl: "https://acerosarequipa.com/sites/default/files/productos/2023-02/baco-615%20%281%29.jpg" }] },
        { id: 4, name: "Ferretería El Puerto S.A.C.", rating: 4.4, reviews: 95, location: "Chimbote", specialty: "Materiales Generales", certifications: ["Local"], products: [{ id: 401, name: "Agregado Grueso (m3)", price: 55.00, imageUrl: "https://insumosfirstpro.com/wp-content/uploads/2022/04/ARENA-GRUESA-POR-MT3.png" }] },
        { id: 5, name: "Concretos del Norte", rating: 4.7, reviews: 42, location: "Nuevo Chimbote", specialty: "Concreto Premezclado", certifications: ["ISO 9001"], products: [{ id: 501, name: "Mixer Concreto 210", price: 320.00, imageUrl: "https://ventasyofertas.com.pe/wp-content/uploads/2025/03/MX180-3P.jpg" }] },
        { id: 6, name: "Distribuidora Santa Rosa", rating: 4.2, reviews: 30, location: "Chimbote", specialty: "Acabados y Pinturas", certifications: ["Garantía"], products: [{ id: 601, name: "Balde Pintura Látex", price: 85.00, imageUrl: "https://promart.vteximg.com.br/arquivos/ids/8889223-700-700/135960.jpg" }] }
    ],
    notifications: [
        { id: 1, message: "Nueva entrega en Nuevo Chimbote", time: "Hace 2 horas", read: false },
        { id: 2, message: "Alerta: Retraso en Av. Pardo", time: "Hace 5 horas", read: false }
    ],
    deliveries: [
        { id: 1, supplier: "Ferretería El Puerto", material: "Agregado", quantity: "10 m3", estimatedArrival: "14:30", status: "en ruta" },
        { id: 2, supplier: "Concretos del Norte", material: "Mixer", quantity: "1 un", estimatedArrival: "16:15", status: "retrasado" }
    ]
};

state.notifications = DB.notifications;

// --- 2. FUNCIONES DE LÓGICA ---

function init() { render(); }

function showAlert(msg) {
    state.alertMessage = msg;
    render();
    setTimeout(() => { state.alertMessage = null; render(); }, 4000); // Aumenté un poco el tiempo para leer el error
}

function setView(view) {
    state.currentView = view;
    state.isMenuOpen = false;
    if(view !== 'suppliers') state.showFilters = false;
    render();
}

// --- LÓGICA DE AUTENTICACIÓN ---

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    
    if(!email || !pass) { showAlert("Ingrese credenciales."); return; }

    // Regex: 8-12 chars, 1 Mayus, 1 Minus, 1 Num, 1 Simbolo
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,12}$/;
    
    if (!passwordRegex.test(pass)) {
        // AQUÍ SALE LA ALERTA CON LOS REQUISITOS SI FALLA
        showAlert("Error: La contraseña debe tener 8-12 caracteres, mayúscula, número y símbolo.");
        return; 
    }

    state.user = email.split('@')[0];
    state.role = 'admin';
    state.currentView = 'dashboard';
    showAlert(`¡Bienvenido, ${state.user}!`);
    render();
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const pass = document.getElementById('reg-pass').value;
    const confirm = document.getElementById('reg-confirm').value;

    if (pass !== confirm) { showAlert("Las contraseñas no coinciden."); return; }

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,12}$/;
    if (!passwordRegex.test(pass)) {
        showAlert("La contraseña no cumple con los requisitos de seguridad indicados.");
        return;
    }

    state.user = name;
    state.role = 'ingeniero';
    state.currentView = 'dashboard';
    showAlert("Cuenta creada correctamente");
    render();
}

function handleLogout() { state.user = null; state.currentView = 'login'; state.showProfileMenu = false; render(); }

// --- LÓGICA DE NEGOCIO ---

function selectSupplier(id) { state.selectedSupplier = DB.suppliers.find(s => s.id === id); state.currentView = 'supplierDetail'; render(); }
function selectProduct(productId) { state.selectedProduct = state.selectedSupplier.products.find(p => p.id === productId); state.currentView = 'payment'; render(); }
function handlePayment(e) { e.preventDefault(); const btn = e.target.querySelector('button'); btn.innerText = "Procesando..."; btn.disabled = true; setTimeout(() => { showAlert("¡Pago Confirmado!"); state.selectedProduct = null; state.currentView = 'supplierDetail'; render(); }, 1500); }

// Filtros
function updateSearch(val) { state.searchTerm = val; render(); setTimeout(() => { const input = document.getElementById('searchInput'); if(input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); } }, 0); }
function toggleFilters() { state.showFilters = !state.showFilters; render(); }
function updateFilter(type, value) { state.filters[type] = value; render(); }

// Menús
function toggleNotificationMenu() { state.showNotifications = !state.showNotifications; state.showProfileMenu = false; render(); }
function toggleProfileMenu() { state.showProfileMenu = !state.showProfileMenu; state.showNotifications = false; render(); }
function markAllRead() { state.notifications = state.notifications.map(n => ({...n, read: true})); render(); }

// Incidencias
function toggleRecording() {
    state.isRecording = !state.isRecording;
    if(state.isRecording) { showAlert("Grabando audio..."); } else { showAlert("Audio guardado"); }
    render();
}

// --- 3. RENDERIZADO ---

function render() {
    const app = document.getElementById('app');
    if (!app) return;

    let html = '';

    if (state.alertMessage) {
        html += `<div class="fixed top-20 right-5 z-[100] bg-orange-700 text-white p-4 rounded shadow-2xl animate-bounce flex items-center border-l-4 border-gray-900"><span class="font-medium">${state.alertMessage}</span></div>`;
    }

    if (state.currentView === 'login') html += renderLogin();
    else if (state.currentView === 'register') html += renderRegister();
    else if (state.currentView === 'forgot') html += renderForgot();
    else {
        html += `
        <div class="min-h-screen bg-gray-50 text-gray-900">
            ${renderHeader()}
            ${renderSidebar()}
            <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-all duration-300 ${state.isMenuOpen ? 'opacity-50 lg:opacity-100' : ''}">
                ${renderContent()}
            </main>
        </div>`;
    }
    app.innerHTML = html;
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

// --- VISTAS ---

function renderLogin() {
    // ACTUALIZADO: Placeholder limpio
    return `
    <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div class="w-full max-w-md p-10 bg-white rounded-lg shadow-2xl animate-fadeIn">
            <div class="text-center mb-10">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-700 mb-4 shadow-lg"><i data-lucide="package" class="w-8 h-8 text-white"></i></div>
                <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">SIGRA</h1>
                <p class="text-gray-500 mt-2 font-medium uppercase text-xs leading-tight">Sistema Integral de Gestión de Recursos y Abastecimiento</p>
            </div>
            <form onsubmit="handleLogin(event)" class="space-y-6">
                <div class="relative"><i data-lucide="mail" class="absolute left-3 top-3.5 w-5 h-5 text-gray-400"></i><input id="login-email" type="email" placeholder="Correo" class="w-full pl-10 pr-4 py-3 border rounded focus:ring-2 focus:ring-orange-700" required></div>
                <div class="relative"><i data-lucide="lock" class="absolute left-3 top-3.5 w-5 h-5 text-gray-400"></i><input id="login-pass" type="password" placeholder="Contraseña" class="w-full pl-10 pr-4 py-3 border rounded focus:ring-2 focus:ring-orange-700" required></div>
                <button type="submit" class="w-full bg-orange-700 text-white py-3 rounded font-bold text-lg hover:bg-orange-800 shadow-md">Iniciar Sesión</button>
                <div class="flex justify-between text-sm pt-2"><a href="#" onclick="setView('forgot')" class="text-gray-500 hover:text-gray-900">¿Olvidaste?</a><a href="#" onclick="setView('register')" class="text-orange-700 hover:text-orange-800 font-bold">Crear cuenta</a></div>
            </form>
        </div>
    </div>`;
}

function renderRegister() {
    // ACTUALIZADO: Placeholder limpio + Texto de requisitos abajo
    return `
    <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div class="w-full max-w-md p-10 bg-white rounded-lg shadow-2xl animate-fadeIn">
            <h2 class="text-2xl font-bold text-center mb-6">Crear Cuenta</h2>
            <form onsubmit="handleRegister(event)" class="space-y-5">
                <div class="relative"><input id="reg-name" type="text" placeholder="Nombre" class="w-full p-3 border rounded" required></div>
                <div class="relative"><input id="reg-email" type="email" placeholder="Correo" class="w-full p-3 border rounded" required></div>
                
                <div class="relative">
                    <input id="reg-pass" type="password" placeholder="Contraseña" class="w-full p-3 border rounded" required>
                    <p class="text-xs text-gray-500 mt-1 leading-tight text-left">* 8-12 caracteres, 1 mayúscula, 1 número y 1 símbolo.</p>
                </div>
                
                <div class="relative"><input id="reg-confirm" type="password" placeholder="Confirmar contraseña" class="w-full p-3 border rounded" required></div>
                
                <button type="submit" class="w-full bg-orange-700 text-white py-3 rounded font-bold hover:bg-orange-800">Registrarse</button>
                <div class="text-center"><a href="#" onclick="setView('login')" class="text-sm text-gray-500">← Volver</a></div>
            </form>
        </div>
    </div>`;
}

function renderForgot() { return `<div class="min-h-screen bg-gray-900 flex items-center justify-center p-4"><div class="w-full max-w-md p-10 bg-white rounded-lg shadow-2xl animate-fadeIn"><h2 class="text-2xl font-bold text-center mb-6">Recuperar</h2><form onsubmit="showAlert('Correo enviado'); setView('login'); return false;" class="space-y-5"><input type="email" placeholder="Correo" class="w-full p-3 border rounded" required><button type="submit" class="w-full bg-orange-700 text-white py-3 rounded font-bold">Enviar</button><div class="text-center"><a href="#" onclick="setView('login')" class="text-sm text-gray-500">← Volver</a></div></form></div></div>`; }

function renderHeader() {
    return `
    <header class="bg-gray-900 border-b border-gray-800 sticky top-0 z-40 shadow-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-20">
                <div class="flex items-center">
                    <button onclick="state.isMenuOpen = !state.isMenuOpen; render()" class="lg:hidden mr-4 text-gray-300"><i data-lucide="menu" class="w-6 h-6"></i></button>
                    <div class="flex items-center space-x-3"><div class="w-8 h-8 bg-orange-700 rounded flex items-center justify-center"><i data-lucide="package" class="w-5 h-5 text-white"></i></div><h1 class="text-xl font-extrabold text-white">SIGRA <span class="font-light text-gray-400">Perú</span></h1></div>
                </div>
                <div class="flex items-center space-x-6">
                    <div class="relative">
                        <button id="notif-btn" onclick="toggleNotificationMenu()" class="text-gray-400 hover:text-white relative"><i data-lucide="bell" class="w-6 h-6"></i>${state.notifications.filter(n => !n.read).length > 0 ? '<span class="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">' + state.notifications.filter(n => !n.read).length + '</span>' : ''}</button>
                        ${state.showNotifications ? renderNotificationsDropdown() : ''}
                    </div>
                    <div class="relative">
                        <button id="profile-btn" onclick="toggleProfileMenu()" class="flex items-center space-x-2 text-gray-300 hover:text-white"><div class="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center"><i data-lucide="user" class="w-4 h-4"></i></div><span class="hidden sm:block font-medium">${state.user}</span></button>
                        ${state.showProfileMenu ? renderProfileMenu() : ''}
                    </div>
                </div>
            </div>
        </div>
    </header>`;
}

function renderNotificationsDropdown() {
    return `
    <div id="notif-menu" class="absolute right-0 mt-4 w-80 bg-white border border-gray-200 shadow-xl rounded-lg z-50 overflow-hidden text-gray-900 animate-fadeIn">
        <div class="p-4 border-b bg-gray-50 flex justify-between items-center"><span class="font-bold text-sm">NOTIFICACIONES</span><button onclick="markAllRead()" class="text-xs text-orange-700 font-bold hover:underline">Marcar leídas</button></div>
        <div class="max-h-64 overflow-y-auto">${state.notifications.map(n => `<div class="p-4 border-b border-gray-50 ${!n.read ? 'bg-orange-50' : ''}"><p class="text-sm font-medium">${n.message}</p><p class="text-xs text-gray-400 mt-1">${n.time}</p></div>`).join('')}</div>
    </div>`;
}

function renderProfileMenu() {
    return `<div id="profile-menu" class="absolute right-0 mt-4 w-48 bg-white border border-gray-200 shadow-xl rounded-lg z-50 animate-fadeIn"><div class="p-4 border-b bg-gray-50"><p class="font-bold text-gray-900 truncate">${state.user}</p><p class="text-xs text-gray-500 capitalize">${state.role}</p></div><button onclick="handleLogout()" class="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-red-50 hover:text-red-700 flex items-center"><i data-lucide="log-out" class="w-4 h-4 mr-2"></i> Salir</button></div>`;
}

function renderSidebar() {
    const items = [{ id: 'dashboard', label: 'Dashboard' }, { id: 'suppliers', label: 'Proveedores' }, { id: 'deliveries', label: 'Entregas' }, { id: 'incidents', label: 'Incidencias' }];
    const active = (state.currentView === 'supplierDetail' || state.currentView === 'payment') ? 'suppliers' : state.currentView;
    return `
    <div class="fixed top-0 left-0 h-full w-64 bg-gray-900 shadow-2xl z-[60] transform transition-transform duration-300 ${state.isMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden">
        <div class="p-4 h-20 flex justify-between items-center bg-gray-900 border-b border-gray-800"><span class="text-white font-bold text-lg">MENÚ</span><button onclick="state.isMenuOpen = false; render()" class="text-gray-400"><i data-lucide="x" class="w-6 h-6"></i></button></div>
        <div class="py-4 flex flex-col">${items.map(item => `<button onclick="setView('${item.id}')" class="w-full text-left px-6 py-4 text-sm font-bold border-l-4 transition-all ${active === item.id ? 'border-orange-700 text-orange-500 bg-gray-800' : 'border-transparent text-gray-400 hover:bg-gray-800'}">${item.label}</button>`).join('')}</div>
    </div>
    <div class="hidden lg:flex justify-center bg-white shadow-sm border-b border-gray-200 mb-6"><div class="flex space-x-8 max-w-7xl w-full px-8">${items.map(item => `<button onclick="setView('${item.id}')" class="py-4 text-sm font-bold border-b-2 transition-colors ${active === item.id ? 'border-orange-700 text-orange-700' : 'border-transparent text-gray-500 hover:text-gray-900'}">${item.label}</button>`).join('')}</div></div>`;
}

function renderContent() {
    switch(state.currentView) {
        case 'dashboard': return renderDashboardContent();
        case 'suppliers': return renderSuppliersContent();
        case 'supplierDetail': return renderSupplierDetail();
        case 'payment': return renderPayment();
        case 'deliveries': return renderDeliveries();
        case 'incidents': return renderIncidents();
        default: return renderDashboardContent();
    }
}

function renderDashboardContent() {
    return `
    <div class="animate-fadeIn space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="bg-white p-6 rounded-lg shadow border hover:shadow-md"><div class="flex justify-between mb-2 text-gray-500 font-bold text-xs uppercase"><span>Avance</span><i data-lucide="trending-up" class="text-orange-700"></i></div><div class="text-5xl font-extrabold">78%</div><div class="w-full bg-gray-200 h-2 rounded-full mt-2"><div class="bg-orange-700 h-2 rounded-full" style="width: 78%"></div></div></div>
            <div class="bg-white p-6 rounded-lg shadow border hover:shadow-md"><div class="flex justify-between mb-2 text-gray-500 font-bold text-xs uppercase"><span>Retrasos</span><i data-lucide="clock"></i></div><div class="text-5xl font-extrabold">12</div></div>
            <div class="bg-white p-6 rounded-lg shadow border hover:shadow-md"><div class="flex justify-between mb-2 text-gray-500 font-bold text-xs uppercase"><span>Alertas</span><i data-lucide="alert-triangle" class="text-red-600"></i></div><div class="text-5xl font-extrabold text-red-600">3</div></div>
            <div class="bg-white p-6 rounded-lg shadow border hover:shadow-md"><div class="flex justify-between mb-2 text-gray-500 font-bold text-xs uppercase"><span>Stock Bajo</span><i data-lucide="package"></i></div><div class="text-5xl font-extrabold">8</div></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="bg-white p-6 rounded-lg shadow border"><h3 class="text-xl font-bold mb-6">Acciones Rápidas</h3><div class="grid grid-cols-2 gap-4"><button onclick="showAlert('Recepción Iniciada')" class="bg-orange-700 text-white py-3 px-4 rounded font-bold hover:bg-orange-800 shadow">Recibir Pedido</button><button onclick="setView('incidents')" class="bg-white text-gray-900 border border-gray-300 py-3 px-4 rounded font-bold hover:bg-gray-50">Reportar Incidencia</button></div></div>
            <div class="bg-white p-6 rounded-lg shadow border"><h3 class="text-xl font-bold mb-6">Alertas Recientes</h3><div class="space-y-3"><div class="p-3 border-l-4 border-red-600 bg-red-50 rounded"><p class="font-bold text-sm">Retraso en Chimbote Centro</p></div><div class="p-3 border-l-4 border-orange-400 bg-orange-50 rounded"><p class="font-bold text-sm">Stock bajo de cemento</p></div></div></div>
        </div>
    </div>`;
}

function renderFilterDropdown() {
    return `
    <div id="filter-menu" class="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-lg z-50 p-4 animate-fadeIn">
        <div class="space-y-4">
            <div><label class="block text-xs font-bold text-gray-500 uppercase mb-2">Ubicación</label><select onchange="updateFilter('location', this.value)" class="w-full border border-gray-300 p-2 text-sm rounded focus:ring-orange-700"><option value="todos">Todas</option><option value="Chimbote" ${state.filters.location === 'Chimbote' ? 'selected' : ''}>Chimbote</option><option value="Nuevo Chimbote" ${state.filters.location === 'Nuevo Chimbote' ? 'selected' : ''}>Nuevo Chimbote</option><option value="Lima" ${state.filters.location === 'Lima' ? 'selected' : ''}>Lima</option><option value="Trujillo" ${state.filters.location === 'Trujillo' ? 'selected' : ''}>Trujillo</option></select></div>
            <div><label class="block text-xs font-bold text-gray-500 uppercase mb-2">Especialidad</label><select onchange="updateFilter('specialty', this.value)" class="w-full border border-gray-300 p-2 text-sm rounded"><option value="todos">Todas</option><option value="Materiales Generales" ${state.filters.specialty === 'Materiales Generales' ? 'selected' : ''}>Materiales Generales</option><option value="Cementos Ecológicos" ${state.filters.specialty === 'Cementos Ecológicos' ? 'selected' : ''}>Cementos Ecológicos</option><option value="Acero y Metales" ${state.filters.specialty === 'Acero y Metales' ? 'selected' : ''}>Acero y Metales</option></select></div>
            <div><label class="block text-xs font-bold text-gray-500 uppercase mb-2">Calificación</label><select onchange="updateFilter('rating', this.value)" class="w-full border border-gray-300 p-2 text-sm rounded"><option value="todos">Todas</option><option value="4.5" ${state.filters.rating === '4.5' ? 'selected' : ''}>Más de 4.5</option><option value="4.0" ${state.filters.rating === '4.0' ? 'selected' : ''}>Más de 4.0</option></select></div>
        </div>
    </div>`;
}

function renderSuppliersContent() {
    let filtered = DB.suppliers;
    if(state.searchTerm) { const term = state.searchTerm.toLowerCase(); filtered = filtered.filter(s => s.name.toLowerCase().includes(term) || s.location.toLowerCase().includes(term)); }
    if(state.filters.location !== 'todos') filtered = filtered.filter(s => s.location === state.filters.location);
    if(state.filters.specialty !== 'todos') filtered = filtered.filter(s => s.specialty === state.filters.specialty);
    if(state.filters.rating !== 'todos') filtered = filtered.filter(s => s.rating >= parseFloat(state.filters.rating));

    return `
    <div class="animate-fadeIn">
        <div class="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h2 class="text-3xl font-extrabold">Proveedores</h2>
            <div class="flex gap-2 w-full sm:w-auto">
                <div class="relative flex-grow sm:w-64"><i data-lucide="search" class="absolute left-3 top-3 w-4 h-4 text-gray-400"></i><input id="searchInput" type="text" value="${state.searchTerm}" oninput="updateSearch(this.value)" placeholder="Buscar..." class="w-full pl-10 pr-4 py-2 border rounded focus:ring-2 focus:ring-orange-700"></div>
                <div class="relative"><button id="filter-btn" onclick="toggleFilters()" class="flex items-center gap-2 px-4 py-2 border bg-white hover:bg-gray-50 rounded font-bold text-gray-700 ${state.showFilters ? 'border-orange-700 text-orange-700' : ''}"><i data-lucide="filter" class="w-4 h-4"></i></button>${state.showFilters ? renderFilterDropdown() : ''}</div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${filtered.length > 0 ? filtered.map(s => `<div onclick="selectSupplier(${s.id})" class="bg-white p-6 rounded-lg shadow-sm border hover:border-orange-700 hover:shadow-lg cursor-pointer transition-all group h-full"><div class="flex justify-between items-start"><h3 class="text-xl font-bold group-hover:text-orange-700 transition-colors">${s.name}</h3></div><div class="mt-4 space-y-2"><div class="flex items-center text-sm text-gray-600"><i data-lucide="map-pin" class="w-4 h-4 mr-2 text-gray-400"></i>${s.location}</div><div class="flex items-center text-sm text-gray-600"><i data-lucide="package" class="w-4 h-4 mr-2 text-gray-400"></i>${s.specialty}</div><div class="flex items-center text-sm font-bold text-gray-900 mt-2"><i data-lucide="star" class="w-4 h-4 fill-current text-orange-700 mr-1"></i> ${s.rating}</div></div></div>`).join('') : '<div class="col-span-3 text-center py-10 text-gray-500 bg-gray-50 rounded border-dashed border-2">No se encontraron proveedores con esos filtros.</div>'}
        </div>
    </div>`;
}

function renderSupplierDetail() {
    const s = state.selectedSupplier;
    return `<div class="animate-fadeIn"><button onclick="setView('suppliers')" class="mb-6 flex items-center text-sm text-gray-500 hover:text-orange-700 font-bold"><i data-lucide="arrow-left" class="w-4 h-4 mr-2"></i> Volver</button><div class="bg-white p-8 rounded-lg shadow mb-8 border"><h2 class="text-3xl font-extrabold">${s.name}</h2><p class="text-gray-500 mt-2 text-lg">${s.specialty}</p><div class="mt-4 flex gap-2">${s.certifications.map(c => `<span class="bg-gray-100 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide border">${c}</span>`).join('')}</div></div><h3 class="text-xl font-bold mb-4 pb-2 border-b">Catálogo</h3><div class="grid grid-cols-1 md:grid-cols-3 gap-6">${s.products.map(p => `<div class="bg-white rounded-lg shadow overflow-hidden border group hover:shadow-xl transition-all"><div class="h-48 bg-gray-100 relative overflow-hidden"><img src="${p.imageUrl}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"></div><div class="p-5"><h4 class="font-bold text-lg leading-tight">${p.name}</h4><p class="text-2xl font-light text-orange-700 my-3">S/ ${p.price.toFixed(2)}</p><button onclick="selectProduct(${p.id})" class="w-full bg-orange-700 text-white py-2 font-bold text-sm uppercase hover:bg-orange-800 flex items-center justify-center gap-2"><i data-lucide="shopping-cart" class="w-4 h-4"></i> Comprar</button></div></div>`).join('')}</div></div>`;
}

function renderPayment() {
    const p = state.selectedProduct;
    const price = p.price;
    const igv = price * 0.18;
    const total = price + igv;

    return `
    <div class="animate-fadeIn max-w-5xl mx-auto">
        <button onclick="setView('supplierDetail')" class="mb-8 flex items-center text-sm text-gray-500 hover:text-orange-700 font-bold transition-colors"><i data-lucide="arrow-left" class="w-4 h-4 mr-2"></i> Cancelar y volver</button>
        <div class="bg-white rounded-xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-gray-100">
            <div class="p-10 border-r border-gray-100"><h2 class="text-2xl font-extrabold mb-8 text-gray-900">Resumen</h2><div class="border border-gray-200 rounded-lg p-6 mb-8 bg-white"><h3 class="font-bold text-lg text-gray-900">${p.name}</h3><p class="text-3xl font-light text-orange-700 mt-2">S/ ${price.toFixed(2)}</p></div><div class="space-y-3 border-t border-gray-100 pt-6"><div class="flex justify-between text-gray-600 font-medium"><span>Subtotal</span><span>S/ ${price.toFixed(2)}</span></div><div class="flex justify-between text-gray-600 font-medium"><span>IGV (18%)</span><span>S/ ${igv.toFixed(2)}</span></div><div class="flex justify-between text-2xl font-extrabold text-gray-900 pt-4"><span>Total</span><span>S/ ${total.toFixed(2)}</span></div></div></div>
            <div class="p-10 bg-white">
                <h2 class="text-2xl font-extrabold mb-8 text-gray-900">Pago Seguro</h2>
                <form onsubmit="handlePayment(event)" class="space-y-6">
                    <div><label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Titular</label><div class="relative"><i data-lucide="user" class="absolute left-3 top-3.5 w-5 h-5 text-gray-400"></i><input type="text" placeholder="Como aparece en tarjeta" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-700 focus:border-transparent transition-all text-gray-900 font-medium" required></div></div>
                    <div><label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tarjeta</label><div class="relative"><i data-lucide="credit-card" class="absolute left-3 top-3.5 w-5 h-5 text-gray-400"></i><input type="text" placeholder="0000 0000 0000 0000" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-700 focus:border-transparent transition-all text-gray-900 font-medium" required></div></div>
                    <div class="grid grid-cols-2 gap-6">
                        <div><label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Expira</label><div class="relative"><i data-lucide="calendar" class="absolute left-3 top-3.5 w-5 h-5 text-gray-400"></i><input type="text" placeholder="MM / AA" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-700 focus:border-transparent transition-all text-gray-900 font-medium" required></div></div>
                        <div><label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CVV</label><div class="relative"><i data-lucide="lock" class="absolute left-3 top-3.5 w-5 h-5 text-gray-400"></i><input type="password" placeholder="123" class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-700 focus:border-transparent transition-all text-gray-900 font-medium" required></div></div>
                    </div>
                    <button type="submit" class="w-full bg-orange-700 text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-800 transition-all shadow-lg mt-6 transform hover:-translate-y-0.5">Confirmar Pago</button>
                </form>
            </div>
        </div>
    </div>`;
}

function renderDeliveries() {
    // CAMBIO: URL oficial de Google Maps centrada en todo el país (PERÚ)
    const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15800000!2d-75.015152!3d-9.189967!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c850c05914f5%3A0xf29e011279210648!2sPer%C3%BA!5e0!3m2!1ses!2spe";
    
    return `
    <div class="animate-fadeIn">
        <h2 class="text-3xl font-extrabold mb-6">Mapa de Entregas</h2>
        
        <div class="h-96 bg-gray-200 rounded-lg mb-6 overflow-hidden relative border shadow-inner map-container">
            <iframe 
                src="${mapEmbedUrl}" 
                width="100%" 
                height="100%" 
                frameborder="0" 
                style="border:0;" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade">
            </iframe>
        </div>

        <h3 class="font-bold text-lg mb-4">En Curso</h3>
        <div class="space-y-3">
            ${DB.deliveries.map(d => `
                <div class="bg-white p-4 rounded border shadow-sm flex justify-between items-center">
                    <div>
                        <h4 class="font-bold">${d.material}</h4>
                        <p class="text-sm text-gray-500">${d.supplier} • ${d.quantity}</p>
                    </div>
                    <div class="text-right">
                        <span class="inline-block px-2 py-1 text-xs font-bold uppercase rounded ${d.status === 'en ruta' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${d.status}</span>
                        <p class="text-xs text-gray-400 mt-1 font-mono">${d.estimatedArrival}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>`;
}

function renderIncidents() {
    return `
    <div class="animate-fadeIn">
        <h2 class="text-3xl font-extrabold mb-6">Reportar Incidencia</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="space-y-6">
                <div class="bg-white p-6 rounded border shadow-sm"><h3 class="font-bold mb-4 flex items-center"><span class="bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span> Evidencia Visual</h3><div class="h-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-orange-700 hover:text-orange-700 bg-gray-50" onclick="document.getElementById('fileInput').click()"><i data-lucide="upload" class="w-8 h-8 mb-2"></i><span class="text-xs font-bold">SUBIR FOTOS</span><input type="file" id="fileInput" class="hidden" onchange="showAlert('Imagen cargada (simulado)')"></div></div>
                <div class="bg-white p-6 rounded border shadow-sm"><h3 class="font-bold mb-4 flex items-center"><span class="bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span> Nota de Voz</h3><div class="flex items-center justify-between"><p class="text-sm text-gray-500">Describa el problema verbalmente.</p><button onclick="toggleRecording()" class="flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${state.isRecording ? 'bg-red-100 text-red-600 animate-pulse border border-red-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"><i data-lucide="${state.isRecording ? 'square' : 'mic'}" class="w-5 h-5"></i><span>${state.isRecording ? 'Detener' : 'Grabar'}</span></button></div></div>
            </div>
            <div class="space-y-6">
                <div class="bg-white p-6 rounded border shadow-sm"><h3 class="font-bold mb-4 flex items-center"><span class="bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span> Nivel de Severidad</h3><div class="grid grid-cols-3 gap-3"><label class="cursor-pointer relative"><input type="radio" name="sev" class="peer sr-only"><div class="p-3 rounded border text-center hover:bg-gray-50 transition-colors peer-checked:border-red-600 peer-checked:bg-red-50 peer-checked:text-red-700 font-bold">Alta</div></label><label class="cursor-pointer relative"><input type="radio" name="sev" class="peer sr-only"><div class="p-3 rounded border text-center hover:bg-gray-50 transition-colors peer-checked:border-orange-500 peer-checked:bg-orange-50 peer-checked:text-orange-700 font-bold">Media</div></label><label class="cursor-pointer relative"><input type="radio" name="sev" class="peer sr-only" checked><div class="p-3 rounded border text-center hover:bg-gray-50 transition-colors peer-checked:border-green-500 peer-checked:bg-green-50 peer-checked:text-green-700 font-bold">Baja</div></label></div></div>
                <div class="bg-white p-6 rounded border shadow-sm"><h3 class="font-bold mb-4 flex items-center"><span class="bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">4</span> Estado Inicial</h3><div class="relative pt-4"><div class="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wide"><span class="text-orange-700">Reportado</span><span>Asignado</span><span>Resuelto</span></div><div class="h-2 bg-gray-200 rounded-full mt-2 relative overflow-hidden"><div class="absolute top-0 left-0 h-full bg-orange-700 w-1/3"></div></div></div></div>
                <button onclick="showAlert('Reporte Enviado a Central Chimbote'); setView('dashboard')" class="w-full bg-orange-700 text-white py-4 rounded-lg text-xl font-extrabold hover:bg-orange-800 shadow-xl transform hover:-translate-y-1 transition-all">ENVIAR REPORTE</button>
            </div>
        </div>
    </div>`;
}

// --- INICIALIZACIÓN ---

document.addEventListener('click', function(e) {
    if (state.showNotifications && !e.target.closest('#notif-btn') && !e.target.closest('#notif-menu')) { state.showNotifications = false; render(); }
    if (state.showProfileMenu && !e.target.closest('#profile-btn') && !e.target.closest('#profile-menu')) { state.showProfileMenu = false; render(); }
    if (state.showFilters && !e.target.closest('#filter-btn') && !e.target.closest('#filter-menu')) { state.showFilters = false; render(); }
});

document.addEventListener("DOMContentLoaded", function() {
    init();
});
