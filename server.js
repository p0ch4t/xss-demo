const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies (for form data)
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static('public'));

// Main unified dashboard
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>🛡️ XSS Security Laboratory</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    padding: 20px;
                }
                .container {
                    max-width: 1400px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(45deg, #2c3e50, #34495e);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    position: relative;
                }
                .header h1 {
                    font-size: 2.5em;
                    margin-bottom: 10px;
                }
                .main-content {
                    padding: 30px;
                }
                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 14px;
                    background: linear-gradient(45deg, #3498db, #2980b9);
                    color: white;
                }
                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }
                .tabs {
                    display: flex;
                    border-bottom: 2px solid #f1f1f1;
                    margin-bottom: 30px;
                    overflow-x: auto;
                }
                .tab {
                    padding: 15px 25px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                    color: #7f8c8d;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                }
                .tab.active {
                    color: #2c3e50;
                    border-bottom: 3px solid #3498db;
                }
                .tab:hover {
                    color: #3498db;
                }
                .tab-content {
                    display: none;
                }
                .tab-content.active {
                    display: block;
                    animation: fadeIn 0.3s ease;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .demo-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 25px;
                    margin-top: 20px;
                }
                .demo-card {
                    background: white;
                    border: 1px solid #e9ecef;
                    border-radius: 12px;
                    padding: 25px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                .demo-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(45deg, #3498db, #2980b9);
                }
                .demo-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                }
                .demo-card h3 {
                    color: #2c3e50;
                    margin-bottom: 15px;
                    font-size: 1.3em;
                }
                .demo-card p {
                    color: #7f8c8d;
                    line-height: 1.6;
                    margin-bottom: 15px;
                }
                .demo-form {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin-top: 15px;
                }
                .demo-input {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e9ecef;
                    border-radius: 6px;
                    margin-bottom: 10px;
                    font-size: 14px;
                    transition: border-color 0.3s ease;
                }
                .demo-input:focus {
                    outline: none;
                    border-color: #3498db;
                }
                .demo-textarea {
                    min-height: 80px;
                    resize: vertical;
                }
                .demo-result {
                    margin-top: 15px;
                    padding: 15px;
                    border-radius: 6px;
                    font-family: monospace;
                    font-size: 13px;
                    word-break: break-all;
                }
                .result-safe {
                    background: #d4edda;
                    border: 1px solid #c3e6cb;
                    color: #155724;
                }
                .result-danger {
                    background: #f8d7da;
                    border: 1px solid #f5c6cb;
                    color: #721c24;
                }
                .quick-test {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 8px;
                    padding: 15px;
                    margin-top: 15px;
                }
                .quick-test code {
                    background: #2d3748;
                    color: #68d391;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 12px;
                }
                @media (max-width: 768px) {
                    .demo-grid {
                        grid-template-columns: 1fr;
                    }
                    .control-buttons {
                        flex-direction: column;
                        align-items: center;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🛡️ XSS Security Laboratory</h1>
                    <p style="margin-top: 15px; opacity: 0.9;">Laboratorio interactivo para probar vulnerabilidades XSS y mecanismos de protección</p>
                </div>

                <div class="main-content">
                    <div class="tabs">
                        <button class="tab active" onclick="showTab('xss-demos')">🔍 XSS Demos</button>
                        <button class="tab" onclick="showTab('html-escape')">🔤 HTML Escape</button>
                        <button class="tab" onclick="showTab('cookies-lab')">🍪 Cookies Lab</button>
                    </div>

                    <!-- XSS Demos Tab -->
                    <div class="tab-content active" id="xss-demos">
                        <div class="demo-grid">
                            <div class="demo-card">
                                <h3>🔴 Vulnerable Page</h3>
                                <p>Página completamente vulnerable a XSS sin ninguna protección.</p>
                                <a href="/dom-xss-demo" target="_blank" class="btn btn-info">Abrir Página</a>
                                                                <div class="info-section">
                                    <strong>Características:</strong> Sin filtros ni protecciones<br>
                                    <strong>Vulnerabilidad:</strong> XSS directo
                                </div>
                            </div>

                            <div class="demo-card">
                                <h3>🛡️ Protected Page</h3>
                                <p>Página estática con CSP básico.</p>
                                <a href="/csp-demo" target="_blank" class="btn btn-info">Abrir Página</a>
                                <div class="quick-test">
                                    <strong>Protección:</strong> Content Security Policy<br>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- HTML Escape Tab -->
                    <div class="tab-content" id="html-escape">
                        <div class="demo-grid">
                            <div class="demo-card">
                                <h3>✅ Escape Correcto</h3>
                                <p>Demuestra el escape correcto de caracteres HTML (&lt; y &gt;).</p>
                                <div class="demo-form">
                                    <textarea class="demo-input demo-textarea" id="escapeInput" placeholder="Ingresa HTML para escapar...">&lt;script&gt;alert('test')&lt;/script&gt;</textarea>
                                    <button class="btn btn-info" onclick="testEscape()">🔤 Escapar HTML</button>
                                    <div class="demo-result result-safe" id="escapeResult" style="display:none;"></div>
                                </div>
                                <a href="/html-entities" target="_blank" class="btn btn-info">Ver Demo Completa</a>
                            </div>

                            <div class="demo-card">
                                <h3>🔗 XSS en URLs sin codificar</h3>
                                <p>Demuestra XSS por reflejar entrada del usuario en query parameters sin encoding. Prueba con payloads maliciosos.</p>
                                <div class="demo-form">
                                    <textarea class="demo-input demo-textarea" id="bypassInput" placeholder="Ingresa un término de búsqueda o payload malicioso...">&lt;img src=x onerror="alert('XSS en Query Param!')"&gt;</textarea>
                                    <button class="btn btn-info" onclick="testBypass()">🔗 Probar Query Param</button>
                                    <div class="demo-result result-danger" id="bypassResult" style="display:none;"></div>
                                </div>
                                <a href="/xss-url-encode" target="_blank" class="btn btn-info">Ver Demo Completa</a>
                            </div>

                            <div class="demo-card">
                                <h3>🎭 XSS por Content-Type</h3>
                                <p>Demuestra XSS por Content-Type incorrecto y protección con X-Content-Type-Options.</p>
                                <div class="demo-form">
                                    <textarea class="demo-input demo-textarea" id="contentTypeInput" placeholder="Payload para Content-Type XSS..."><script>alert('Content-Type XSS!')</script></textarea>
                                    <button class="btn btn-info" onclick="testContentType()">🎭 Probar Content-Type</button>
                                    <div class="demo-result result-danger" id="contentTypeResult" style="display:none;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Cookies Lab Tab -->
                    <div class="tab-content" id="cookies-lab">
                        <div class="demo-card">
                            <h3>🍪 SameSite Cookies Laboratory</h3>
                            <p>Laboratorio completo para probar el comportamiento de cookies SameSite y protección CSRF.</p>
                            <div style="margin: 20px 0;">
                                <h4>Tipos de Cookies:</h4>
                                <ul style="margin-left: 20px; line-height: 1.8;">
                                    <li><strong>🔒 SameSite=Strict:</strong> Solo se envía en peticiones del mismo sitio</li>
                                    <li><strong>🟡 SameSite=Lax:</strong> Se envía en navegación de nivel superior desde sitios externos</li>
                                    <li><strong>🟢 SameSite=None:</strong> Se envía en todas las peticiones (requiere Secure)</li>
                                </ul>
                            </div>
                            <a href="/samesite-lab" target="_blank" class="btn btn-info">🧪 Abrir Laboratorio</a>
                        </div>
                    </div>
                </div>
            </div>

            <script>
                // Tab management
                function showTab(tabId) {
                    // Hide all tab contents
                    document.querySelectorAll('.tab-content').forEach(tab => {
                        tab.classList.remove('active');
                    });
                    
                    // Remove active class from all tabs
                    document.querySelectorAll('.tab').forEach(tab => {
                        tab.classList.remove('active');
                    });
                    
                    // Show selected tab content
                    document.getElementById(tabId).classList.add('active');
                    
                    // Add active class to clicked tab
                    event.target.classList.add('active');
                }

                // HTML escape test
                function testEscape() {
                    const input = document.getElementById('escapeInput').value;
                    
                    // Show result in current page too
                    const escaped = input.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    const resultDiv = document.getElementById('escapeResult');
                    resultDiv.textContent = 'Escaped: ' + escaped;
                    resultDiv.style.display = 'block';
                }

                // URL encode test  
                function testBypass() {
                    const input = document.getElementById('bypassInput').value;
                    const encodedInput = encodeURIComponent(input);
                    const url = '/xss-url-encode?term=';
                    
                    // Show result
                    const resultDiv = document.getElementById('bypassResult');
                    resultDiv.innerHTML = 
                        '<strong>Término de búsqueda (inseguro):</strong> ' + input + '<br>' +
                        '<strong>Término de búsqueda (seguro):</strong> ' + encodedInput + '<br>' +
                        '<a href="' + url + '" target="_blank" style="color: #007bff;">🔗 Ver demo completa</a>';
                    resultDiv.style.display = 'block';
                }

                // Content-Type XSS test
                function testContentType() {
                    const input = document.getElementById('contentTypeInput').value;
                    const urlVulnerable = '/api/insecure?input=' + encodeURIComponent(input);
                    const urlProtected = '/api/secure?input=' + encodeURIComponent(input);

                    // Show result
                    const resultDiv = document.getElementById('contentTypeResult');
                    resultDiv.innerHTML = 
                        '<strong>Payload:</strong> ' + input + '<br>' +
                        '<a href="' + urlVulnerable + '" target="_blank" style="color: #dc3545;">🔴 Versión Vulnerable</a> | ' +
                        '<a href="' + urlProtected + '" target="_blank" style="color: #28a745;">🛡️ Versión Protegida</a>';
                    resultDiv.style.display = 'block';
                }
            </script>
        </body>
        </html>
    `);
});

// Route for the vulnerable page
app.get('/dom-xss-demo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'vulnerable.html'));
});

// Route for the protected page with CSP header
app.get('/csp-demo', (req, res) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'"
    );
    res.sendFile(path.join(__dirname, 'public', 'protected.html'));
});

// Route for the X-XSS-Protection page with reflected XSS
app.get('/xss-protection', (req, res) => {
    // Get the search parameter from the URL
    const searchTerm = req.query.search || '';
    
    // Send HTML response with reflected search term
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>CSP with Nonce Demo</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .container {
                    background-color: #f5f5f5;
                    padding: 20px;
                    border-radius: 5px;
                }
                input {
                    width: 100%;
                    padding: 8px;
                    margin: 10px 0;
                }
                button {
                    background-color: #4CAF50;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #45a049;
                }
                .info {
                    background-color: #e7f3fe;
                    border-left: 6px solid #2196F3;
                    padding: 10px;
                    margin: 10px 0;
                }
                .warning {
                    background-color: #fff3cd;
                    border-left: 6px solid #ffc107;
                    padding: 10px;
                    margin: 10px 0;
                }
                .danger {
                    background-color: #f8d7da;
                    border-left: 6px solid #dc3545;
                    padding: 10px;
                    margin: 10px 0;
                }
                .csp-status {
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    padding: 10px;
                    border-radius: 5px;
                    font-weight: bold;
                    ${cspEnabled ? 
                        'background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724;' : 
                        'background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24;'
                    }
                }
            </style>
            <script nonce="${nonce}">
                // Este script se ejecutará porque tiene el nonce correcto
                console.log('Script con nonce válido ejecutado');
            </script>
        </head>
        <body>
            <div class="csp-status">
                CSP: ${cspEnabled ? '✅ ENABLED' : '❌ DISABLED'}
                <br><a href="/" style="color: inherit;">← Dashboard</a>
            </div>
            
            <div class="container">
                <h1>CSP with Nonce Demo</h1>
                <div class="${cspEnabled ? 'info' : 'danger'}">
                    <p>CSP Status: <strong>${cspEnabled ? 'ENABLED' : 'DISABLED'}</strong></p>
                    ${cspEnabled ? `
                        <p>Esta página está protegida con Content Security Policy (CSP) usando nonce.</p>
                        <p>El nonce es un valor aleatorio único generado para cada solicitud.</p>
                        <p>Solo los scripts con el nonce correcto pueden ejecutarse.</p>
                        <p>CSP Header configurado:</p>
                        <pre>Content-Security-Policy: default-src 'self'; script-src 'nonce-${nonce}' 'strict-dynamic'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';</pre>
                    ` : `
                        <p>⚠️ CSP está DESHABILITADO. Esta página está vulnerable a XSS.</p>
                        <p>Los scripts maliciosos pueden ejecutarse sin restricciones.</p>
                        <p>Ve al <a href="/">Dashboard Principal</a> para habilitar CSP.</p>
                    `}
                </div>
                
                <form method="GET" action="/xss-protection">
                    <input type="text" name="search" placeholder="Enter search term..." value="${searchTerm}">
                    <button type="submit">Search</button>
                </form>
                
                <div id="result">
                    ${searchTerm ? `Search results for: ${searchTerm}` : ''}
                </div>

                <div class="warning">
                    <p>Intenta inyectar un script XSS:</p>
                    <p>Ejemplo de payload: <code>&lt;script&gt;alert('XSS Test')&lt;/script&gt;</code></p>
                    ${cspEnabled ? 
                        '<p>✅ Con CSP habilitado, será bloqueado.</p>' : 
                        '<p>❌ Con CSP deshabilitado, se ejecutará.</p>'
                    }
                </div>
            </div>
        </body>
        </html>
    `);
});

