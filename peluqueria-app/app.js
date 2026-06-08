(function() {
    const supabaseUrl = 'https://juvltquvucgjcwbiprqu.supabase.co';
    const supabaseKey = 'sb_publishable_ceyk0HtjCGQW6vHaQpp3YQ_ZB8g9709';
    const client = supabase.createClient(supabaseUrl, supabaseKey);

    let fechaHoy = new Date();
    let mesVisualizado = fechaHoy.getMonth();
    let añoVisualizado = fechaHoy.getFullYear();

    window.cambiarMes = (delta) => {
        mesVisualizado += delta;
        if (mesVisualizado > 11) { mesVisualizado = 0; añoVisualizado++; }
        if (mesVisualizado < 0) { mesVisualizado = 11; añoVisualizado--; }
        renderizarCalendario();
    };

    function renderizarCalendario() {
        const grid = document.getElementById('calendario-grid');
        const mesTitulo = document.getElementById('mes-titulo');
        const añoTitulo = document.getElementById('año-titulo');
        const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        
        mesTitulo.textContent = meses[mesVisualizado];
        añoTitulo.textContent = añoVisualizado;

        let primerDia = new Date(añoVisualizado, mesVisualizado, 1).getDay();
        const diasEnMes = new Date(añoVisualizado, mesVisualizado + 1, 0).getDate();
        grid.innerHTML = '';
        
        for(let i=0; i<primerDia; i++) grid.appendChild(document.createElement('div'));

        for (let i = 1; i <= diasEnMes; i++) {
            const div = document.createElement('div');
            div.className = "calendario-grid-day";
            div.textContent = i;
            if (i === fechaHoy.getDate() && mesVisualizado === fechaHoy.getMonth() && añoVisualizado === fechaHoy.getFullYear()) div.classList.add('today');
            div.onclick = () => filtrarPorDia(i);
            grid.appendChild(div);
        }
    }

    async function filtrarPorDia(dia) {
        const fecha = `${añoVisualizado}-${(mesVisualizado+1).toString().padStart(2,'0')}-${dia.toString().padStart(2,'0')}`;
        const { data } = await client.from('turnos').select('*').gte('fecha_hora', `${fecha}T00:00:00`).lt('fecha_hora', `${fecha}T23:59:59`);
        
        const lista = document.getElementById('lista-turnos');
        lista.innerHTML = `<h3>Turnos del ${dia}</h3>`;
        if(!data || data.length === 0) lista.innerHTML += '<p>Sin turnos.</p>';
        else data.forEach(t => {
            const hora = new Date(t.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            lista.innerHTML += `<div style="padding:10px; background:white; border-radius:10px; margin-bottom:10px; border-left:4px solid #a88a75;">
                <strong>${hora} hs - ${t.cliente_nombre}</strong><br><small>${t.servicio}</small></div>`;
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        renderizarCalendario();
        document.getElementById('btn-guardar').onclick = async () => {
            const n = document.getElementById('nombre').value;
            const s = document.getElementById('servicio').value;
            const f = document.getElementById('fecha').value;
            const h = document.getElementById('hora').value;
            await client.from('turnos').insert([{ cliente_nombre: n, servicio: s, fecha_hora: `${f}T${h}:00` }]);
            alert("¡Guardado!");
            location.reload();
        };
    });
})();
