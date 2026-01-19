import type { LetterStatus } from "../App";

type RowProps = {
  letters: string;
  statuses: LetterStatus[];
  isActive: boolean;
};

const WORD_LENGTH = 5;

const Row = ({ letters, statuses, isActive }: RowProps) => {
  const paddedLetters = letters.padEnd(WORD_LENGTH, " ");

  return (
    <div className={`row ${isActive ? "active" : ""}`.trim()}>
      {Array.from({ length: WORD_LENGTH }, (_, index) => {
        const letter = paddedLetters[index];
        const status = statuses[index] ?? "empty";
        return (
          <div key={`tile-${index}`} className={`tile ${status}`}>
            {letter.trim()}
          </div>
        );
      })}
    </div>
  );
};

export default Row;
