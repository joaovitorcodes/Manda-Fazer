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
const pagamentoSelect = document.getElementById("pagamento");
const pixComprovante = document.getElementById("pix-comprovante");
const comprovanteInput = document.getElementById("comprovante");
const btnEnviar = document.getElementById("btnEnviar");

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

// ======== MOSTRAR CAMPOS PIX ========
pagamentoSelect.addEventListener("change", () => {
  pixComprovante.classList.toggle("hidden", pagamentoSelect.value !== "pix");
  comprovanteInput.required = pagamentoSelect.value === "pix";
});

// ======== VALIDAÇÃO SIMPLES ANTES DO ENVIO ========
btnEnviar.addEventListener("click", () => {
  // Validação RA e senha
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

  // Se PIX, validar comprovante
  if (pagamentoSelect.value === "pix" && (!comprovanteInput || comprovanteInput.files.length === 0)) {
    alert("Por favor, envie o comprovante do PIX.");
    if(comprovanteInput) comprovanteInput.focus();
    return false;
  }

  // Enviar formulário normalmente
  form.submit();
});
