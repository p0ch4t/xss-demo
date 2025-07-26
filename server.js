const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();
const port = 3000;

// Serve static files from the public directory
app.use(express.static('public'));

// Route for the vulnerable page
app.get('/vulnerable', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'vulnerable.html'));
});

// Route for the protected page with CSP header
app.get('/protected', (req, res) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'"
    );
    res.sendFile(path.join(__dirname, 'public', 'protected.html'));
});

// Función para generar un nonce aleatorio
function generateNonce() {
    return crypto.randomBytes(16).toString('base64');
}

// Route for the X-XSS-Protection page with reflected XSS
app.get('/xss-protection', (req, res) => {
    // Generar un nonce único para esta solicitud
    const nonce = generateNonce();
    
    // Configurar CSP con nonce
    res.setHeader(
        'Content-Security-Policy',
        `default-src 'self'; script-src 'nonce-${nonce}' 'strict-dynamic'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';`
    );
    
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
            </style>
            <script nonce="${nonce}">
                // Este script se ejecutará porque tiene el nonce correcto
                console.log('Script con nonce válido ejecutado');
            </script>
        </head>
        <body>
            <div class="container">
                <h1>CSP with Nonce Demo</h1>
                <div class="info">
                    <p>Esta página está protegida con Content Security Policy (CSP) usando nonce.</p>
                    <p>El nonce es un valor aleatorio único generado para cada solicitud.</p>
                    <p>Solo los scripts con el nonce correcto pueden ejecutarse.</p>
                    <p>CSP Header configurado:</p>
                    <pre>Content-Security-Policy: default-src 'self'; script-src 'nonce-${nonce}' 'strict-dynamic'; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';</pre>
                </div>
                
                <form method="GET" action="/xss-protection">
                    <input type="text" name="search" placeholder="Enter search term..." value="${searchTerm}">
                    <button type="submit">Search</button>
                </form>
                
                <div id="result">
                    ${searchTerm ? `Search results for: ${searchTerm}` : ''}
                </div>

                <div class="warning">
                    <p>Intenta inyectar un script XSS. Será bloqueado por CSP incluso si no tiene el nonce correcto.</p>
                    <p>Ejemplo de payload que será bloqueado: <code>&lt;script&gt;alert(1)&lt;/script&gt;</code></p>
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
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Escape de caracteres &lt; y &gt; a entidades HTML</h1>
                <form method="GET" action="/html-entities">
                    <label for="input">Ingresa texto con &lt; y &gt;:</label>
                    <textarea name="input" id="input">${userInput}</textarea>
                    <button type="submit">Escapar</button>
                </form>
                <div class="result">
                    <h3>Resultado escapado:</h3>
                    <pre>${escaped}</pre>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Endpoint que demuestra el bypass de XSS escapando antes de decodificar
app.get('/html-entities-bypass', (req, res) => {
    // Obtener el input crudo de la query string
    const url = require('url');
    const parsedUrl = url.parse(req.url);
    let rawInput = '';
    if (parsedUrl.query) {
        const match = parsedUrl.query.match(/input=([^&]*)/);
        if (match) {
            rawInput = match[1]; // Esto es aún URL-encoded
        }
    }
    // INCORRECTO: Escapar antes de decodificar
    const escapedBeforeDecode = rawInput.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // CORRECTO: Decodificar antes de escapar
    const decoded = decodeURIComponent(rawInput);
    const escapedAfterDecode = decoded.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Bypass de HTML Entities por orden incorrecto</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                .container { background-color: #f5f5f5; padding: 20px; border-radius: 5px; }
                textarea { width: 100%; height: 80px; margin: 10px 0; }
                pre { background: #f4f4f4; padding: 10px; border-radius: 3px; }
                .danger { background: #ffebee; border-left: 6px solid #f44336; padding: 10px; margin: 10px 0; }
                .safe { background: #e8f5e8; border-left: 6px solid #4caf50; padding: 10px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Bypass de XSS por escape antes de decodificar</h1>
                <form method="GET" action="/html-entities-bypass">
                    <label for="input">Ingresa texto URL-encoded (ej: %3Cscript%3Ealert(1)%3C%2Fscript%3E):</label>
                    <textarea name="input" id="input">${rawInput}</textarea>
                    <button type="submit">Probar</button>
                </form>
                <div class="danger">
                    <h3>❌ Escape antes de decodificar (Vulnerable):</h3>
                    <pre>${escapedBeforeDecode}</pre>
                    <div>Renderizado:</div>
                    <div style="border:1px solid #f44336; padding:10px;">${escapedBeforeDecode}</div>
                </div>
                <div class="safe">
                    <h3>✅ Decodificar antes de escapar (Seguro):</h3>
                    <pre>${escapedAfterDecode}</pre>
                    <div>Renderizado:</div>
                    <div style="border:1px solid #4caf50; padding:10px;">${escapedAfterDecode}</div>
                </div>
                <div>
                    <h4>Prueba con este payload:</h4>
                    <pre>%3Cscript%3Ealert(1)%3C%2Fscript%3E</pre>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 