// apontamentos.js - Página de apontamentos
import { setupSidebar, setupHeaderButtons, setupAuth, getUserPropriedade, getUserName, database, ref, get, auth } from './common.js';
import { update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado, configurando página de apontamentos...");
  setupSidebar();
  setupHeaderButtons();
  setupAuth((user, propriedadeNome) => {
    fetchApontamentos(propriedadeNome);
  });
});

async function fetchApontamentos(userPropriedade) {
  const dataContainer = document.getElementById("data-container");
  const propriedadeRef = ref(database, `propriedades/${userPropriedade}/apontamentos`);
  try {
    const snapshot = await get(propriedadeRef);
    if (snapshot.exists()) {
      const apontamentosPromises = [];

      snapshot.forEach((apontamentoSnapshot) => {
        const apontamentoData = apontamentoSnapshot.val();
        const apontamentoPromise = getUserName(apontamentoData.userId, userPropriedade).then((userName) => {
          const isValidado = apontamentoData.validado || false;

          // Processar operações mecanizadas
          const operacoesMecanizadas = apontamentoData.operacoesMecanizadas || {};
          let operacoesHtml = "";

          // Converter objeto de operações em array para iterar
          const operacoes = Object.entries(operacoesMecanizadas).map(([key, value]) => value);

          if (operacoes.length > 0) {
            operacoesHtml = `
              <div class="apontamento-detalhes-section">
                <h4><i class="fas fa-tractor"></i> Operações Mecanizadas</h4>
                <div class="apontamento-detalhes-grid">
                  ${operacoes
                    .map(
                      (op) => `
                    <div class="operacao-mecanizada">
                      <p><i class="fas fa-truck-monster"></i><strong>Equipamento:</strong> ${op.bem || "N/A"}</p>
                      <p><i class="fas fa-tools"></i><strong>Implemento:</strong> ${op.implemento || "N/A"}</p>
                      <p><i class="fas fa-clock"></i><strong>Hora Inicial:</strong> ${op.horaInicial || "N/A"}</p>
                      <p><i class="fas fa-clock"></i><strong>Hora Final:</strong> ${op.horaFinal || "N/A"}</p>
                      <p><i class="fas fa-hourglass-half"></i><strong>Total Horas:</strong> ${op.totalHoras || "N/A"}</p>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
              </div>
            `;
          }

          return `
            <div class="apontamento ${isValidado ? "validado" : "em-andamento"}" data-id="${apontamentoSnapshot.key}">
              <div class="apontamento-info-left">
                <p><i class="fas fa-tasks"></i><strong>Ficha de Controle:</strong> ${apontamentoData.fichaControle || "N/A"}</p>
                <p><i class="fas fa-user"></i><strong>Usuário:</strong> ${userName}</p>
              </div>
              <div class="apontamento-info-right">
                <p><i class="fas fa-calendar"></i><strong>Data:</strong> ${new Date(apontamentoData.timestamp).toLocaleString()}</p>
                ${
                  !isValidado
                    ? `
                  <button class="validar-button" data-propriedade="${userPropriedade}" data-apontamento="${apontamentoSnapshot.key}">
                    <i class="fas fa-check"></i> Validar
                  </button>`
                    : `<p><i class="fas fa-check-circle"></i><strong>Status:</strong> Validado</p>`
                }
              </div>
            </div>
            <div class="modal-overlay" id="modal-${apontamentoSnapshot.key}">
              <div class="apontamento-detalhes">
                <button class="close-modal" data-apontamento="${apontamentoSnapshot.key}">&times;</button>
                <h3><i class="fas fa-clipboard-list"></i> Detalhes do Apontamento</h3>
                <div class="apontamento-detalhes-grid">
                  <p><i class="fas fa-tasks"></i><strong>Ficha de Controle:</strong> ${apontamentoData.fichaControle || "N/A"}</p>
                  <p><i class="fas fa-user"></i><strong>Responsável:</strong> ${userName}</p>
                  <p><i class="fas fa-calendar"></i><strong>Data:</strong> ${apontamentoData.data || new Date(apontamentoData.timestamp).toLocaleDateString()}</p>
                  <p><i class="fas fa-seedling"></i><strong>Cultura:</strong> ${apontamentoData.cultura || "N/A"}</p>
                  <p><i class="fas fa-tractor"></i><strong>Atividade:</strong> ${apontamentoData.atividade || "N/A"}</p>
                  <p><i class="fas fa-compass"></i><strong>Direcionador:</strong> ${apontamentoData.direcionador || "N/A"}</p>
                  <p><i class="fas fa-home"></i><strong>Propriedade:</strong> ${apontamentoData.propriedade || userPropriedade}</p>
                  <p><i class="fas fa-tag"></i><strong>Status:</strong> ${apontamentoData.status || (isValidado ? "Validado" : "Pendente")}</p>
                </div>
                ${
                  apontamentoData.observacao
                    ? `
                <div class="apontamento-detalhes-observacao">
                  <p><i class="fas fa-comment"></i><strong>Observação:</strong> ${apontamentoData.observacao}</p>
                </div>
                `
                    : ""
                }
                ${operacoesHtml}
              </div>
            </div>
          `;
        });
        apontamentosPromises.push(apontamentoPromise);
      });

      const apontamentosHtml = await Promise.all(apontamentosPromises);
      dataContainer.innerHTML = `
        <div class="propriedade">
          <h2><i class="fas fa-clipboard-check"></i> Apontamentos</h2>
          <div class="apontamentos-tabs">
            <button class="tab-button active" data-tab="em-andamento">
              <i class="fas fa-clock"></i> Em Andamento
            </button>
            <button class="tab-button" data-tab="validados">
              <i class="fas fa-check-double"></i> Validados
            </button>
          </div>
          <div class="apontamentos-container">
            ${apontamentosHtml.join("")}
            <div class="empty-apontamentos-message empty-state" style="display: none;">
              <i class="fas fa-info-circle"></i> Nenhum apontamento no momento
            </div>
          </div>
          <div id="confirmationModal" class="confirmation-modal">
            <div class="confirmation-content">
              <h3><i class="fas fa-exclamation-circle"></i> Confirmar Validação</h3>
              <p>Tem certeza que deseja validar este apontamento?</p>
              <div class="confirmation-buttons">
                <button id="confirmValidation" class="confirm-button">Sim, Validar</button>
                <button id="cancelValidation" class="cancel-button">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      `;

      setupTabsAndValidationButtons();
      setupApontamentoClicks();

      // Ativa a aba "Em Andamento" por padrão para verificar se há apontamentos
      const emAndamentoTab = document.querySelector('.tab-button[data-tab="em-andamento"]');
      if (emAndamentoTab) {
        emAndamentoTab.click();
      }
    } else {
      dataContainer.innerHTML = `
        <div class="propriedade">
          <h2><i class="fas fa-clipboard-check"></i> Apontamentos</h2>
          <p class="empty-state">
            <i class="fas fa-info-circle"></i>
            Nenhum apontamento encontrado.
          </p>
        </div>
      `;
    }
  } catch (error) {
    console.error("Erro ao buscar apontamentos:", error);
    dataContainer.innerHTML = `
      <div class="propriedade">
        <h2><i class="fas fa-exclamation-triangle"></i> Erro</h2>
        <p class="error-state">
          <i class="fas fa-exclamation-circle"></i>
          Erro ao carregar os dados: ${error.message}
        </p>
      </div>
    `;
  }
}

function setupTabsAndValidationButtons() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const tabType = e.target.closest(".tab-button").dataset.tab;
      const propriedadeElement = e.target.closest(".propriedade");

      propriedadeElement.querySelectorAll(".tab-button").forEach((btn) => btn.classList.remove("active"));
      e.target.closest(".tab-button").classList.add("active");

      let visibleCount = 0;
      propriedadeElement.querySelectorAll(".apontamento").forEach((apontamento) => {
        const apontamentoId = apontamento.dataset.id;
        const detalhesElement = document.getElementById(`modal-${apontamentoId}`);

        if (tabType === "em-andamento") {
          const isVisible = apontamento.classList.contains("em-andamento");
          apontamento.style.display = isVisible ? "flex" : "none";
          if (detalhesElement) {
            detalhesElement.style.display = isVisible && apontamento.classList.contains("active") ? "block" : "none";
          }
          if (isVisible) visibleCount++;
        } else {
          const isVisible = apontamento.classList.contains("validado");
          apontamento.style.display = isVisible ? "flex" : "none";
          if (detalhesElement) {
            detalhesElement.style.display = isVisible && apontamento.classList.contains("active") ? "block" : "none";
          }
          if (isVisible) visibleCount++;
        }
      });

      // Controla a visibilidade da mensagem de estado vazio
      const emptyMessage = propriedadeElement.querySelector(".empty-apontamentos-message");
      if (emptyMessage) {
        emptyMessage.style.display = visibleCount === 0 ? "flex" : "none";
      }
    });
  });

  document.querySelectorAll(".validar-button").forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.stopPropagation(); // Impedir que o clique se propague para o apontamento

      const propriedadeNome = e.target.dataset.propriedade || e.target.closest(".validar-button").dataset.propriedade;
      const apontamentoKey = e.target.dataset.apontamento || e.target.closest(".validar-button").dataset.apontamento;

      // Mostrar o modal de confirmação
      showConfirmationModal(propriedadeNome, apontamentoKey);
    });
  });
}

function showConfirmationModal(propriedadeNome, apontamentoKey) {
  const modal = document.getElementById("confirmationModal");
  const confirmButton = document.getElementById("confirmValidation");
  const cancelButton = document.getElementById("cancelValidation");

  modal.style.display = "flex";

  confirmButton.onclick = async () => {
    modal.style.display = "none";
    await validateApontamento(propriedadeNome, apontamentoKey);
  };

  cancelButton.onclick = () => {
    modal.style.display = "none";
  };

  // Fechar o modal se clicar fora dele
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  };
}

async function validateApontamento(propriedadeNome, apontamentoKey) {
  try {
    await update(ref(database, `propriedades/${propriedadeNome}/apontamentos/${apontamentoKey}`), {
      validado: true,
    });

    const apontamentoElement = document.querySelector(`.apontamento[data-id="${apontamentoKey}"]`);
    apontamentoElement.classList.remove("em-andamento");
    apontamentoElement.classList.add("validado");
    apontamentoElement.querySelector(".validar-button").remove();

    // Adiciona o status validado
    const statusElement = document.createElement("p");
    statusElement.innerHTML = '<i class="fas fa-check-circle"></i><strong>Status:</strong> Validado';
    apontamentoElement.querySelector(".apontamento-info-right").appendChild(statusElement);

    // Atualizar o status nos detalhes também
    const detalhesElement = document.getElementById(`modal-${apontamentoKey}`);
    if (detalhesElement) {
      const statusDetalhe = detalhesElement.querySelector('p:has(strong:contains("Status"))');
      if (statusDetalhe) {
        statusDetalhe.innerHTML = '<i class="fas fa-tag"></i><strong>Status:</strong> Validado';
      }
    }

    const propriedadeElement = apontamentoElement.closest(".propriedade");
    const validadosTab = propriedadeElement.querySelector('.tab-button[data-tab="validados"]');
    validadosTab.click();

    // Verifica se ainda existem apontamentos em andamento
    const emAndamentoTab = propriedadeElement.querySelector('.tab-button[data-tab="em-andamento"]');
    emAndamentoTab.click();
    validadosTab.click();
  } catch (error) {
    console.error("Erro ao validar apontamento:", error);
    alert("Erro ao validar o apontamento. Por favor, tente novamente.");
  }
}

function setupApontamentoClicks() {
  document.querySelectorAll(".apontamento").forEach((apontamento) => {
    apontamento.addEventListener("click", function (e) {
      // Não expandir se o clique foi no botão de validar
      if (e.target.closest(".validar-button")) {
        return;
      }

      const apontamentoId = this.dataset.id;
      const modalOverlay = document.getElementById(`modal-${apontamentoId}`);

      if (modalOverlay) {
        modalOverlay.style.display = "flex";
      }
    });
  });

  document.querySelectorAll(".close-modal").forEach((closeButton) => {
    closeButton.addEventListener("click", function (e) {
      e.stopPropagation();
      const apontamentoId = this.dataset.apontamento;
      const modalOverlay = document.getElementById(`modal-${apontamentoId}`);

      if (modalOverlay) {
        modalOverlay.style.display = "none";
      }
    });
  });

  document.querySelectorAll(".modal-overlay").forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        this.style.display = "none";
      }
    });
  });
}