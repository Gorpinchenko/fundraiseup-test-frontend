interface GameCore {
  getCurrentQuestionNumber: () => number;
  getTotalQuestionsNumber: () => number;
  getCurrentWord: () => string;
  getCurrentShuffledWord: () => string[];
  setNextWord: () => void;
  checkCurrentLetter: (letter: string) => boolean;
  isEndWord: () => boolean;
  isEndGame: () => boolean;
  getStat: () => GameStat;
}

interface GameView {
  startGame: () => void;
}

interface GameStat {
  readonly correctWordsNumber: number;
  readonly errorsNumber: number;
  readonly mostErrorsWord: string;
}
