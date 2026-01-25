const API_BASE = 'http://localhost:3000';
let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRpZWdvQGV4YW1wbGUuY29tIiwic3ViIjoyLCJyb2xlcyI6WyJ1c2VyIl0sImlhdCI6MTc2OTM0NjMyMSwiZXhwIjoxNzY5MzQ5OTIxfQ.PqTJi8DhYFY4ni8c1QHwrm4tykgxDzOGkeXhvXq9QWU';

// --- FUNCIONES AUXILIARES ---
async function fetchJSON(url, options = {}) {
  if (!options.headers) options.headers = {};
  if (token) options.headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, options);
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${res.statusText}: ${msg}`);
  }
  return res.json();
}

// --- LOGIN ---
async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetchJSON(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    token = res.access_token;
    document.getElementById('loginStatus').innerText = `✅ Login exitoso! ${token}`;
  } catch (err) {
    document.getElementById('loginStatus').innerText = `❌ Error: ${err.message}`;
  }
}

// --- VER TODOS LOS USUARIOS ---
async function getAllUsers() {
  try {
    const users = await fetchJSON(`${API_BASE}/users`);
    const div = document.getElementById('usersList');
    div.innerHTML = users.map(u => `<p>${u.id}: ${u.name} (${u.email}) - ${u.roles}</p>`).join('');
  } catch (err) {
    document.getElementById('usersList').innerText = `❌ Error: ${err.message}`;
  }
}

// --- CREAR USUARIO ---
async function createUser() {
  const name = document.getElementById('newName').value;
  const email = document.getElementById('newEmail').value;
  const age = parseInt(document.getElementById('newEdad').value, 10); // convertir a entero
  const roleInput = document.getElementById('newRole').value;

  // roles debe ser un array y no vacío
  const roles = roleInput ? [roleInput] : [];

  try {
    const user = await fetchJSON(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: '123456', age, roles }),
    });
    document.getElementById('createStatus').innerText = `✅ Usuario creado: ${user.id}`;
    getAllUsers();
  } catch (err) {
    document.getElementById('createStatus').innerText = `❌ Error: ${err.message}`;
  }
}

// --- BUSCAR USUARIO POR ID ---
async function getUserById() {
  const id = document.getElementById('searchId').value;
  if (!id) return;

  try {
    const user = await fetchJSON(`${API_BASE}/users/${id}`);
    document.getElementById('userResult').innerHTML =
      `<p>${user.id}: ${user.name} (${user.email}) - ${user.role}</p>`;
  } catch (err) {
    document.getElementById('userResult').innerText = `❌ Error: ${err.message}`;
  }
}

// --- BORRAR USUARIO ---
async function deleteUser() {
  const id = document.getElementById('deleteId').value;
  if (!id) return;

  try {
    await fetchJSON(`${API_BASE}/users/${id}`, { method: 'DELETE' });
    document.getElementById('deleteStatus').innerText = `✅ Usuario ${id} borrado`;
    getAllUsers();
  } catch (err) {
    document.getElementById('deleteStatus').innerText = `❌ Error: ${err.message}`;
  }
}
