import { WordFailedError } from "./Errors";

interface Word {
  errorsNumber: number;
  word: string;
  shuffledWord: string;
}

export function createGame(
  words: readonly string[],
  maxErrorsNumber = 3
): GameCore {
  const wordsStat: Word[] = words.map((word) => ({
    errorsNumber: 0,
    word: word,
    shuffledWord: shuffleWord(word),
  }));
  let currentQuestionIndex = 0;
  let currentLetterIndex = 0;
  let currentWord = wordsStat[currentQuestionIndex];
  let correctWordsNumber = 0;
  let errorsNumber = 0;
  let isEndGame = false;
  let isEndWord = false;

  function shuffleWord(word: string): string {
    return word
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");
  }

  return {
    getCurrentQuestionNumber() {
      return currentQuestionIndex + 1;
    },
    getTotalQuestionsNumber() {
      return words.length;
    },
    getCurrentWord() {
      return currentWord.word;
    },
    getCurrentShuffledWord() {
      return currentWord.shuffledWord.split("");
    },
    setNextWord() {
      if (wordsStat[currentQuestionIndex + 1]) {
        isEndWord = false;
        currentLetterIndex = 0;
        currentQuestionIndex++;
        currentWord = wordsStat[currentQuestionIndex];
      }
    },
    checkCurrentLetter(letter: string) {
      const isLetterCorrect = currentWord.word[currentLetterIndex] === letter;
      const isNextLetterExists =
        currentWord.shuffledWord[currentLetterIndex + 1] !== undefined;
      const isNextWordExists =
        wordsStat[currentQuestionIndex + 1] !== undefined;

      if (isLetterCorrect) {
        if (isNextLetterExists) {
          currentLetterIndex++;
        } else {
          correctWordsNumber++;
          isEndWord = true;
          if (!isNextWordExists) {
            isEndGame = true;
          }
        }

        return true;
      }

      errorsNumber++;
      currentWord.errorsNumber++;

      if (currentWord.errorsNumber === maxErrorsNumber) {
        isEndWord = true;
        if (!isNextWordExists) {
          isEndGame = true;
        }
        throw new WordFailedError(currentWord.word);
      }

      return false;
    },
    isEndWord() {
      return isEndWord;
    },
    isEndGame() {
      return isEndGame;
    },
    getStat() {
      let max = 0;
      let mostErrorsWord = "";

      for (let i = 0; wordsStat[i]; i++) {
        const word = wordsStat[i];
        if (word.errorsNumber > max) {
          max = word.errorsNumber;
          mostErrorsWord = word.word;
        }
      }

      return {
        correctWordsNumber,
        errorsNumber,
        mostErrorsWord,
      };
    },
  };
}
