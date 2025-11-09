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

1. Acesse o arquivo `index.html` em seu navegador.
2. Digite os nomes dos jogadores separados por vírgula.
3. Clique em "Iniciar Show".
4. Use os controles na tela para:
   - **Sortear jogadores** para as cenas.
   - **Atribuir pontuações** (1-5) após cada cena.
   - **Eliminar jogadores** com menor pontuação ao final de cada rodada.
5. Acesse os **Controles do Show** (Desfazer, Resetar) no menu superior esquerdo.

## ⌨️ Atalhos de Teclado

Para agilizar a operação durante o show, utilize os seguintes atalhos de teclado:

- **`1` a `5`**: Atribui a nota correspondente à cena atual.
- **`s`**: Sorteia os próximos jogadores.
- **`e`**: Elimina os jogadores com a menor pontuação.
- **`z`**: Desfaz a última ação (pontuação, sorteio ou eliminação).

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
- Jekyll
- Tailwind CSS
- Google Fonts (Inter)

## ⚙️ Funcionalidades Principais

- **Interface Intuitiva**: Cabeçalho fixo com o número da rodada em destaque e controles principais sempre visíveis.
- **Controles Avançados**: Ações como "Desfazer" e "Resetar" ficam em um menu suspenso para uma interface mais limpa.
- **Sistema de Rodadas**: Garante que todos os jogadores participem antes que uma nova rodada comece.
- **Sorteio Inteligente**: Avisa quando restam poucos jogadores para completar a rodada.
- **Proteção contra Empates**: Sistema especial para tratar empates durante eliminações.
- **Persistência Local**: Salva o estado do jogo no navegador para evitar perda de dados.
- **Interface Responsiva**: Funciona em dispositivos móveis e desktop.

## 🤝 Contribuindo

Sinta-se à vontade para abrir issues ou enviar pull requests com melhorias para o projeto.

## 📜 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🔧 Desenvolvimento Local

Para rodar o projeto localmente, siga estes passos:

1. Certifique-se de ter Ruby instalado em seu sistema
2. Instale o Jekyll e as dependências do projeto:
   ```bash
   gem install bundler
   bundle install
   ```
3. Inicie o servidor local:
   ```bash
   bundle exec jekyll serve
   ```
4. Acesse o site em `http://localhost:4000`

O servidor irá atualizar automaticamente quando você fizer alterações nos arquivos.
