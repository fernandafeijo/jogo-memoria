// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
// for better error handling, and performance 
"use strict";

/* Architecture Overview
- EventListener creates listener and calls EventHandler
- EventHandler handles event by calling internal models (ScorePanel, Deck).
- Internal models will modify based on events and call ViewChanger to modify view
- ViewChanger changes DOM HTML

Advantage:
- View is decoupled from model 
    - when I change HTML&CSS (likely to change), that change is only propagated to EventListener and ViewChanger
- Easier to test in isolation. 
    - does ViewChanger change HTML? 
    - does EventListener create listener and call appropriate EventHandler?
    - Do internal models work the way we expect without worrying about events, and views
*/


/*
 *
 */
const ScorePanel = {
    move: 0,
    time: 0,
    star: 3,
    incrementTime: () => {
        ScorePanel.time += 1;
        ViewChanger.setTime(ScorePanel.time);
    },
    incrementMove: () => {
        ScorePanel.move += 1;
        ViewChanger.setMoves(ScorePanel.move);

        if (ScorePanel.move === 30) {
            ScorePanel.star = 2;
            ViewChanger.setStars(2);
        } else if (ScorePanel.move === 40) {
            ScorePanel.star = 1;
            ViewChanger.setStars(1);
        } else {
            // do nothing. stars don't change
        }
    },
    reset: () => {
        ScorePanel.move = 0;
        ScorePanel.star = 3;
        ScorePanel.time = 0;
        ViewChanger.setMoves(0);
        ViewChanger.setStars(3);
        ViewChanger.setTime(0);
    }
}
Object.seal(ScorePanel);


/* Variável Timer: será interrompido quando todas as cartas forem correspondidas ou o jogador pressionar novamente.
 */
let Timer;

/*SIMBOLOS: em ordem, deve ser usado com Object.freeze () para  impedir qualquer modificação */
const Symbol = {
    ANCHOR: 'fa fa-anchor',
    BICYCLE: 'fa fa-bicycle',
    BOLT: 'fa fa-bolt',
    BOMB: 'fa fa-bomb',
    CUBE: 'fa fa-cube',
    DIAMOND: 'fa fa-diamond',
    LEAF: 'fa fa-leaf',
    PLANE: 'fa fa-paper-plane-o',
}

Object.freeze(Symbol); // para que o símbolo enum não mude durante o tempo de execução


/* Representa o enum, deve ser usado com Object.freeze () para  impedir qualquer modificação. */
const State = {
    CLOSED: 'card',
    OPENED: 'card open show',
    MATCHED: 'card open match',
}

Object.freeze(State); //// para que o enum não seja alterado durante o tempo de execução


const Deck = {
    cards: [Symbol.ANCHOR, Symbol.ANCHOR, Symbol.BICYCLE, Symbol.BICYCLE, Symbol.BOLT, Symbol.BOLT, Symbol.BOMB, Symbol.BOMB, Symbol.CUBE, Symbol.CUBE, Symbol.DIAMOND, Symbol.DIAMOND, Symbol.LEAF, Symbol.LEAF, Symbol.PLANE, Symbol.PLANE],
    opened: [],
    matched: [],
    shuffle: (array) => { // Adaptado de: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm 
        for (let i = array.length - 1; i > 0; --i) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        ViewChanger.setCardsSymbols(array);
    },
    reset: () => {
        console.log(`In Deck.reset() : `);
        Deck.opened.length = 0;
        Deck.matched.length = 0;
        for (let i = 0; i < Deck.cards.length; i++) {
            ViewChanger.closeCard(i);
        }
        Deck.shuffle(Deck.cards);
    },
    tryOpeningCard: ({
        index,
        symbol
    }) => {
        console.log(`In Deck.tryOpeningCard(${index}, ${symbol})`);
        Deck.opened.push({
            index,
            symbol
        })
        ViewChanger.openCard(index);

        if (Deck.opened.length === 2) {
            window.setTimeout(Deck.checkMatch, 200);
        }

    },
    checkMatch: () => {
        console.log(`In Deck.checkMatch() : `);
        const c0 = Deck.opened[0];
        const c1 = Deck.opened[1];

        if (c0.symbol !== c1.symbol) {
            ViewChanger.closeCard(c0.index);
            ViewChanger.closeCard(c1.index);
            Deck.opened.length = 0;
        } else {
            ViewChanger.matchCard(c0.index);
            ViewChanger.matchCard(c1.index);
            Deck.matched.push(c0, c1);
            Deck.opened.length = 0;
        }

        if (Deck.matched.length === Deck.cards.length) {
            console.log("você ganhou");
            clearInterval(Timer);
            ViewChanger.hideStartButton(false);
        }

    },
}
Object.freeze(Deck);
Object.seal(Deck.cards)


