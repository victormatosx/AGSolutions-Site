// configuracoes.js - Página de configurações
import { setupSidebar, setupHeaderButtons, setupAuth } from './common.js';

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado, configurando página de configurações...");
  setupSidebar();
  setupHeaderButtons();
  setupAuth((user, propriedadeNome) => {
    showConfigurationsPage(propriedadeNome);
  });
});

// Função para exibir a página de configurações
function showConfigurationsPage(propriedadeNome) {
  const dataContainer = document.getElementById("data-container");
  dataContainer.innerHTML = `
    <div class="propriedade">
      <h2><i class="fas fa-cog"></i> Configurações</h2>
      <div class="configuracoes-container">
        <div class="apontamento">
          <p><i class="fas fa-user-cog"></i><strong>Perfil:</strong> Configurações de perfil e conta</p>
        </div>
        <div class="apontamento">
          <p><i class="fas fa-bell"></i><strong>Notificações:</strong> Gerenciar preferências de notificações</p>
        </div>
        <div class="apontamento">
          <p><i class="fas fa-palette"></i><strong>Aparência:</strong> Personalizar a interface do sistema</p>
        </div>
        <div class="apontamento">
          <p><i class="fas fa-shield-alt"></i><strong>Segurança:</strong> Configurações de segurança e acesso</p>
        </div>
      </div>
    </div>
  `;
}