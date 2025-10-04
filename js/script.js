// ======== ELEMENTOS ========
const servicoSelect = document.getElementById("servico");
const tipoTrabalhoSelect = document.getElementById("tipo-trabalho");
const tipoFuturoSelect = document.getElementById("tipo-futuro");
const valorDisplay = document.getElementById("valor-servico");

const trabalhoOpcoes = document.getElementById("trabalho-opcoes");
const salaFuturoOpcoes = document.getElementById("sala-futuro-opcoes");
const raSenhaBox = document.getElementById("ra-senha");
const raInput = document.getElementById("ra");
const senhaInput = document.getElementById("senha");

const form = document.getElementById("formulario");

// ======== FUNÇÃO PARA ATUALIZAR VALOR ========
function atualizarValor() {
  let valor = 0;

  switch (servicoSelect.value) {
    case "site":
      valor = 350;
      break;
    case "logo":
      valor = 150;
      break;
    case "trabalho":
      const tipo = tipoTrabalhoSelect.value;
      if (tipo === "digitado") valor = 70;
      else if (tipo === "manuscrito") valor = 50;
      else if (tipo === "sala-futuro") {
        const subtipo = tipoFuturoSelect.value;
        if (subtipo === "tarefa") valor = 100;
        else if (subtipo === "exp") valor = 120;
      }
      break;
    case "outro":
      valor = 0;
      break;
  }

  valorDisplay.textContent = `R$ ${valor.toFixed(2)}`;
}

// ======== FUNÇÃO PARA MOSTRAR/ESCONDER RA E SENHA ========
function atualizarRaSenha() {
  if (!tipoFuturoSelect) return;
  const val = tipoFuturoSelect.value;
  if (val === "tarefa" || val === "exp") {
    raSenhaBox.classList.remove("hidden");
    raInput.required = true;
    senhaInput.required = true;
  } else {
    raSenhaBox.classList.add("hidden");
    raInput.required = false;
    senhaInput.required = false;
    raInput.value = "";
    senhaInput.value = "";
  }
}

// ======== MOSTRAR CAMPOS DINÂMICOS ========
servicoSelect.addEventListener("change", () => {
  trabalhoOpcoes.classList.toggle("hidden", servicoSelect.value !== "trabalho");
  if (servicoSelect.value !== "trabalho") {
    salaFuturoOpcoes.classList.add("hidden");
    raSenhaBox.classList.add("hidden");
    raInput.required = false;
    senhaInput.required = false;
    raInput.value = "";
    senhaInput.value = "";
  }
  atualizarValor();
});

tipoTrabalhoSelect.addEventListener("change", () => {
  salaFuturoOpcoes.classList.toggle("hidden", tipoTrabalhoSelect.value !== "sala-futuro");
  if (tipoTrabalhoSelect.value !== "sala-futuro") {
    raSenhaBox.classList.add("hidden");
    raInput.required = false;
    senhaInput.required = false;
    raInput.value = "";
    senhaInput.value = "";
  }
  atualizarValor();
});

tipoFuturoSelect.addEventListener("change", () => {
  atualizarValor();
  atualizarRaSenha();
});

// ======== ENVIO SILENCIOSO FORMSPREE ========
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  // Validação RA e senha se visível
  if (!raSenhaBox.classList.contains("hidden")) {
    if (raInput.value.trim().length < 3) {
      alert("Por favor, coloque um RA válido (mínimo 3 caracteres).");
      raInput.focus();
      return false;
    }
    if (senhaInput.value.trim() === "") {
      alert("Por favor, informe a senha de acesso à Sala do Futuro.");
      senhaInput.focus();
      return false;
    }
  }

  const data = {
    nome: form.nome.value,
    email: form.email.value,
    contato: form.contato.value,
    mensagem: form.mensagem.value,
    servico: form.servico.value,
    tipo_trabalho: form["tipo-trabalho"]?.value || "",
    tipo_futuro: form["tipo-futuro"]?.value || "",
    serie: form.serie?.value || "",
    ra: form.ra?.value || "",
    senha: form.senha?.value || "",
    detalhe: form.detalhe.value,
    prazo: form.prazo.value,
    pagamento: form.pagamento.value,
    valor: valorDisplay.textContent
  };

  try {
    await fetch(form.action, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    // Limpar formulário após envio
    form.reset();
    valorDisplay.textContent = "R$ 0,00";
    trabalhoOpcoes.classList.add("hidden");
    salaFuturoOpcoes.classList.add("hidden");
    raSenhaBox.classList.add("hidden");
  } catch (error) {
    // Nenhuma mensagem será mostrada ao cliente
  }
});
