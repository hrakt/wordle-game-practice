import Row from "./Row";
import type { LetterStatus } from "../App";

export type RowData = {
  letters: string;
  statuses: LetterStatus[];
  isActive: boolean;
};

type GridProps = {
  rows: RowData[];
};

const Grid = ({ rows }: GridProps) => {
  return (
    <div className="grid">
      {rows.map((row, index) => (
        <Row
          key={`row-${index}`}
          letters={row.letters}
          statuses={row.statuses}
          isActive={row.isActive}
        />
      ))}
    </div>
  );
};

export default Grid;
