import { WordFailedError } from "../core/Errors";

enum Elements {
  QuestionNumber = "#current_question",
  TotalQuestionsNumber = "#total_questions",
  Answer = "#answer",
  Letters = "#letters",
  Stat = "#stat",
  RightWordsNumber = "#rightWordsNumber",
  ErrorsNumber = "#errorsNumber",
  MostErrorsWord = "#mostErrorsWord",
}

enum ButtonClasses {
  Primary = "btn-primary",
  Danger = "btn-danger",
  Success = "btn-success",
}

const buttonChangeColorDelay = 200;
const wordFailDelay = 1000;

export function createView(game: GameCore): GameView {
  let questionNumber: null | HTMLElement = null;
  let totalQuestionsNumber: null | HTMLElement = null;
  let answerContainer: null | HTMLElement = null;
  let lettersContainer: null | HTMLElement = null;
  let statContainer: null | HTMLElement = null;
  let rightWordsNumber: null | HTMLElement = null;
  let errorsNumber: null | HTMLElement = null;
  let mostErrorsWord: null | HTMLElement = null;

  function createButton(letter: string, className: string): HTMLButtonElement {
    const btn = document.createElement("button");

    btn.className = `btn ${className} mr-1`;
    btn.type = "button";
    btn.dataset.letter = letter;
    btn.innerHTML = letter;
    return btn;
  }

  function onLetterClick(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const letter = target.dataset.letter ?? "";

    checkCurrentLetter(letter, target);
  }

  function onKeypress(event: KeyboardEvent): void {
    const letter = event.key;
    let btn: HTMLButtonElement | null = null;

    try {
      btn = document.querySelector<HTMLButtonElement>(
        `${Elements.Letters}>button[data-letter=${letter}]`
      );
    } catch (error) {}

    checkCurrentLetter(letter, btn);
  }

  function showNewShuffledWord(): void {
    const shuffledWord = game.getCurrentShuffledWord();
    lettersContainer!.innerHTML = "";
    answerContainer!.innerHTML = "";
    statContainer!.style.display = "none";

    const documentFragment = document.createDocumentFragment();
    shuffledWord.forEach((letter) => {
      const btn = createButton(letter, ButtonClasses.Primary);
      btn.addEventListener("click", onLetterClick);
      documentFragment.appendChild(btn);
    });

    lettersContainer!.appendChild(documentFragment);
  }

  function setNextWord() {
    game.setNextWord();
    showNewShuffledWord();

    questionNumber!.innerHTML = game.getCurrentQuestionNumber().toString();
  }

  async function addLetterToAnswer(btn: HTMLButtonElement): Promise<void> {
    return new Promise((resolve) => {
      answerContainer!.appendChild(btn);
      setTimeout(() => {
        btn.classList.remove(ButtonClasses.Primary);
        btn.classList.add(ButtonClasses.Success);
        resolve();
      }, buttonChangeColorDelay);
    });
  }

  function showError(btn: HTMLButtonElement): void {
    btn.classList.remove(ButtonClasses.Primary);
    btn.classList.add(ButtonClasses.Danger);
    setTimeout(() => {
      btn.classList.remove(ButtonClasses.Danger);
      btn.classList.add(ButtonClasses.Primary);
    }, buttonChangeColorDelay);
  }

  function showCorrectWord(word: string): Promise<void> {
    lettersContainer!.innerHTML = "";
    answerContainer!.innerHTML = "";

    const documentFragment = document.createDocumentFragment();

    word.split("").forEach((letter) => {
      const btn = createButton(letter, ButtonClasses.Danger);
      documentFragment.appendChild(btn);
    });

    answerContainer!.appendChild(documentFragment);

    return new Promise((resolve) => setTimeout(resolve, wordFailDelay));
  }

  async function checkCurrentLetter(
    letter: string,
    btn: HTMLButtonElement | null
  ): Promise<void> {
    try {
      if (btn) {
        if (game.checkCurrentLetter(letter)) {
          btn.removeEventListener("click", onLetterClick);
          await addLetterToAnswer(btn);
        } else {
          showError(btn);
        }
      }

      if (game.isEndWord()) {
        setNextWord();
      } else if (game.isEndGame()) {
        showStat();
      }
    } catch (error) {
      if (error instanceof WordFailedError) {
        await showCorrectWord(error.message);
        if (game.isEndGame()) {
          showStat();
        } else {
          setNextWord();
        }
      }
    }
  }

  function showStat(): void {
    const stat = game.getStat();

    rightWordsNumber!.innerHTML = stat.rightWordsNumber.toString();
    errorsNumber!.innerHTML = stat.errorsNumber.toString();
    mostErrorsWord!.innerHTML = stat.mostErrorsWord;
    answerContainer!.style.display = "none";
    lettersContainer!.style.display = "none";
    statContainer!.style.display = "block";
  }

  return {
    startGame() {
      questionNumber = document.querySelector(Elements.QuestionNumber);
      totalQuestionsNumber = document.querySelector(
        Elements.TotalQuestionsNumber
      );
      lettersContainer = document.querySelector(Elements.Letters);
      answerContainer = document.querySelector(Elements.Answer);
      statContainer = document.querySelector(Elements.Stat);
      rightWordsNumber = document.querySelector(Elements.RightWordsNumber);
      errorsNumber = document.querySelector(Elements.ErrorsNumber);
      mostErrorsWord = document.querySelector(Elements.MostErrorsWord);

      if (
        !questionNumber ||
        !totalQuestionsNumber ||
        !lettersContainer ||
        !answerContainer ||
        !statContainer ||
        !rightWordsNumber ||
        !errorsNumber ||
        !mostErrorsWord
      ) {
        throw new Error("Нет разметки для показа игры");
      }

      totalQuestionsNumber.innerHTML = game
        .getTotalQuestionsNumber()
        .toString();

      document.addEventListener("keypress", onKeypress);
      showNewShuffledWord();
    },
  };
}
