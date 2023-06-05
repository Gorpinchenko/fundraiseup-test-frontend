import { createGame } from "./game/core/coreGame";
import { createView } from "./game/view/domView";
import { words } from "./words";

const randomWords = words.sort(() => 0.5 - Math.random()).slice(0, 6);

const game = createGame(randomWords);
const view = createView(game);

view.startGame();
