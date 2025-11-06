# Regras e Lógica de Jogo do Placar Maestro

Este documento descreve a lógica e as regras de jogo implementadas no Placar Digital Maestro, focando em como o sistema gerencia o fluxo da partida, as pontuações e as eliminações.

## 1. O Conceito Central: O Placar

O placar é a autoridade central do jogo, gerenciado pelo Emcee. Ele rastreia três informações vitais para cada jogador em tempo real:

1. **Pontuação:** O total acumulado de pontos recebidos das cenas.
2. **Status:** Se o jogador está `Ativo` (competindo) ou `Eliminado`.
3. **Status da Rodada:** Se o jogador `Já Jogou` ou `Ainda Não Jogou` na rodada atual (a lógica do "Bingo").

## 2. O Fluxo do Jogo, Fase a Fase

### Fase 1: A Configuração (Setup)

* **Regra:** Todos os jogadores que participarão do espetáculo são inseridos no sistema.
* **Lógica do Placar:** O placar atribui a cada jogador um número único (ID), uma pontuação inicial de 0, o status `Ativo` e o status de rodada `Ainda Não Jogou`.

### Fase 2: O Sorteio (A Lógica do "Bingo")

Esta é a regra mais importante para garantir que o jogo seja justo e que todos participem.

* **Regra:** O jogo funciona em "rodadas". Uma rodada só termina quando todos os jogadores ativos tiverem participado de pelo menos uma cena.
* **Lógica do Placar:**
  1. **Pool de Sorteio:** Quando o Emcee clica em "Sortear Jogadores", o placar olha **apenas** para os jogadores `Ativos` que estão marcados como `Ainda Não Jogaram` na rodada.
  2. **Sorteio:** O placar sorteia aleatoriamente o número de jogadores pedido desse "pool".
  3. **Marcação:** Os jogadores sorteados imediatamente têm seu status de rodada alterado para `Já Jogou`.
  4. **Reset da Rodada:** Quando o "pool" fica vazio (todos jogaram), o placar automaticamente zera a rodada no próximo sorteio, marcando todos os jogadores `Ativos` como `Ainda Não Jogaram` novamente, iniciando uma nova rodada completa.
* **Lógica dos Casos Especiais (Tensão):**
  * **Aviso de 3 Jogadores:** Quando restam apenas 3 jogadores no "pool" da rodada, o placar exibe um aviso.
  * **Aviso de 1 Jogador:** Quando resta apenas 1 jogador no "pool", o placar avisa que a próxima cena será um solo. Ao sortear, esse último jogador é automaticamente colocado em cena.

### Fase 3: A Pontuação

* **Regra:** O público atribui uma nota (1 a 5) à cena.
* **Lógica do Placar:** O Emcee clica no botão correspondente (ex: "4 Pontos"). O placar **adiciona** essa pontuação ao total de **cada** jogador que estava em cena. O ranking do placar principal é atualizado instantaneamente, mostrando a nova classificação.

### Fase 4: A Eliminação (A Lógica da "Linha de Corte")

Esta é a regra mais crítica para proteger os jogadores de eliminações injustas por empate.

* **Regra:** A eliminação não é sobre o número de pessoas, mas sobre a "pontuação de corte". Grupos empatados na linha de corte estão seguros.
* **Lógica do Placar:**
  1. O Emcee decide quantos jogadores eliminar (ex: "Eliminar os 3 últimos").
  2. O placar classifica todos os jogadores `Ativos` da menor para a maior pontuação.
  3. Ele identifica a pontuação do 3º pior jogador (o `cutoffPlayer`).
  4. **Verificação de Empate:** O placar então verifica se o 4º pior jogador (o primeiro que seria salvo) tem a **mesma pontuação** que o 3º.
  5. **Cenário A (HÁ EMPATE):** Se o 3º, 4º e 5º piores têm, por exemplo, 10 pontos. O placar  **não elimina ninguém com 10 pontos** . Ele só eliminará os jogadores que têm *menos* de 10 pontos (ex: o 1º e 2º piores, que tinham 8 e 9 pontos). Mesmo que o Emcee tenha pedido para eliminar 3, apenas 2 serão eliminados.
  6. **Cenário B (NÃO HÁ EMPATE):** Se o 3º pior tem 10 pontos e o 4º pior tem 11, não há empate na linha de corte. O placar elimina normalmente os 3 piores.

### Fase 5: O Vencedor (O Maestro)

* **Regra:** O jogo continua até que reste apenas um jogador.
* **Lógica do Placar:** Após cada rodada de eliminação, o placar verifica quantos jogadores `Ativos` restam. Se o número for `1`, o jogo para automaticamente e exibe a tela de vitória com o nome do campeão.

## 3. Funções de Segurança (Controles do Emcee)

* **Desfazer (Undo):** O placar mantém um histórico de ações. Se o Emcee pontuar errado ou eliminar por engano, o botão "Desfazer" reverte a última ação (pontuação, sorteio ou eliminação), retornando o jogo ao estado exato anterior.
* **Resetar Show:** Limpa completamente o placar e retorna à tela de configuração inicial para um novo espetáculo.
