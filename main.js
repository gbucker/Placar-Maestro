/**
 * Placar Maestro - Sistema de Pontuação para Jogos de Improvisação
 * 
 * Este script implementa um sistema de placar para jogos de improvisação teatral,
 * gerenciando jogadores, pontuações, eliminações e rodadas de jogo.
 * 
 * Principais funcionalidades:
 * - Gerenciamento de jogadores e pontuações
 * - Sorteio aleatório de jogadores para cenas
 * - Sistema de eliminação com tratamento de empates
 * - Persistência de estado via localStorage
 * - Interface responsiva e feedback visual
 * 
 * @author Guilherme Bucker
 * @version 1.0.0
 */

document.addEventListener('DOMContentLoaded', () => {
    /**
     * ===== ESTADO GLOBAL DA APLICAÇÃO =====
     * @type {Array<Object>} players - Lista de jogadores com suas propriedades
     * @type {Array<string>} history - Histórico de estados para função desfazer
     * @type {Array<number>} currentScene - IDs dos jogadores na cena atual
     * @type {number} maxScoreForUI - Pontuação máxima para escala visual
     * @type {number} currentRound - Número da rodada atual
     */
    let players = [];
    let history = [];
    let currentScene = [];
    let maxScoreForUI = 30;
    let currentRound = 1;

    // ===== FUNÇÕES DE PERSISTÊNCIA =====
    /**
     * Salva o estado atual do jogo no localStorage.
     * Armazena informações sobre jogadores, cena atual, pontuação máxima,
     * rodada atual e timestamp da última alteração.
     */
    function saveToLocalStorage() {
        const gameState = {
            players,
            currentScene,
            maxScoreForUI,
            currentRound,
            timestamp: Date.now()
        };
        localStorage.setItem('placarMaestroState', JSON.stringify(gameState));
    }

    /**
     * Carrega o estado do jogo salvo no localStorage.
     * @returns {boolean} true se um estado foi carregado com sucesso, false caso contrário
     */
    function loadFromLocalStorage() {
        const savedState = localStorage.getItem('placarMaestroState');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            players = gameState.players;
            currentScene = gameState.currentScene;
            maxScoreForUI = gameState.maxScoreForUI;
            currentRound = gameState.currentRound || 1;
            return true;
        }
        return false;
    }

    /**
     * Limpa todos os dados salvos do jogo no localStorage.
     */
    function clearLocalStorage() {
        localStorage.removeItem('placarMaestroState');
    }

    // ===== SELETORES DE ELEMENTOS DOM =====
    const setupSection = document.querySelector('[data-section="setup"]');
    const gameSection = document.querySelector('[data-section="game"]');
    const startShowBtn = document.querySelector('[data-action="start-show"]');
    const playerNamesInput = document.querySelector('[data-input="player-names"]');
    const drawPlayersBtn = document.querySelector('[data-action="draw-players"]');
    const scenePlayerCount = document.querySelector('[data-input="scene-player-count"]');
    const roundNumberDisplay = document.querySelector('[data-display="round"]');
    const currentSceneDisplay = document.querySelector('[data-display="current-scene"]');
    const scoreboardPlayerList = document.querySelector('[data-list="active-players"]');
    const eliminatedPlayerList = document.querySelector('[data-list="eliminated-players"]');
    const eliminatePlayersBtn = document.querySelector('[data-action="eliminate-players"]');
    const eliminateCountInput = document.querySelector('[data-input="eliminate-count"]');
    const undoBtn = document.querySelector('[data-action="undo"]');
    const resetShowBtn = document.querySelector('[data-action="reset-show"]');
    const winnerModal = document.querySelector('[data-modal="winner"]');
    const winnerModalContent = document.querySelector('.modal-content');
    const winnerName = document.querySelector('[data-display="winner-name"]');
    const closeWinnerModalBtn = document.querySelector('[data-action="close-winner-modal"]');
    const drawBowl = document.querySelector('[data-bowl="draw"]');
    const discardBowl = document.querySelector('[data-bowl="discard"]');
    const controlsContainer = document.querySelector('[data-container="controls"]');
    const toggleControlsBtn = document.querySelector('[data-action="toggle-controls"]');

    // ===== FUNÇÕES DE MANIPULAÇÃO DE ESTADO =====
    function saveState() {
        history.push(JSON.stringify({ players, maxScoreForUI, currentRound, currentScene }));
        if (history.length > 20) {
            history.shift();
        }
        updateUndoButton();
    }
    function loadState(state) {
        const parsedState = JSON.parse(state);
        players = parsedState.players;
        maxScoreForUI = parsedState.maxScoreForUI;
        currentRound = parsedState.currentRound || 1;
        currentScene = parsedState.currentScene || [];
        render();
        renderCurrentScene();
    }
    function updateUndoButton() {
        undoBtn.disabled = history.length === 0;
        undoBtn.classList.toggle('opacity-50', history.length === 0);
    }
    function updateButtonStates() {
        const activePlayers = players.filter(p => p.status === 'active');
        const allHavePlayed = activePlayers.every(p => p.hasPlayedInRound);

        // Atualiza o botão de eliminação
        if (activePlayers.length <= 1) {
            eliminatePlayersBtn.disabled = true;
            eliminatePlayersBtn.classList.add('opacity-50', 'cursor-not-allowed');
            eliminatePlayersBtn.title = "Não há jogadores suficientes para eliminar.";
        } else {
            eliminatePlayersBtn.disabled = !allHavePlayed;
            eliminatePlayersBtn.classList.toggle('opacity-50', !allHavePlayed);
            eliminatePlayersBtn.classList.toggle('cursor-not-allowed', !allHavePlayed);
            if (!allHavePlayed) {
                eliminatePlayersBtn.title = "A eliminação só é permitida quando todos os jogadores ativos tiverem jogado na rodada.";
            } else {
                eliminatePlayersBtn.title = "Eliminar os jogadores com as pontuações mais baixas.";
            }
        }
    }

    // ===== FUNÇÕES DE RENDERIZAÇÃO =====
    function renderBowls() {
        if (!drawBowl || !discardBowl) return;
        drawBowl.innerHTML = '';
        discardBowl.innerHTML = '';
        const activePlayers = players.filter(p => p.status === 'active');
        activePlayers.sort((a, b) => a.id - b.id);
        activePlayers.forEach(player => {
            const token = document.createElement('div');
            token.className = 'player-token';
            token.textContent = player.id;
            token.title = `#${player.id} ${player.name}`;
            if (player.hasPlayedInRound) {
                discardBowl.appendChild(token);
            } else {
                drawBowl.appendChild(token);
            }
        });
    }
    function renderRoundNumber() {
        if (roundNumberDisplay) {
            roundNumberDisplay.textContent = `Rodada ${currentRound}`;
        }
    }
    function render() {
        if (!scoreboardPlayerList || !eliminatedPlayerList) {
            console.error('Scoreboard elements not found:', {
                scoreboardPlayerList: !!scoreboardPlayerList,
                eliminatedPlayerList: !!eliminatedPlayerList
            });
            return;
        }
        
        scoreboardPlayerList.innerHTML = '';
        eliminatedPlayerList.innerHTML = '';
        renderRoundNumber();
        renderBowls();
        
        const activePlayers = players.filter(p => p.status === 'active');
        console.log('Active players:', activePlayers);
        const eliminatedPlayers = players.filter(p => p.status === 'eliminated');
        
        activePlayers.sort((a, b) => b.score - a.score);
        const currentMaxScore = Math.max(...activePlayers.map(p => p.score), 0);
        maxScoreForUI = Math.max(30, currentMaxScore);
        
        activePlayers.forEach(player => {
            const scorePercent = Math.min(100, (player.score / maxScoreForUI) * 100);
            
            const playerRow = document.createElement('div');
            playerRow.className = 'flex items-center mb-4';
            playerRow.innerHTML = `
                <div class="w-1/3 md:w-1/4 pr-2">
                    <div class="name-tag py-1 px-2 rounded truncate" title="#${player.id} ${player.name} (${player.score})">
                        #${player.id} ${player.name} (${player.score})
                    </div>
                </div>
                <div class="w-2/3 md:w-3/4">
                    <div class="score-track">
                        <div class="score-marker-line" style="left: ${100 * 5/maxScoreForUI}%;"></div>
                        <div class="score-marker-line" style="left: ${100 * 10/maxScoreForUI}%;"></div>
                        <div class="score-marker-line" style="left: ${100 * 15/maxScoreForUI}%;"></div>
                        <div class="score-marker-line" style="left: ${100 * 20/maxScoreForUI}%;"></div>
                        <div class="score-marker-line" style="left: ${100 * 25/maxScoreForUI}%;"></div>
                        <div class="score-marker-line" style="left: ${100 * 30/maxScoreForUI}%;"></div>
                        <div class="player-marker" style="left: ${scorePercent}%;"></div>
                    </div>
                </div>
            `;
            scoreboardPlayerList.appendChild(playerRow);
        });
        
        eliminatedPlayers.forEach(player => {
            const elimSpan = document.createElement('span');
            elimSpan.className = 'inline-block bg-gray-700 text-gray-300 px-3 py-1 rounded';
            elimSpan.textContent = `#${player.id} ${player.name}`;
            eliminatedPlayerList.appendChild(elimSpan);
        });
        
        if (currentScene.length === 0) {
            checkPoolWarnings();
        }
        updateButtonStates();
    }
    function checkPoolWarnings() {
        if (!currentSceneDisplay || currentScene.length > 0) return;
        
        const pool = players.filter(p => p.status === 'active' && !p.hasPlayedInRound);
        
        if (pool.length === 3) {
            currentSceneDisplay.textContent = 'ATENÇÃO: Apenas 3 jogadores restantes para sorteio!';
            currentSceneDisplay.classList.add('text-yellow-400');
            currentSceneDisplay.classList.remove('text-gray-400', 'text-green-400');
        } else if (pool.length === 1) {
            currentSceneDisplay.textContent = 'ATENÇÃO: Apenas 1 jogador restante para sorteio!';
            currentSceneDisplay.classList.add('text-yellow-400');
            currentSceneDisplay.classList.remove('text-gray-400', 'text-green-400');
        } else if (pool.length === 0) {
            currentSceneDisplay.textContent = 'Todos os jogadores já se apresentaram nesta rodada.';
            currentSceneDisplay.classList.add('text-gray-400');
            currentSceneDisplay.classList.remove('text-yellow-400', 'text-green-400');
        } else {
            currentSceneDisplay.textContent = `${pool.length} jogadores disponíveis para sorteio.`;
            currentSceneDisplay.classList.add('text-gray-400');
            currentSceneDisplay.classList.remove('text-yellow-400', 'text-green-400');
        }
    }
    function renderCurrentScene() {
        if (!currentSceneDisplay) return;
        
        if (!currentScene || currentScene.length === 0) {
            checkPoolWarnings();
            return;
        }
        
        const scenePlayerNames = currentScene.map(id => {
            const player = players.find(p => p.id === id);
            if (!player) return `#${id}`;
            return `#${player.id} ${player.name}`;
        }).join(', ');
        currentSceneDisplay.textContent = `EM CENA: ${scenePlayerNames}`;
        currentSceneDisplay.classList.add('text-green-400');
        currentSceneDisplay.classList.remove('text-gray-400', 'text-yellow-400');
    }
    function checkWinner() {
        const activePlayers = players.filter(p => p.status === 'active');
        if (activePlayers.length === 1) {
            const winner = activePlayers[0];
            if (winnerModal && winnerName) {
                winnerName.textContent = `#${winner.id} ${winner.name}`;
                winnerModal.classList.remove('hidden');
            }
        }
    }

    // ===== HANDLERS DE EVENTOS =====
    /**
     * Sanitiza um nome de jogador removendo caracteres especiais e normalizando espaços.
     * @param {string} name - O nome do jogador para sanitizar
     * @returns {string} O nome sanitizado
     */
    function sanitizeName(name) {
        // Permite letras (incluindo acentuadas), espaços e hífen, removendo outros caracteres.
        let sanitized = name.replace(/[^\p{L}\s-]/gu, '') // Usa a propriedade Unicode \p{L} para encontrar qualquer letra
                          .replace(/\s+/g, ' ')      // Substitui múltiplos espaços por um
                          .trim();                   // Remove espaços do início e fim

        // Capitaliza a primeira letra de cada palavra
        sanitized = sanitized.split(' ').map(word => {
            if (word.length === 0) return '';
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
        
        return sanitized;
    }

    /**
     * Valida uma lista de nomes de jogadores.
     * Verifica duplicatas, comprimento e caracteres válidos.
     * 
     * @param {string[]} names - Array de nomes para validar
     * @returns {Object} Objeto com o resultado da validação
     * @property {boolean} isValid - Se todos os nomes são válidos
     * @property {string[]} errors - Lista de mensagens de erro encontradas
     * @property {string[]} sanitizedNames - Lista de nomes sanitizados e validados
     * 
     * Regras de validação:
     * - Nomes devem ter entre 2 e 20 caracteres
     * - Nomes não podem ser duplicados (case-insensitive)
     * - Nomes não podem ser vazios após sanitização
     */
    function validateNames(names) {
        const errors = [];
        const sanitizedNamesSet = new Set();
        const duplicates = [];
        const sanitizedNamesList = [];

        // Verifica nomes vazios ou muito curtos/longos
        names.forEach(name => {
            const sanitized = sanitizeName(name);
            if (sanitized.length === 0) {
                errors.push(`Nome vazio não é permitido`);
            } else if (sanitized.length < 2) {
                errors.push(`Nome "${name}" é muito curto (mínimo 2 caracteres)`);
            } else if (sanitized.length > 20) {
                errors.push(`Nome "${name}" é muito longo (máximo 20 caracteres)`);
            } else if (sanitizedNamesSet.has(sanitized.toLowerCase())) {
                duplicates.push(sanitized);
            } else {
                sanitizedNamesSet.add(sanitized.toLowerCase());
                sanitizedNamesList.push(sanitized);
            }
        });

        // Adiciona erros de duplicação
        if (duplicates.length > 0) {
            errors.push(`Nomes duplicados encontrados: ${duplicates.join(', ')}`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            sanitizedNames: sanitizedNamesList
        };
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'bg-red-500 text-white p-3 rounded-lg mb-4 error-message';
        errorDiv.textContent = message;
        
        // Remove mensagens de erro anteriores
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        
        // Insere a nova mensagem antes do textarea
        if (playerNamesInput) {
            playerNamesInput.parentNode.insertBefore(errorDiv, playerNamesInput);
            
            // Remove a mensagem após 5 segundos
            setTimeout(() => errorDiv.remove(), 5000);
        }
    }

    function handleStartShow() {
        if (!playerNamesInput) {
            console.error('Player names input not found');
            return;
        }

        // Divide e limpa espaços em branco
        const names = playerNamesInput.value
            .split(',')
            .map(n => n.trim())
            .filter(n => n.length > 0);

        // Verifica se há nomes para processar
        if (names.length === 0) {
            showError('Digite pelo menos um nome de jogador');
            return;
        }

        // Verifica se há jogadores demais
        if (names.length > 20) {
            showError('Máximo de 20 jogadores permitido');
            return;
        }

        // Valida e sanitiza os nomes
        const validation = validateNames(names);
        
        if (!validation.isValid) {
            showError(validation.errors.join('\n'));
            return;
        }

        saveState();
        players = validation.sanitizedNames.map((name, index) => ({
            id: index + 1,
            name,
            score: 0,
            status: 'active',
            hasPlayedInRound: false
        }));
        console.log('Players initialized:', players);
        history = [];
        currentScene = [];
        currentRound = 1;
        controlsContainer.classList.add('hidden');
        setupSection.classList.add('hidden');
        gameSection.classList.remove('hidden');
        render();
        updateUndoButton();
        saveToLocalStorage();
    }
    function resetRound() {
        currentRound++;
        players.forEach(p => {
            p.hasPlayedInRound = false;
        });
    }
    /**
     * Sorteia jogadores para a próxima cena.
     * 
     * Este handler gerencia todo o processo de sorteio de jogadores:
     * 1. Filtra jogadores ativos que ainda não jogaram na rodada
     * 2. Se não houver jogadores disponíveis, reseta a rodada
     * 3. Sorteia aleatoriamente a quantidade selecionada de jogadores
     * 4. Marca os jogadores sorteados como "já jogaram"
     * 5. Atualiza a interface e salva o estado
     * 
     * Casos especiais:
     * - Se houver apenas 1 jogador disponível, ele é selecionado automaticamente
     * - O número de jogadores sorteados nunca excede o tamanho do pool disponível
     * - Usa Fisher-Yates shuffle para sorteio aleatório justo
     */
    function handleDrawScene() {
        // Verifica se há jogadores em cena que ainda não receberam pontos
        if (currentScene.length > 0) {
            showError('Atribua pontos aos jogadores em cena antes de sortear novos jogadores');
            return;
        }

        saveState();

        // Filtra jogadores disponíveis
        let playersToDrawFrom = players.filter(p => p.status === 'active' && !p.hasPlayedInRound);
        
        // Se não houver jogadores disponíveis, reseta a rodada
        if (playersToDrawFrom.length === 0) {
            resetRound();
            playersToDrawFrom = players.filter(p => p.status === 'active' && !p.hasPlayedInRound);
        }

        const poolSize = playersToDrawFrom.length;
        const count = parseInt(scenePlayerCount.value, 10);
        
        // Determina os jogadores sorteados
        let drawnPlayers;
        if (poolSize === 1) {
            // Caso especial: apenas um jogador disponível
            drawnPlayers = playersToDrawFrom;
        } else {
            // Sorteia aleatoriamente usando Fisher-Yates shuffle
            let shuffled = playersToDrawFrom.sort(() => 0.5 - Math.random());
            drawnPlayers = shuffled.slice(0, Math.min(count, poolSize));
        }

        // Atualiza o estado dos jogadores sorteados
        currentScene = drawnPlayers.map(p => p.id);
        currentScene.forEach(id => {
            const player = players.find(p => p.id === id);
            if (player) player.hasPlayedInRound = true;
        });

        // Atualiza a interface
        renderCurrentScene();
        renderBowls();
        updateButtonStates();
        saveToLocalStorage();
    }
    function handleScore(e) {
        if (e.target.tagName !== 'BUTTON') return;
        if (currentScene.length === 0) return;
        saveState();
        const points = parseInt(e.target.dataset.score, 10);
        currentScene.forEach(playerId => {
            const player = players.find(p => p.id === playerId);
            if (player) player.score += points;
        });
        currentScene = [];
        render();
        saveToLocalStorage();
    }

    /**
     * Gerencia o processo de eliminação de jogadores.
     * 
     * Este handler implementa a lógica de eliminação com as seguintes regras:
     * 1. Elimina os N jogadores com menor pontuação
     * 2. Em caso de empate no ponto de corte, elimina apenas os que têm pontuação inferior
     * 3. Nunca elimina todos os jogadores ativos
     * 
     * Exemplo de funcionamento:
     * - Se temos jogadores com pontuações [1,2,3,4,5] e queremos eliminar 2,
     *   os jogadores com pontuações 1 e 2 são eliminados.
     * - Se temos [1,2,2,3,4] e queremos eliminar 2,
     *   apenas o jogador com pontuação 1 é eliminado para evitar
     *   eliminar parcialmente os empatados com 2 pontos.
     * 
     * @throws {Error} Se tentar eliminar todos os jogadores ativos
     */
    function handleEliminate() {
        const count = parseInt(eliminateCountInput.value, 10);
        if (count <= 0) return;
        
        saveState();
        
        // Filtra e ordena jogadores ativos por pontuação
        let activePlayers = players.filter(p => p.status === 'active');
        if (count >= activePlayers.length) return;
        activePlayers.sort((a, b) => a.score - b.score);

        // Determina o ponto de corte e próximo jogador
        const cutoffPlayer = activePlayers[count - 1];
        const nextPlayer = activePlayers[count];
        
        let toEliminate;
        if (nextPlayer && cutoffPlayer.score === nextPlayer.score) {
            // Caso especial: empate no ponto de corte
            // Elimina apenas jogadores com pontuação inferior ao empate
            const cutoffScore = cutoffPlayer.score;
            toEliminate = activePlayers.filter(p => p.score < cutoffScore);
        } else {
            // Caso normal: elimina exatamente o número solicitado
            toEliminate = activePlayers.slice(0, count);
        }

        // Cancela se não há jogadores para eliminar
        if (toEliminate.length === 0) {
            history.pop();
            updateUndoButton();
            return;
        }

        // Processa a eliminação
        toEliminate.forEach(elimPlayer => {
            const player = players.find(p => p.id === elimPlayer.id);
            if (player) player.status = 'eliminated';
        });

        // Atualiza o estado do jogo
        resetRound();
        render();
        saveToLocalStorage();
        checkWinner();
    }
    function handleUndo() {
        if (history.length > 0) {
            const lastState = history.pop();
            loadState(lastState);
        }
        updateUndoButton();
    }
    function handleResetShow() {
        clearLocalStorage();
        setupSection.classList.remove('hidden');
        gameSection.classList.add('hidden');
        players = [];
        history = [];
        currentScene = [];
        currentRound = 1;
        render();
        updateUndoButton();
    }
    function handleCloseWinnerModal() {
        winnerModalContent.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            winnerModal.classList.add('hidden');
            winnerModalContent.classList.remove('scale-95', 'opacity-0');
            handleResetShow();
        }, 300);
    }
    function handleClearStorage() {
        clearLocalStorage();
        handleResetShow();
    }
    function handleToggleControls() {
        if (controlsContainer) {
            controlsContainer.classList.toggle('hidden');
        }
    }

    function handleKeydown(e) {
        // Ignora atalhos se a seção de jogo não estiver ativa
        if (gameSection.classList.contains('hidden')) {
            return;
        }

        // Ignora atalhos se estiver digitando em um campo de input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        const key = e.key.toLowerCase();

        // Atalhos de pontuação (1-5)
        if (key >= '1' && key <= '5') {
            const scoreBtn = document.querySelector(`.btn-score[data-score="${key}"]`);
            if (scoreBtn) {
                scoreBtn.click();
            }
        }

        switch (key) {
            case 's':
                drawPlayersBtn.click();
                break;
            case 'z':
                undoBtn.click();
                break;
            case 'e':
                eliminatePlayersBtn.click();
                break;
        }
    }

    // ===== INICIALIZAÇÃO E ADIÇÃO DE LISTENERS =====
    if (startShowBtn) startShowBtn.addEventListener('click', handleStartShow);
    if (drawPlayersBtn) drawPlayersBtn.addEventListener('click', handleDrawScene);
    document.querySelectorAll('.btn-score').forEach(btn => {
        btn.addEventListener('click', handleScore);
    });
    if (eliminatePlayersBtn) eliminatePlayersBtn.addEventListener('click', handleEliminate);
    if (undoBtn) undoBtn.addEventListener('click', handleUndo);
    if (resetShowBtn) resetShowBtn.addEventListener('click', handleResetShow);
    
    if (toggleControlsBtn) toggleControlsBtn.addEventListener('click', handleToggleControls);
    if (closeWinnerModalBtn) closeWinnerModalBtn.addEventListener('click', handleCloseWinnerModal);
    
    // Botão para limpar cache agora tem um seletor de dados
    const clearStorageBtn = document.querySelector('[data-action="clear-storage"]');
    if (clearStorageBtn) {
        clearStorageBtn.addEventListener('click', handleClearStorage);
    }
    
    document.addEventListener('keydown', handleKeydown);
    
    updateUndoButton();
    
    if (loadFromLocalStorage()) {
        setupSection.classList.add('hidden');
        gameSection.classList.remove('hidden');
        render();
    }
});