// Route for SameSite cookies laboratory
app.get('/samesite-lab', (req, res) => {
    // Set cookies with different SameSite values
    const timestamp = new Date().toISOString();
    
    // Cookie con SameSite=Strict
    res.appendHeader('Set-Cookie', `samesite-strict=strict-${timestamp}; SameSite=Strict; Path=/; HttpOnly`);
    
    // Cookie con SameSite=Lax
    res.appendHeader('Set-Cookie', `samesite-lax=lax-${timestamp}; SameSite=Lax; Path=/; HttpOnly`);
    
    // Cookie con SameSite=None (requiere Secure)
    res.appendHeader('Set-Cookie', `samesite-none=none-${timestamp}; SameSite=None; Secure; Path=/; HttpOnly`);

    const origin = req.headers.origin || 'null'

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Get current cookies from request
    const currentCookies = req.headers.cookie || 'No cookies found';
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>SameSite Cookies Laboratory</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .container {
                    background-color: #f5f5f5;
                    padding: 20px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                }
                .csp-status {
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    padding: 10px;
                    border-radius: 5px;
                    font-weight: bold;
                    ${cspEnabled ? 
                        'background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724;' : 
                        'background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24;'
                    }
                }
                .cookie-info {
                    background-color: #e7f3fe;
                    border-left: 6px solid #2196F3;
                    padding: 15px;
                    margin: 10px 0;
                }
                .cookie-strict {
                    background-color: #ffebee;
                    border-left: 6px solid #f44336;
                    padding: 15px;
                    margin: 10px 0;
                }
                .cookie-lax {
                    background-color: #fff3e0;
                    border-left: 6px solid #ff9800;
                    padding: 15px;
                    margin: 10px 0;
                }
                .cookie-none {
                    background-color: #e8f5e8;
                    border-left: 6px solid #4caf50;
                    padding: 15px;
                    margin: 10px 0;
                }
                .test-section {
                    background-color: #f9f9f9;
                    border: 1px solid #ddd;
                    padding: 15px;
                    margin: 10px 0;
                    border-radius: 5px;
                }
                button {
                    background-color: #4CAF50;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    margin: 5px;
                }
                button:hover {
                    background-color: #45a049;
                }
                pre {
                    background-color: #f4f4f4;
                    padding: 10px;
                    border-radius: 3px;
                    overflow-x: auto;
                }
                .external-link {
                    color: #2196F3;
                    text-decoration: none;
                }
                .external-link:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🍪 SameSite Cookies Laboratory</h1>
                
                <div class="cookie-info">
                    <h2>Cookies Configuradas</h2>
                    <p>Se han configurado 3 cookies con diferentes valores de SameSite:</p>
                    <ul>
                        <li><strong>samesite-strict</strong>: SameSite=Strict</li>
                        <li><strong>samesite-lax</strong>: SameSite=Lax</li>
                        <li><strong>samesite-none</strong>: SameSite=None (requiere Secure)</li>
                    </ul>
                </div>

                <div class="test-section">
                    <h3>Cookies Actuales en esta Petición</h3>
                    <pre>${currentCookies}</pre>
                    <!-- 
                    <div class="test-section">
                    <h3>Cookies Actuales en esta Petición</h3>
                    <pre id="cookies-display">Cargando cookies...</pre>
                    <script>
                    const cookies = document.cookie;
                    const cookiesDisplay = document.getElementById('cookies-display');
                    
                    if (cookies) {
                        cookiesDisplay.textContent = cookies;
                    } else {
                        cookiesDisplay.textContent = 'No cookies found';
                    }
                    </script>
                    </div>
                    -->
                </div>

                <div class="cookie-strict">
                    <h3>🔒 SameSite=Strict</h3>
                    <p><strong>Comportamiento:</strong> La cookie solo se envía en peticiones del mismo sitio.</p>
                    <p><strong>Se envía en:</strong></p>
                    <ul>
                        <li>Navegación directa (escribir URL)</li>
                        <li>Hacer clic en enlaces del mismo sitio</li>
                        <li>Formularios del mismo sitio</li>
                    </ul>
                    <p><strong>NO se envía en:</strong></p>
                    <ul>
                        <li>Peticiones desde sitios externos (CSRF)</li>
                        <li>Enlaces desde sitios externos</li>
                        <li>Formularios desde sitios externos</li>
                        <li>Peticiones AJAX desde sitios externos</li>
                    </ul>
                </div>

                <div class="cookie-lax">
                    <h3>🟡 SameSite=Lax (Default en navegadores modernos)</h3>
                    <p><strong>Comportamiento:</strong> La cookie se envía en peticiones del mismo sitio y en navegación de nivel superior desde sitios externos.</p>
                    <p><strong>Se envía en:</strong></p>
                    <ul>
                        <li>Navegación directa (escribir URL)</li>
                        <li>Hacer clic en enlaces del mismo sitio</li>
                        <li>Hacer clic en enlaces desde sitios externos (navegación de nivel superior)</li>
                        <li>Formularios del mismo sitio</li>
                    </ul>
                    <p><strong>NO se envía en:</strong></p>
                    <ul>
                        <li>Peticiones AJAX desde sitios externos</li>
                        <li>Formularios desde sitios externos</li>
                        <li>Peticiones de terceros (iframes, imágenes, etc.)</li>
                    </ul>
                </div>

                <div class="cookie-none">
                    <h3>🟢 SameSite=None</h3>
                    <p><strong>Comportamiento:</strong> La cookie se envía en todas las peticiones, incluso desde sitios externos.</p>
                    <p><strong>Se envía en:</strong></p>
                    <ul>
                        <li>Todas las peticiones (mismo sitio y sitios externos)</li>
                        <li>Peticiones AJAX desde sitios externos</li>
                        <li>Formularios desde sitios externos</li>
                        <li>Peticiones de terceros</li>
                    </ul>
                    <p><strong>⚠️ Requisito:</strong> Debe tener la flag Secure (solo HTTPS)</p>
                    <p><strong>⚠️ Riesgo:</strong> Vulnerable a ataques CSRF</p>
                </div>

                <div class="test-section">
                    <h3>🧪 Pruebas de Comportamiento</h3>
                    <p>Para probar el comportamiento de las cookies:</p>
                    
                    <h4>1. Prueba de Navegación Directa</h4>
                    <p>Esta página ya demuestra el comportamiento de navegación directa.</p>
                    
                    <h4>2. Prueba de Enlaces Externos</h4>
                    <p>Copia este enlace y pégalo en otro sitio o en la barra de direcciones:</p>
                    <pre>http://localhost:3000/samesite-lab</pre>
                    <a href="http://localhost:3000/samesite-lab">Click aqui</a>                    
                    
                    <h4>3. Prueba de Formulario</h4>
                    <form method="POST" action="http://localhost:3000/samesite-lab">
                        <button type="submit">Enviar Formulario (POST)</button>
                    </form>
                    
                    <h4>4. Prueba de AJAX</h4>
                    <button onclick="testAjax()">Probar Petición AJAX</button>
                    <div id="ajax-result"></div>
                </div>

                <div class="test-section">
                    <h3>📋 Casos de Uso Recomendados</h3>
                    <ul>
                        <li><strong>SameSite=Strict:</strong> Para cookies de autenticación críticas</li>
                        <li><strong>SameSite=Lax:</strong> Para la mayoría de cookies (default recomendado)</li>
                        <li><strong>SameSite=None:</strong> Solo cuando necesitas cookies en peticiones de terceros (con Secure)</li>
                    </ul>
                </div>
            </div>

            <script>
                function testAjax() {
                    fetch('http://localhost:3000/samesite-lab', {
                        method: 'GET',
                        credentials: 'include'
                    })
                    .then(response => response.text())
                    .then(data => {
                        document.getElementById('ajax-result').innerHTML = 
                            '<p><strong>Respuesta AJAX:</strong> Petición enviada con cookies incluidas</p>';
                    })
                    .catch(error => {
                        document.getElementById('ajax-result').innerHTML = 
                            '<p><strong>Error:</strong> ' + error.message + '</p>';
                    });
                }
            </script>
        </body>
        </html>
    `);
});

// Handle POST requests for form testing
app.post('/samesite-lab', (req, res) => {
    const currentCookies = req.headers.cookie || 'No cookies found';
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>SameSite Cookies - POST Result</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .result { background-color: #e7f3fe; padding: 15px; border-radius: 5px; }
                .csp-status {
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    padding: 10px;
                    border-radius: 5px;
                    font-weight: bold;
                    ${cspEnabled ? 
                        'background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724;' : 
                        'background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24;'
                    }
                }
            </style>
        </head>
        <body>
            <h1>Resultado de Formulario POST</h1>
            <div class="result">
                <h3>Cookies enviadas en la petición POST:</h3>
                <pre>${currentCookies}</pre>
            </div>
            <p><a href="http://localhost:3000/samesite-lab">← Volver al laboratorio</a></p>
        </body>
        </html>
    `);
});

