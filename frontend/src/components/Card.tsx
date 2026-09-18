import { ReactNode } from "react";

interface CardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}

export function Card({ title, icon, children }: CardProps) {
  return (
    <div className="card">
      <div className="card-header">
        {icon && <div className="card-icon">{icon}</div>}
        <h3 className="card-title">{title}</h3>
      </div>
      {children}
    </div>
  );
}