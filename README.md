# Jogo da Memória

### O que é?
Este é um jogo da memória, foi criado para o curso de Fundamentos Web Front-End da Udacity.
Se você ainda não sabe como funciona aqui vai algumas instruções:

### Instruções
* Primeiro: Você escolhe duas cartas e clica nelas para que mostre o símbolo;
* Segundo: Se ambas formarem um par, elas ficarão laranjas e paradas. Caso contrário, elas são viradas novamente;
O objetivo é encontrar todos os pares e eliminar todas as cartas do jogo.

### Níveis
Quando terminado o jogo você recebe uma mensagem mostrando
* quanto tempo você levou para finalizar
* quantos movimentos você fez
* quantas estrelas você ganhou sendo que: 
* * 1 estrela: se sua pontuação for maior/igual a 40 movimentos
* * 2 estrelas: se sua pontuação for menor que 40 movimentos
* * 3 estrelas: se sua pontuação for menor que 30 movimentos

### Sobre o código
Este jogo é construído usando JavaScript :)
Mas é claro que foi utlizado também **HTML** e **CSS** pra deixá-lo muito mais amigável! 

* Foi utilizado este código inicial https://github.com/udacity/fend-project-memory-game
* O Bootstrap ajudou muito nos emprestando os desenhos utilizados nos cartões.
* O HTML do DOM muda de acordo com ViewChanger 
* O ```EventHandler``` manipula os modelos internos como ```ScorePanel```
* Coloquei um manipulador de eventos quando o cartão estiver fechado
* O ```let timer``` será interrompido quando todas as cartas forem correspondidas ou o jogador pressionar novamente
* Temos um contador que conta quantas jogadas foram feitas pelo jogador 
* Um modal aparecerá no início do jogo e no fim mostrando suas estatísticas.


### Ajuda com o código
* Shuffle adaptado de https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
* Ouvinte do elemento pai adaptado de: https://davidwalsh.name/event-delegate







