import { useCallback, useEffect, useMemo, useState } from "react";
import Grid from "./components/Grid";
import Keyboard from "./components/Keyboard";
import { WORDS } from "./words";

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

export type GameState = "playing" | "won" | "lost";
export type LetterStatus = "correct" | "present" | "absent" | "empty";
export type KeyStatus = "correct" | "present" | "absent" | "unused";

const pickWord = (): string => {
  const index = Math.floor(Math.random() * WORDS.length);
  return WORDS[index];
};

const getStatuses = (guess: string, target: string): LetterStatus[] => {
  const result: LetterStatus[] = Array.from({ length: WORD_LENGTH }, () => "absent");
  const remaining: Record<string, number> = {};

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    const g = guess[i];
    const t = target[i];
    if (g === t) {
      result[i] = "correct";
    } else {
      remaining[t] = (remaining[t] ?? 0) + 1;
    }
  }

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    if (result[i] === "correct") {
      continue;
    }
    const g = guess[i];
    if (remaining[g] && remaining[g] > 0) {
      result[i] = "present";
      remaining[g] -= 1;
    }
  }

  return result;
};

const statusRank: Record<KeyStatus, number> = {
  unused: 0,
  absent: 1,
  present: 2,
  correct: 3
};

const App = () => {
  const [targetWord, setTargetWord] = useState<string>(pickWord());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [gameState, setGameState] = useState<GameState>("playing");
  const [shortEntry, setShortEntry] = useState(false);
  const [isShake, setIsShake] = useState(false);
  const [hardMode, setHardMode] = useState(false);
  const [hardModeMessage, setHardModeMessage] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [timerMode, setTimerMode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [apiWord, setApiWord] = useState<string>("")

  const keyStatuses = useMemo<Record<string, KeyStatus>>(() => {
    const map: Record<string, KeyStatus> = {};
    guesses.forEach((guess) => {
      const statuses = getStatuses(guess, targetWord);
      for (let i = 0; i < guess.length; i += 1) {
        const letter = guess[i];
        const nextStatus = statuses[i] as KeyStatus;
        const currentStatus = map[letter] ?? "unused";
        if (statusRank[nextStatus] > statusRank[currentStatus]) {
          map[letter] = nextStatus;
        }
      }
    });
    return map;
  }, [guesses, targetWord]);

  const rows = useMemo(() => {
    return Array.from({ length: MAX_ATTEMPTS }, (_, rowIndex) => {
      if (rowIndex < guesses.length) {
        const guess = guesses[rowIndex];
        return {
          letters: guess,
          statuses: getStatuses(guess, targetWord),
          isActive: false,
          shakeRow: false
        };
      }
      if (rowIndex === guesses.length) {
        return {
          letters: currentGuess,
          statuses: Array.from({ length: WORD_LENGTH }, () => "empty" as LetterStatus),
          isActive: true,
          shakeRow: isShake
        };
      }
      return {
        letters: "",
        statuses: Array.from({ length: WORD_LENGTH }, () => "empty" as LetterStatus),
        isActive: false,
        shakeRow: false
      };
    });
  }, [currentGuess, guesses, targetWord, isShake]);

  const checkHardMode = useCallback(() => {
    if (guesses.length === 0) return true;
    const lastGuess = guesses[guesses.length - 1];
    const lastStatuses = getStatuses(lastGuess, targetWord);
    let requiredLetters: string[] = [];
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (lastStatuses[i] === "present") {
        requiredLetters.push(lastGuess[i])
      }
    }

    for (let i = 0; i < WORD_LENGTH; i++) {
      const idx = requiredLetters.indexOf(currentGuess[i]);
      if (idx !== -1) requiredLetters.splice(idx, 1);
      if (lastStatuses[i] === 'correct' && lastGuess[i] !== currentGuess[i]) {
        return false
      }
    }
    if (requiredLetters.length > 0) {
      return false
    }

    return true;
  }, [guesses, currentGuess, targetWord])

  const submitGuess = useCallback(() => {
    if (currentGuess.length < WORD_LENGTH && currentGuess.length !== 0) {
      setShortEntry(true);
      setIsShake(true)
    }
    if (hardMode && !checkHardMode()) {
      setHardModeMessage(true)
      return
    }
    if (currentGuess.length !== WORD_LENGTH || gameState !== "playing") {
      return;
    }
    const nextGuesses = [...guesses, currentGuess];
    setGuesses(nextGuesses);
    if (currentGuess === targetWord) {
      setGameState("won");
    } else if (nextGuesses.length >= MAX_ATTEMPTS) {
      setGameState("lost");
    }
    setCurrentGuess("");
  }, [currentGuess, gameState, guesses, targetWord, checkHardMode, hardMode]);

  const handleInput = useCallback(
    (value: string) => {
      if (gameState !== "playing") {
        return;
      }
      if (value === "ENTER") {
        submitGuess();
        return;
      }
      if (value === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }
      if (/^[A-Z]$/.test(value) && currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((prev) => prev + value);
      }
    },
    [currentGuess.length, gameState, submitGuess]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      setActiveKey(key)
      if (key === "Enter") {
        handleInput("ENTER");
      } else if (key === "Backspace") {
        handleInput("BACKSPACE");
      } else if (/^[a-zA-Z]$/.test(key)) {
        handleInput(key.toUpperCase());
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      setActiveKey(null)
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    }
  }, [handleInput]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('https://random-word-api.herokuapp.com/word');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setApiWord(json[0])
        debugger

      } catch (err) {
        console.error(err)
      }
    }
    load();
  }, [])

  useEffect(() => {
    if (!shortEntry) {
      return;
    }
    const id = setTimeout(() => {
      setShortEntry(false)
    }, 3000)
    return () => {
      window.clearTimeout(id)
    };
  }, [shortEntry])
  useEffect(() => {
    if (!isShake) {
      return;
    }
    const id = setTimeout(() => {
      setIsShake(false)
    }, 300)
    return () => {
      window.clearTimeout(id)
    };
  }, [isShake])
  useEffect(() => {
    if (!hardModeMessage) {
      return;
    }
    const id = setTimeout(() => {
      setHardModeMessage(false)
    }, 1000)
    return () => {
      window.clearTimeout(id)
    };
  }, [hardModeMessage])

  useEffect(() => {
    if (!timerMode) {
      setTimer(0);
      return;
    }
    const id = setInterval(() => {
      setTimer((prev) => prev + 1)
    }, 1000)
    return () => {
      window.clearInterval(id)
    };
  }, [timerMode])

  const resetGame = () => {
    setTargetWord(pickWord());
    setGuesses([]);
    setCurrentGuess("");
    setGameState("playing");
  };

  return (
    <div className="app">
      <header className="header">
        {shortEntry ? <div className="error">Please enter 5 character guess</div> : ''}
        {hardModeMessage ? <div className="error">Please match the correct letters from the last guess and include all the pesent guesses</div> : ''}

        {timerMode && (
          <div>
            <span>{timer}</span>
            <button onClick={() => setTimer(0)}>Reset</button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <span>Timer Mode</span>
          <label className="switch">
            <input type="checkbox" checked={timerMode} onChange={(e) => setTimerMode(e.target.checked)} />
            <span className="slider round"></span>
          </label>
        </div>


        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <span>Hard Mode</span>
          <label className="switch">
            <input type="checkbox" checked={hardMode} onChange={(e) => setHardMode(e.target.checked)} />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="badge">Mini Wordle</div>
        <h1>Guess the 5-letter word</h1>
        <p className="subtitle">Six tries. Smart hints. No pressure.</p>
      </header>

      <Grid rows={rows} />

      <div className="status-bar">
        {gameState === "playing" && (
          <span className="message">Type a word and press Enter.</span>
        )}
        {gameState === "won" && (
          <span className="message win">You won! The word was {targetWord}.</span>
        )}
        {gameState === "lost" && (
          <span className="message loss">You lost. The word was {targetWord}.</span>
        )}
        <button className="new-game" type="button" onClick={resetGame}>
          New Game
        </button>
      </div>

      <Keyboard onKeyPress={handleInput} keyStatuses={keyStatuses} activeKey={activeKey} />
    </div>
  );
};

export default App;
