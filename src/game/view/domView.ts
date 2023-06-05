import { WordFailedError } from "../core/Errors";

enum Elements {
  QuestionNumber = "#current_question",
  TotalQuestionsNumber = "#total_questions",
  Answer = "#answer",
  Letters = "#letters",
  Stat = "#stat",
  CorrectWordsNumber = "#correctWordsNumber",
  ErrorsNumber = "#errorsNumber",
  MostErrorsWord = "#mostErrorsWord",
}

enum ButtonClasses {
  Primary = "btn-primary",
  Danger = "btn-danger",
  Success = "btn-success",
}

const buttonChangeColorDelay = 200;
const nextWordDelay = 1000;

export function createView(game: GameCore): GameView {
  let questionNumber: null | HTMLElement = null;
  let totalQuestionsNumber: null | HTMLElement = null;
  let answerContainer: null | HTMLElement = null;
  let lettersContainer: null | HTMLElement = null;
  let statContainer: null | HTMLElement = null;
  let correctWordsNumber: null | HTMLElement = null;
  let errorsNumber: null | HTMLElement = null;
  let mostErrorsWord: null | HTMLElement = null;

  function sleep(delay: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  function createButton(letter: string, className: string): HTMLButtonElement {
    const btn = document.createElement("button");

    btn.className = `btn ${className} mr-1`;
    btn.type = "button";
    btn.dataset.letter = letter;
    btn.textContent = letter;
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
    let btn = document.querySelector<HTMLButtonElement>(
      `${Elements.Letters}>button[data-letter="${letter}"]`
    );

    checkCurrentLetter(letter, btn);
  }

  function showNewShuffledWord(): void {
    const shuffledWord = game.getCurrentShuffledWord();
    lettersContainer!.textContent = "";
    answerContainer!.textContent = "";
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

    questionNumber!.textContent = game.getCurrentQuestionNumber().toString();
  }

  function addLetterToAnswer(btn: HTMLButtonElement): void {
    answerContainer!.appendChild(btn);
    setTimeout(() => {
      btn.classList.remove(ButtonClasses.Primary);
      btn.classList.add(ButtonClasses.Success);
    }, buttonChangeColorDelay);
  }

  function showError(btn: HTMLButtonElement): void {
    btn.classList.remove(ButtonClasses.Primary);
    btn.classList.add(ButtonClasses.Danger);
    setTimeout(() => {
      btn.classList.remove(ButtonClasses.Danger);
      btn.classList.add(ButtonClasses.Primary);
    }, buttonChangeColorDelay);
  }

  function showCorrectWord(word: string): void {
    lettersContainer!.textContent = "";
    answerContainer!.textContent = "";

    const documentFragment = document.createDocumentFragment();

    word.split("").forEach((letter) => {
      const btn = createButton(letter, ButtonClasses.Danger);
      documentFragment.appendChild(btn);
    });

    answerContainer!.appendChild(documentFragment);
  }

  async function checkCurrentLetter(
    letter: string,
    btn: HTMLButtonElement | null
  ): Promise<void> {
    if (game.isEndWord()) {
      return;
    }

    try {
      const isCorrectLetter = game.checkCurrentLetter(letter);

      if (!btn) {
        return;
      }

      if (isCorrectLetter) {
        btn.removeEventListener("click", onLetterClick);
        addLetterToAnswer(btn);
      } else {
        showError(btn);
      }
    } catch (error) {
      if (error instanceof WordFailedError) {
        showCorrectWord(error.message);
        await sleep(nextWordDelay);
      }
    } finally {
      if (game.isEndGame()) {
        showStat();
      } else if (game.isEndWord()) {
        await sleep(nextWordDelay);
        setNextWord();
      }
    }
  }

  function showStat(): void {
    const stat = game.getStat();

    correctWordsNumber!.textContent = stat.correctWordsNumber.toString();
    errorsNumber!.textContent = stat.errorsNumber.toString();
    mostErrorsWord!.textContent = `"${stat.mostErrorsWord}"`;
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
      correctWordsNumber = document.querySelector(Elements.CorrectWordsNumber);
      errorsNumber = document.querySelector(Elements.ErrorsNumber);
      mostErrorsWord = document.querySelector(Elements.MostErrorsWord);

      if (
        !questionNumber ||
        !totalQuestionsNumber ||
        !lettersContainer ||
        !answerContainer ||
        !statContainer ||
        !correctWordsNumber ||
        !errorsNumber ||
        !mostErrorsWord
      ) {
        throw new Error("Нет разметки для показа игры");
      }

      totalQuestionsNumber.textContent = game
        .getTotalQuestionsNumber()
        .toString();

      document.addEventListener("keypress", onKeypress);
      showNewShuffledWord();
    },
  };
}