// Endpoint para reemplazar < y > por entidades HTML
app.get('/html-entities', (req, res) => {
    const userInput = req.query.input || '';
    // Reemplazar < y > por sus entidades
    const escaped = userInput.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>HTML Entities Escape Demo</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                .container { background-color: #f5f5f5; padding: 20px; border-radius: 5px; }
                textarea { width: 100%; height: 80px; margin: 10px 0; }
                pre { background: #f4f4f4; padding: 10px; border-radius: 3px; }
                .result { background: #e8f5e8; border-left: 6px solid #4caf50; padding: 10px; margin: 10px 0; }
                .method-info { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 10px 0; }
                button { background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
                button:hover { background-color: #0056b3; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Escape de caracteres &lt; y &gt; a entidades HTML</h1>
                
                <div class="method-info">
                    <h3>Método GET (Query Parameters)</h3>
                    <form method="GET" action="/html-entities">
                        <label for="input-get">Ingresa texto con &lt; y &gt;:</label>
                        <textarea name="input" id="input-get">${userInput}</textarea>
                        <button type="submit">Escapar con GET</button>
                    </form>
                </div>

                <div class="method-info">
                    <h3>Método POST (Request Body)</h3>
                    <form method="POST" action="/html-entities">
                        <label for="input-post">Ingresa texto con &lt; y &gt;:</label>
                        <textarea name="input" id="input-post">${userInput}</textarea>
                        <button type="submit">Escapar con POST</button>
                    </form>
                </div>

                ${userInput ? `
                <div class="result">
                    <h3>Resultado escapado (Método: GET):</h3>
                    <pre>${escaped}</pre>
                </div>
                ` : ''}
            </div>
        </body>
        </html>
    `);
});

// Endpoint POST para reemplazar < y > por entidades HTML
app.post('/html-entities', (req, res) => {
    const userInput = req.body.input || '';
    // Reemplazar < y > por sus entidades
    const escaped = userInput.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>HTML Entities Escape Demo - POST Result</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                .container { background-color: #f5f5f5; padding: 20px; border-radius: 5px; }
                textarea { width: 100%; height: 80px; margin: 10px 0; }
                pre { background: #f4f4f4; padding: 10px; border-radius: 3px; }
                .result { background: #e8f5e8; border-left: 6px solid #4caf50; padding: 10px; margin: 10px 0; }
                .method-info { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 10px 0; }
                button { background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
                button:hover { background-color: #0056b3; }
                .post-result { background: #d1ecf1; border-left: 6px solid #0c5460; color: #0c5460; padding: 10px; margin: 10px 0; }
                .csp-status {
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    padding: 10px;
                    border-radius: 5px;
                    font-weight: bold;
                    ${cspEnabled ? 
                        'background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724;' : 
                        'background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24;'
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Escape de caracteres &lt; y &gt; a entidades HTML</h1>
                
                <div class="post-result">
                    <h3>✅ Resultado POST procesado exitosamente</h3>
                    <p><strong>Método usado:</strong> POST</p>
                    <p><strong>Datos enviados por:</strong> Request Body</p>
                </div>

                <div class="method-info">
                    <h3>Método GET (Query Parameters)</h3>
                    <form method="GET" action="/html-entities">
                        <label for="input-get">Ingresa texto con &lt; y &gt;:</label>
                        <textarea name="input" id="input-get"></textarea>
                        <button type="submit">Escapar con GET</button>
                    </form>
                </div>

                <div class="method-info">
                    <h3>Método POST (Request Body)</h3>
                    <form method="POST" action="/html-entities">
                        <label for="input-post">Ingresa texto con &lt; y &gt;:</label>
                        <textarea name="input" id="input-post">${userInput}</textarea>
                        <button type="submit">Escapar con POST</button>
                    </form>
                </div>

                <div class="result">
                    <h3>Resultado escapado (Método: POST):</h3>
                    <pre>${escaped}</pre>
                </div>

                <div style="margin-top: 20px;">
                    <a href="/html-entities" style="color: #007bff; text-decoration: none;">← Volver a la página principal</a> |
                    <a href="/" style="color: #007bff; text-decoration: none;">🏠 Dashboard</a>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Endpoint que demuestra XSS por reflejar entrada del usuario en URLs sin codificar
app.get('/xss-url-encode', (req, res) => {
    // Obtener el parámetro term de la query string
    const searchTerm = req.query.term || '';
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>🚨 XSS por URL sin codificar</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; }
                .container { background-color: #f5f5f5; padding: 25px; border-radius: 10px; }
                input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; }
                button { background-color: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
                button:hover { background-color: #0056b3; }
                .vulnerable { background: #ffebee; border-left: 6px solid #f44336; padding: 20px; margin: 20px 0; }
                .safe { background: #e8f5e8; border-left: 6px solid #4caf50; padding: 20px; margin: 20px 0; }
                .demo-section { background: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; margin: 20px 0; border-radius: 8px; }
                .payload-box { background: #343a40; color: #ffffff; padding: 15px; border-radius: 5px; font-family: monospace; margin: 10px 0; word-break: break-all; }
                pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 15px 0; }
                a { color: #007bff; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚨 XSS por URLs sin codificar</h1>
                
                <div class="demo-section">
                    <h3>🧪 Laboratorio de XSS en URLs como Query Parameters</h3>
                    <p>Este endpoint demuestra cómo reflejar entrada del usuario directamente en URLs como query parameters puede llevar a XSS.</p>
                    
                    <form method="GET" action="/xss-url-encode">
                        <label for="term">Ingresa un término de búsqueda:</label>
                        <input type="text" name="term" id="term" placeholder="Ej: libros">
                        <button type="submit">🔗 Crear Enlaces de Búsqueda</button>
                    </form>
                </div>

                ${searchTerm ? `
                <div class="vulnerable">
                    <h3>❌ Implementación VULNERABLE (Sin encoding):</h3>        
                    <p><strong>Enlaces de búsqueda generados:</strong></p>
                    <div style="border: 2px solid #f44336; padding: 15px; background: white; margin: 10px 0;">
                        
                        <p>🔗 <a href="http://localhost:3000/search?q=${searchTerm}">Link de búsqueda</a></p>
                        
                    </div>
                    <p><strong>⚠️ Riesgo:</strong> Los enlaces contienen la entrada del usuario sin codificar, permitiendo XSS a través de query parameters.</p>
                </div>

                <div class="safe">
                    <h3>✅ Implementación SEGURA (Con encoding):</h3>
                    <p><strong>Enlaces seguros:</strong></p>
                    <div style="border: 2px solid #4caf50; padding: 15px; background: white; margin: 10px 0;">                        
                        <p>🔗 <a href="http://localhost:3000/search?q=${encodeURIComponent(searchTerm)}">Link de búsqueda (seguro)</a></p>
                    </div>
                    <p><strong>✅ Protección:</strong> Los query parameters están correctamente encoded, evitando XSS.</p>
                </div>
                ` : ''}

            <script>
                // Mostrar advertencia para enlaces JavaScript
                document.addEventListener('DOMContentLoaded', function() {
                    const vulnerableLinks = document.querySelectorAll('.vulnerable a[href*="javascript:"]');
                    vulnerableLinks.forEach(link => {
                        link.addEventListener('click', function(e) {
                            if (!confirm('⚠️ ADVERTENCIA: Este enlace contiene JavaScript. ¿Continuar? (Solo para demo)')) {
                                e.preventDefault();
                            }
                        });
                    });
                });
            </script>
        </body>
        </html>
    `);
});

// Endpoint que demuestra XSS por Content-Type incorrecto
app.get('/api/insecure', (req, res) => {
    const userInput = req.query.input || '';
    
    // La respuesta será interpretada como HTML o texto plano dependiendo del Content-Type
    const responseContent = JSON.stringify({ input: userInput });

    res.send(responseContent);
});

// Endpoint que demuestra XSS por Content-Type incorrecto
app.get('/api/secure', (req, res) => {
    const userInput = req.query.input || '';
    
    res.setHeader('Content-Type', 'application/json');
    
    
    // La respuesta será interpretada como HTML o texto plano dependiendo del Content-Type
    const responseContent = JSON.stringify({ input: userInput });

    res.send(responseContent);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 
