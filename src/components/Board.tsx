import './Board.css';

// Board.tsx
interface BoardProps {
  children: React.ReactNode;
  title: string;
}

export const Board = ({ children, title }: BoardProps) => {
  return (
    <div className="board-column">
      <h2 className="board-title">{title}</h2>
      {children}
    </div>
  );
};
