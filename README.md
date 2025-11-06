# Placar Maestro

Um sistema de placar digital interativo desenvolvido especialmente para shows de improvisação teatral, com foco em gerenciar pontuações, sorteios e eliminações de forma justa e transparente.

## 🎭 Sobre o Projeto

O Placar Maestro é uma aplicação web que auxilia na gestão de shows de improvisação teatral, oferecendo uma interface intuitiva para:

- Rastreamento de pontuações em tempo real
- Sorteio justo de jogadores (sistema de "bingo")
- Gerenciamento de eliminações com proteção contra empates
- Interface visual clara e responsiva
- Sistema de desfazer ações para correção de erros

## 🚀 Como Usar

1. Acesse o arquivo `index.html` em seu navegador
2. Digite os nomes dos jogadores separados por vírgula
3. Clique em "Iniciar Show"
4. Use os controles do Emcee para:
   - Sortear jogadores para cenas
   - Atribuir pontuações (1-5)
   - Eliminar jogadores quando necessário
   - Desfazer ações em caso de erro

## 📋 Regras do Jogo

As regras completas do jogo estão documentadas no arquivo [regras.md](regras.md), incluindo:

- Sistema de rodadas e sorteio
- Lógica de pontuação
- Processo de eliminação
- Tratamento de empates
- Condições de vitória

## 🛠️ Tecnologias Utilizadas

- HTML5
- JavaScript (Vanilla)
- Tailwind CSS
- Google Fonts (Inter, Roboto)

## ⚙️ Funcionalidades Principais

- **Sistema de Rodadas**: Garante que todos os jogadores participem antes que uma nova rodada comece
- **Sorteio Inteligente**: Avisa quando restam 3 ou 1 jogador para completar a rodada
- **Proteção contra Empates**: Sistema especial para tratar empates durante eliminações
- **Persistência Local**: Salva o estado do jogo no navegador
- **Interface Responsiva**: Funciona em dispositivos móveis e desktop

## 🤝 Contribuindo

Sinta-se à vontade para abrir issues ou enviar pull requests com melhorias para o projeto.

## 📜 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🎨 Customização

O projeto utiliza Tailwind CSS para estilização, permitindo fácil customização através das classes utilitárias ou modificação dos estilos no arquivo `index.html`.