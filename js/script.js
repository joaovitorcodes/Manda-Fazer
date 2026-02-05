// ======== CONFIGURAÇÕES ========
const CHAVE_PIX = "57178258896";
const NOME_RECEBEDOR = "JOAO VITOR DE CASTRO";
const CIDADE_RECEBEDOR = "SAO PAULO";
const LINK_MERCADO_PAGO = "https://link.mercadopago.com.br/mandafazer";

const PRECOS_BASE = {
    site: 350, logo: 150, resumo: 15, slides: 40,
    digitado: 70, manuscrito: 50, tarefa: 100, exp: 120,
};

const CUPONS_FIXOS = {
    "BEMVINDO": { tipo: "valor", desconto: 10, msg: "Boas-vindas! R$10 de desconto aplicado." },
    "PROMO10": { tipo: "porcentagem", desconto: 0.10, msg: "Cupom Promocional de 10% aplicado!" },
    "MANDAFAZER5": { tipo: "porcentagem", desconto: 0.05, msg: "Cupom de seguidor aplicado!" }
};

// ======== ELEMENTOS ========
const servicoSelect = document.getElementById("servico");
const tipoTrabalhoSelect = document.getElementById("tipo-trabalho");
const tipoFuturoSelect = document.getElementById("tipo-futuro");
const dataEntregaInput = document.getElementById("data_entrega");
const furaFilaCheck = document.getElementById("fura_fila");
const revisaoCheck = document.getElementById("revisao_extra");
const valorDisplay = document.getElementById("valor-servico");
const cupomInput = document.getElementById("cupom");
const msgCupom = document.getElementById("msg-cupom");
const btnEnviar = document.getElementById("btnEnviar");
const form = document.getElementById("formulario");

// ======== GERADOR DE PIX ========
function gerarPayloadPix(valor) {
    const valorTxt = valor.toFixed(2);
    let payload = "000201010212";
    let merchantAccount = `0014BR.GOV.BCB.PIX01${CHAVE_PIX.length.toString().padStart(2, '0')}${CHAVE_PIX}`;
    payload += `26${merchantAccount.length.toString().padStart(2, '0')}${merchantAccount}`;
    payload += "520400005303986";
    payload += `54${valorTxt.length.toString().padStart(2, '0')}${valorTxt}`;
    payload += "5802BR";
    payload += `59${NOME_RECEBEDOR.length.toString().padStart(2, '0')}${NOME_RECEBEDOR}`;
    payload += `60${CIDADE_RECEBEDOR.length.toString().padStart(2, '0')}${CIDADE_RECEBEDOR}`;
    payload += "62070503***6304";

    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
        crc ^= (payload.charCodeAt(i) << 8);
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) crc = (crc << 1) ^ 0x1021;
            else crc <<= 1;
        }
    }
    return payload + (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

/// ======== ATUALIZAÇÃO DE VALORES ========
function atualizarValor() {
    let valorFinal = 0;
    let servicoChave = (servicoSelect.value === "trabalho") 
        ? (tipoTrabalhoSelect.value === "sala-futuro" ? tipoFuturoSelect.value : tipoTrabalhoSelect.value)
        : servicoSelect.value;

    valorFinal = PRECOS_BASE[servicoChave] || 0;

    if (dataEntregaInput.value && valorFinal > 0) {
        const diff = (new Date(dataEntregaInput.value) - new Date()) / (1000 * 60 * 60);
        if (diff < 48 && diff > 0) {
            valorFinal *= 1.20;
            document.getElementById("aviso-urgencia").classList.remove("hidden");
        } else {
            document.getElementById("aviso-urgencia").classList.add("hidden");
        }
    }

    if (furaFilaCheck.checked && valorFinal > 0) valorFinal += 15;
    if (revisaoCheck.checked && valorFinal > 0) valorFinal += 10;

    const cupomDigitado = cupomInput.value.trim().toUpperCase();
    const meuProprioCodigo = (localStorage.getItem("meu_codigo") || "").toUpperCase();
    const statusContainer = document.getElementById("cupom-status-container");
    const cupomIcon = document.getElementById("cupom-icon");

    if (cupomDigitado !== "" && valorFinal > 0) {
        statusContainer.classList.remove("hidden");
        statusContainer.className = ""; 

        // NOVA LÓGICA: Proibir uso do próprio código
        if (meuProprioCodigo !== "" && cupomDigitado === meuProprioCodigo) {
            msgCupom.textContent = "Você não pode usar seu próprio código de indicação";
            statusContainer.classList.add("status-invalido");
            cupomIcon.innerHTML = "🚫";
            // Não subtrai os R$ 15,00 aqui
        } else if (CUPONS_FIXOS[cupomDigitado]) {
            const c = CUPONS_FIXOS[cupomDigitado];
            valorFinal = c.tipo === "valor" ? valorFinal - c.desconto : valorFinal * (1 - c.desconto);
            msgCupom.textContent = c.msg;
            statusContainer.classList.add("status-valido");
            cupomIcon.innerHTML = "✅";
        } else if (cupomDigitado.includes("99K") || cupomDigitado.includes("VIP-") || cupomDigitado.includes("MF-")) {
            // Aceita códigos de outros parceiros (que seguem o padrão), mas não o dele
            valorFinal *= 0.95;
            msgCupom.textContent = "Código de Parceiro Válido (5% OFF)";
            statusContainer.classList.add("status-valido");
            cupomIcon.innerHTML = "✅";
        } else {
            msgCupom.textContent = "Cupom inválido ou expirado";
            statusContainer.classList.add("status-invalido");
            cupomIcon.innerHTML = "❌";
        }
    } else {
        statusContainer.classList.add("hidden");
    }

    const formatado = `R$ ${Math.max(0, valorFinal).toFixed(2)}`;
    valorDisplay.textContent = formatado;
    document.getElementById("valor-pix").textContent = formatado;
    if (valorFinal > 0) document.getElementById("pix-copia-cola").value = gerarPayloadPix(valorFinal);
}

// ======== PROGRAMA DE PARCEIROS ========
function inicializarIndicacao() {
    const salvo = localStorage.getItem("meu_codigo");
    const area = document.getElementById("area-geradora");
    const res = document.getElementById("seu-codigo-resultado");
    const display = document.getElementById("codigo-gerado");

    if (salvo) {
        area.classList.add("hidden");
        res.classList.remove("hidden");
        display.textContent = salvo;
    }

    document.getElementById("btn-gerar-codigo").onclick = () => {
        const nomeCompleto = document.getElementById("nome-indicador").value.trim();
        if (nomeCompleto.length < 3) return alert("Por favor, digite ao menos seu primeiro nome.");
        
        const prefixos = ["VIP", "MF", "TOP", "CLUB", "PRO"];
        const prefixoAleatorio = prefixos[Math.floor(Math.random() * prefixos.length)];
        const primeiroNome = nomeCompleto.split(' ')[0].toUpperCase();
        const numeroAleatorio = Math.floor(100 + Math.random() * 899);
        const codigoFinal = `${prefixoAleatorio}-${primeiroNome}-${numeroAleatorio}`;
        
        localStorage.setItem("meu_codigo", codigoFinal);
        location.reload();
    };

    document.getElementById("btn-reset-codigo").onclick = () => {
        if(confirm("Deseja realmente trocar seu código?")) {
            localStorage.removeItem("meu_codigo");
            location.reload();
        }
    };
}

// ======== ENVIO FORMULÁRIO E LIMPEZA ========
btnEnviar.onclick = async function() {
    const met = document.getElementById("pagamento").value;
    if (!met) return alert("Selecione a forma de pagamento");
    
    if (met === "pix" && document.getElementById("comprovante").files.length === 0) {
        return alert("Anexe o comprovante Pix");
    }

    if (met === "cartao" && this.dataset.pagou !== "sim") {
        window.open(LINK_MERCADO_PAGO, '_blank');
        this.textContent = "✅ JÁ PAGUEI, ENVIAR PEDIDO";
        this.dataset.pagou = "sim";
        return;
    }

    if (form.checkValidity()) {
        const originalText = this.textContent;
        this.textContent = "ENVIANDO...";
        this.disabled = true;

        // Captura o código antes de deletar do storage para o modal
        const codigoParaCompartilhar = localStorage.getItem("meu_codigo") || "MANDAFAZER10";

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                // SUCESSO: Deleta o código do parceiro e mostra modal
                localStorage.removeItem("meu_codigo");
                document.getElementById("codigo-para-compartilhar").textContent = codigoParaCompartilhar;
                document.getElementById("modal-compartilhar").classList.remove("hidden");
            } else {
                alert("Erro ao enviar. Tente novamente.");
            }
        } catch (error) {
            alert("Erro de conexão. Verifique sua internet.");
        } finally {
            this.textContent = originalText;
            this.disabled = false;
        }
    } else {
        form.reportValidity();
    }
};