/* ViewChanger: todas as alterações no DOM ficam nesta classe, depende do valor do símbolo e do estado do enum */
class ViewChanger {
    static setStars(numStars) {
        console.log(`class ViewChanger setStars(${numStars}) : changes number of stars in View`);
        const d = document.getElementsByClassName("stars")[0];
        const starHTML = '<li><i class="fa fa-star"></i></li>';
        d.innerHTML = starHTML.repeat(numStars);
    }

    static setMoves(numMoves) {
        console.log(`class ViewChanger setMoves(${numMoves}) : changes number of moves in View`);
        const d = document.getElementsByClassName("moves")[0];
        d.innerHTML = numMoves;
    }
    static setTime(seconds) {
        console.log(`class ViewChanger setTime(${seconds}) : changes timer in View`);
        const d = document.getElementsByClassName("timer")[0];
        d.innerHTML = seconds;
    }

    static openCard(cardIndex) {
        console.log(`class ViewChanger openCard(${cardIndex}) : opens up a card in deck`);
        const d = document.getElementsByClassName("card");
        d[cardIndex].setAttribute("class", State.OPENED);
    }

    static closeCard(cardIndex) {
        console.log(`class ViewChanger closeCard(${cardIndex}) : closes a card in deck`);
        const d = document.getElementsByClassName("card");
        d[cardIndex].setAttribute("class", State.CLOSED);
    }

    static matchCard(cardIndex) {
        console.log(`class ViewChanger matchCard(${cardIndex}) : changes a card in a match state`);
        const d = document.getElementsByClassName("card");
        d[cardIndex].setAttribute("class", State.MATCHED);
    }

    static setCardsSymbols(cards) {
        console.log(`class ViewChanger setCardsSymbols(${cards}) : set cards symbols`);
        const d = document.getElementsByClassName("card");
        for (let i = 0; i < cards.length; i++) {
            d[i].firstChild.setAttribute("class", cards[i]);
        }
    }

    static hideStartButton(bool) {
        const d = document.getElementsByClassName("modal")[0];
        if (bool === true) {
            d.innerHTML = `Vamos jogar de novo? <br><br>
            3 estrelas &lt; 30 movimentos <br>
            2 estrelas &lt; 40 movimentos <br>
            1 estrela  &gt;= 40 movimentos<br><br> 
            Clique para JOGAR`;
            d.className = "modal hide";
        } else {
            d.innerHTML = `PARABÉNS, você conseguiu! <br>
            <br> O seu tempo foi: ${ScorePanel.time} segundos
            <br> Você conseguiu: ${ScorePanel.star} estrelas 
            <br> Você fez: ${ScorePanel.move}  movimentos 
            <br> o/
            <br><br> CLIQUE para jogar novamente`;
            d.className = "modal show";
        }
    }

}

/*Método para cada ação do usuário possível. Cada método irá anexar ouvinte de evento à visão do usuário*/
class EventListener {
    static setClickStart() {
        console.log("class EventListener setClickStart() : setup click eventListener for start button...");
        console.log("[Listening...] start button ");
        const d = document.getElementsByClassName('modal')[0];
        d.addEventListener("click", EventHandler.clickStart);
    }

    static setClickRestart() {
        console.log("class EventListener setClickRestartListener() : setup click eventListener for restart button...");
        console.log("[Listening...] restart button ");
        const d = document.getElementsByClassName('restart')[0];
        d.addEventListener("click", EventHandler.clickRestart);
    }

    // Ouvinte de cartão no elemento pai
    // Baseado em: https://davidwalsh.name/event-delegate
    static setClickCards() {
        console.log("class EventListener setClickCardsListener(): setup click eventListener for each card...")
        console.log("[Listening...] card clicks");

        const d = document.getElementsByClassName("deck")[0];

        //manipulador de eventos quando o cartão estiver fechado
        d.addEventListener("click", (e) => {
            const state = e.target.className;
            console.log(state);
            if (state === State.CLOSED) {
                EventHandler.clickCard(e);
            }
        });
    }
}

class EventHandler {
    static clickCard(e) {
        console.log(`[EVENT] user clicks card and triggers EventHandler.clickCard()`);
        console.log(`In class EventHandler clickCard() :`);

        const index = e.target.id;
        const state = e.target.className;
        const symbol = e.target.firstChild.className;

        ScorePanel.incrementMove();
        Deck.tryOpeningCard({
            index,
            symbol
        });

    }
    static clickRestart() {
        console.log('[EVENT] user clicks restart button and triggers EventHandler.clickRestart()');
        console.log("In class EventHandler clickRestart() : ");
        Deck.reset();
        ScorePanel.reset();
    }
    static clickStart(e) {
        console.log('[EVENT] user clicks start button and triggers EventHandler.clickStart()');
        console.log("In class EventHandler clickStart() : ");
        Deck.reset();
        ScorePanel.reset();
        Timer = setInterval(ScorePanel.incrementTime, 1000);
        ViewChanger.hideStartButton(true);

    }
}

function main() {
    console.log("function main() : Welcome to Matching Game!");
    EventListener.setClickStart();
    EventListener.setClickRestart();
    EventListener.setClickCards();

}

main();
/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */