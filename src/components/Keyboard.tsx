import type { KeyStatus } from "../App";

type KeyboardProps = {
  onKeyPress: (value: string) => void;
  keyStatuses: Record<string, KeyStatus>;
};

type KeyConfig = {
  label: string;
  value: string;
  wide?: boolean;
};

const KEY_ROWS: KeyConfig[][] = [
  [
    { label: "Q", value: "Q" },
    { label: "W", value: "W" },
    { label: "E", value: "E" },
    { label: "R", value: "R" },
    { label: "T", value: "T" },
    { label: "Y", value: "Y" },
    { label: "U", value: "U" },
    { label: "I", value: "I" },
    { label: "O", value: "O" },
    { label: "P", value: "P" }
  ],
  [
    { label: "A", value: "A" },
    { label: "S", value: "S" },
    { label: "D", value: "D" },
    { label: "F", value: "F" },
    { label: "G", value: "G" },
    { label: "H", value: "H" },
    { label: "J", value: "J" },
    { label: "K", value: "K" },
    { label: "L", value: "L" }
  ],
  [
    { label: "Enter", value: "ENTER", wide: true },
    { label: "Z", value: "Z" },
    { label: "X", value: "X" },
    { label: "C", value: "C" },
    { label: "V", value: "V" },
    { label: "B", value: "B" },
    { label: "N", value: "N" },
    { label: "M", value: "M" },
    { label: "Back", value: "BACKSPACE", wide: true }
  ]
];

const Keyboard = ({ onKeyPress, keyStatuses }: KeyboardProps) => {
  return (
    <div className="keyboard">
      {KEY_ROWS.map((row, rowIndex) => (
        <div key={`key-row-${rowIndex}`} className="key-row">
          {row.map((key) => {
            const status = keyStatuses[key.value] ?? keyStatuses[key.label] ?? "unused";
            return (
              <button
                key={key.value}
                type="button"
                className={`key ${status} ${key.wide ? "wide" : ""}`.trim()}
                onClick={() => onKeyPress(key.value)}
              >
                {key.label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
