import { useEffect, useState } from "react";
import type { LetterStatus } from "../App";

type RowProps = {
  letters: string;
  statuses: LetterStatus[];
  isActive: boolean;
  shakeRow: boolean;
};

const WORD_LENGTH = 5;

const Row = ({ letters, statuses, isActive, shakeRow }: RowProps) => {

  const paddedLetters = letters.padEnd(WORD_LENGTH, " ");

  return (
    <div className={`row ${isActive ? "active" : ""} ${shakeRow ? "shake" : ""}`.trim()}>
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
