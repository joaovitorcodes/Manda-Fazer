const chavePix = document.getElementById("chavePix");
const copiarPix = document.getElementById("copiarPix");
const comprovanteInput = document.getElementById("comprovante");
const confirmarBtn = document.getElementById("confirmarPagamento");
const preview = document.getElementById("preview");
const statusMsg = document.getElementById("statusMsg");

copiarPix.addEventListener("click", () => {
  navigator.clipboard.writeText(chavePix.textContent);
  copiarPix.textContent = "Chave Copiada!";
  setTimeout(() => copiarPix.textContent = "Copiar Chave Pix", 2000);
});

comprovanteInput.addEventListener("change", () => {
  preview.innerHTML = "";
  const file = comprovanteInput.files[0];
  if (file) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);
    confirmarBtn.disabled = false;
  }
});

confirmarBtn.addEventListener("click", async () => {
  const dados = JSON.parse(localStorage.getItem("dadosFormulario") || "{}");
  if (!dados.servico) {
    alert("Erro: nenhum pedido encontrado. Volte e tente novamente.");
    return;
  }

  const formData = new FormData();
  for (const [key, value] of Object.entries(dados)) {
    formData.append(key, value);
  }
  formData.append("comprovante", comprovanteInput.files[0]);

  try {
    const res = await fetch("https://formsubmit.co/seuemail@gmail.com", {
      method: "POST",
      body: formData
    });
    if (res.ok) {
      statusMsg.textContent = "Pedido e pagamento enviados com sucesso!";
      localStorage.removeItem("dadosFormulario");
      comprovanteInput.value = "";
      preview.innerHTML = "";
      confirmarBtn.disabled = true;
    } else {
      statusMsg.textContent = "Erro ao enviar. Tente novamente.";
    }
  } catch (err) {
    statusMsg.textContent = "Erro ao enviar. Verifique sua conexão.";
  }
});
