function go(id){
    document.querySelectorAll('.screen').forEach(s => 
        s.classList.remove('active')
    );

    document.getElementById(id).classList.add('active');
}

// ================= CALENDÁRIO =================
function gerarCalendario() {
    const calendar = document.getElementById("calendar");

    // limpa antes
    calendar.innerHTML = "";

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();

    // quantidade de dias no mês
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    for (let dia = 1; dia <= diasNoMes; dia++) {
        const div = document.createElement("div");
        div.classList.add("day");
        div.textContent = dia;

        // destaca o dia atual
        if (dia === hoje.getDate()) {
            div.classList.add("active");
        }

        calendar.appendChild(div);
    }
}

// roda quando abrir a página
window.onload = gerarCalendario;