// Eventos dos Botões do Modal Final
document.getElementById("btn-compartilhar-whatsapp").onclick = () => {
    const codigo = document.getElementById("codigo-para-compartilhar").textContent;
    const texto = encodeURIComponent(`Fiz um pedido no Manda Fazer! Use meu código ${codigo} e ganhe desconto também: ${window.location.origin}`);
    window.open(`https://wa.me/?text=${texto}`, '_blank');
    location.reload(); // Recarrega e apaga tudo
};

document.getElementById("btn-voltar-inicio").onclick = () => {
    location.reload(); // Recarrega e apaga tudo
};

// ======== EVENTOS GERAIS (PRESERVADOS) ========
document.querySelectorAll('input, select, textarea').forEach(el => el.addEventListener('change', atualizarValor));
cupomInput.addEventListener('input', atualizarValor);

servicoSelect.onchange = () => {
    document.getElementById("trabalho-opcoes").classList.toggle("hidden", servicoSelect.value !== "trabalho");
    atualizarValor();
};

tipoTrabalhoSelect.onchange = () => {
    document.getElementById("sala-futuro-opcoes").classList.toggle("hidden", tipoTrabalhoSelect.value !== "sala-futuro");
    atualizarValor();
};

document.getElementById("pagamento").onchange = function() {
    document.getElementById("pix-area").classList.toggle("hidden", this.value !== "pix");
};

// Modal Ajuda Original
const m = document.getElementById("modal-ajuda");
document.getElementById("btn-ajuda").onclick = () => m.classList.remove("hidden");
document.querySelector(".close-modal").onclick = () => m.classList.add("hidden");
document.getElementById("fechar-guia").onclick = () => m.classList.add("hidden");

// Copiar Pix
document.getElementById("copiarPix").onclick = () => {
    const cp = document.getElementById("pix-copia-cola");
    cp.select();
    navigator.clipboard.writeText(cp.value);
    alert("Código Pix copiado com sucesso!");
};

document.addEventListener("DOMContentLoaded", () => {
    inicializarIndicacao();
    atualizarValor();
});