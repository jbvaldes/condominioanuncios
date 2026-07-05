<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TV Comunidad</title>
  <!-- Bootstrap CSS (solo para badges y colores) -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- QRCode.js -->
  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: Arial, sans-serif;
      background: #111;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 10px;
    }
    #pantalla {
      width: 100%;
      max-width: 1000px;
      aspect-ratio: 16/9;
      background: black;
      border: 2px solid #333;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .header {
      display: flex;
      justify-content: space-between;
      padding: 1rem 2rem;
      background: #222;
      border-bottom: 2px solid #555;
    }
    .main {
      flex: 1;
      position: relative;
    }
    .slide {
      position: absolute;
      top:0; left:0;
      width:100%; height:100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 2rem;
      opacity: 0;
      transition: opacity 0.5s;
      pointer-events: none;
      color: white;
    }
    .slide.active {
      opacity: 1;
      pointer-events: auto;
    }
    .footer {
      background: #222;
      padding: 0.5rem;
      text-align: center;
      color: #888;
      border-top: 2px solid #555;
    }
    .disclaimer {
      background: rgba(255,0,0,0.8);
      color: white;
      padding: 0.3rem;
      border-radius: 4px;
      position: absolute;
      bottom: 10px;
      left: 10px;
      right: 10px;
    }
  </style>
</head>
<body>
  <div id="pantalla">
    <header class="header">
      <span class="badge bg-secondary" id="logo-edificio">🏢 Logo Edificio</span>
      <span class="badge bg-secondary" id="logo-admin">🏢 Logo Admin</span>
    </header>

    <main class="main">
      <!-- Slide 1: Anuncio -->
      <div class="slide active" id="slide-anuncio">
        <h2 class="text-warning">📢 Aviso importante</h2>
        <div style="font-size:2.5rem; font-weight:bold;" id="anuncio-texto"></div>
        <div style="font-size:1.2rem; color:#ccc;" id="anuncio-fecha"></div>
        <canvas id="qr-anuncio" width="130" height="130" style="margin:0.5rem;"></canvas>
        <div style="font-size:1.8rem; color:#4fc3f7;" id="reloj"></div>
      </div>
      <!-- Slide 2: Recordatorio -->
      <div class="slide" id="slide-recordatorio">
        <h2 class="text-warning">📌 Recordatorio</h2>
        <div style="font-size:2.5rem; font-weight:bold;" id="recordatorio-texto"></div>
      </div>
      <!-- Slide 3: Publicidad -->
      <div class="slide" id="slide-publicidad">
        <h2 class="text-warning">📣 Publicidad</h2>
        <div style="font-size:2rem; font-weight:bold; color:#ffb74d;" id="patrocinador-texto"></div>
        <canvas id="qr-publicidad" width="150" height="150" style="margin:0.5rem;"></canvas>
        <div class="disclaimer">⚠️ Servicio externo. Responsabilidad del prestador.</div>
      </div>
      <!-- Slide 4: Clima -->
      <div class="slide" id="slide-clima">
        <h2 class="text-warning">🌤️ Clima en Independencia</h2>
        <div style="font-size:2rem; font-weight:bold;" id="clima-texto">Cargando...</div>
      </div>
      <!-- Slide 5: Comunidad -->
      <div class="slide" id="slide-comunidad">
        <h2 class="text-warning">🤝 ¿Quieres ser parte?</h2>
        <p style="font-size:1.8rem; color:#ccc;">Escanea el QR</p>
        <canvas id="qr-comunidad" width="150" height="150"></canvas>
      </div>
    </main>

    <footer class="footer" id="credito"></footer>
  </div>

  <script>
    (function() {
      // --- Datos de prueba ---
      const datos = {
        anuncio: {
          texto: "🎉 Reunión de copropietarios mañana a las 20:00 hrs",
          fecha: "25/06/2026 09:00",
          qrUrl: "https://wa.me/56912345678"
        },
        config: {
          logo_edificio: "🏢 Edificio Demo",
          logo_admin: "🏢 Admin Demo",
          credito: "Desarrollado ad honorem por [Tu Nombre]",
          patrocinador: "Gasfitería Pro - +56987654321",
          avisos: ["🐶 Mascotas con correa", "🤫 Silencio 22-08", "🚗 Estacionar asignado"]
        }
      };

      // --- Aplicar datos ---
      document.getElementById('logo-edificio').innerText = datos.config.logo_edificio;
      document.getElementById('logo-admin').innerText = datos.config.logo_admin;
      document.getElementById('credito').innerText = datos.config.credito;
      document.getElementById('anuncio-texto').innerText = datos.anuncio.texto;
      document.getElementById('anuncio-fecha').innerText = "Publicado: " + datos.anuncio.fecha;
      document.getElementById('patrocinador-texto').innerText = datos.config.patrocinador;

      // --- Reloj ---
      function reloj() {
        const ahora = new Date();
        document.getElementById('reloj').innerText = ahora.toLocaleString('es-CL');
      }
      setInterval(reloj, 1000);
      reloj();

      // --- QR (con manejo de carga) ---
      function generarQR(canvasId, texto) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || !texto) return;
        if (typeof QRCode === 'undefined') {
          setTimeout(() => generarQR(canvasId, texto), 500);
          return;
        }
        QRCode.toCanvas(canvas, texto, { width: canvas.width }, function(error) {
          if (error) {
            console.warn('Error QR:', error);
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.fillStyle = 'black';
            ctx.font = '12px Arial';
            ctx.fillText('QR error', 10, canvas.height/2);
          }
        });
      }
      generarQR('qr-anuncio', datos.anuncio.qrUrl);
      generarQR('qr-publicidad', 'https://wa.me/56987654321');
      generarQR('qr-comunidad', 'https://wa.me/56912345678');

      // --- Clima (Independencia) ---
      async function cargarClima() {
        try {
          const resp = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-33.4137&longitude=-70.6786&current_weather=true&timezone=America/Santiago');
          if (!resp.ok) throw new Error('Error red');
          const data = await resp.json();
          if (data.current_weather) {
            const temp = Math.round(data.current_weather.temperature);
            const viento = data.current_weather.windspeed;
            const codigo = data.current_weather.weathercode;
            const desc = {0:'Despejado',1:'Parcial nublado',2:'Nublado',3:'Muy nublado',45:'Niebla',48:'Niebla escarcha',51:'Llovizna',61:'Lluvia',80:'Chubascos',95:'Tormenta'}[codigo]||'Desconocido';
            document.getElementById('clima-texto').innerText = `${desc} - ${temp}°C (viento ${viento} km/h)`;
          } else {
            document.getElementById('clima-texto').innerText = 'Independencia - Sin datos';
          }
        } catch(e) {
          document.getElementById('clima-texto').innerText = 'Independencia - Error de conexión';
        }
      }
      cargarClima();

      // --- Carrusel ---
      const slides = document.querySelectorAll('.slide');
      let actual = 0;
      const duraciones = [12000, 8000, 10000, 6000, 10000];

      function cambiarA(index) {
        slides[actual].classList.remove('active');
        actual = index;
        slides[actual].classList.add('active');
        if (actual === 1) {
          const fijos = datos.config.avisos;
          document.getElementById('recordatorio-texto').innerText = fijos[Math.floor(Math.random() * fijos.length)];
        }
      }

      function siguiente() {
        const idx = (actual + 1) % slides.length;
        cambiarA(idx);
        setTimeout(siguiente, duraciones[idx]);
      }
      setTimeout(siguiente, duraciones[0]);
    })();
  </script>
</body>
</html>
