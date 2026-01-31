import { Prospect, Status, STATUS_LABELS, STATUS_ORDER, STATUS_COLORS } from '../types';
import ProspectCard from './ProspectCard';
import './KanbanBoard.css';

interface KanbanBoardProps {
  prospects: Prospect[];
  onStatusChange: (id: string, newStatus: Status) => void;
  onUpdate: (id: string, updates: Partial<Prospect>) => void;
  onDelete: (id: string) => void;
}

export default function KanbanBoard({ 
  prospects, 
  onStatusChange, 
  onUpdate,
  onDelete 
}: KanbanBoardProps) {
  const getProspectsByStatus = (status: Status) => {
    return prospects.filter(p => p.status === status);
  };

  return (
    <div className="kanban-board">
      {STATUS_ORDER.map(status => {
        const statusProspects = getProspectsByStatus(status);
        const dotColor = STATUS_COLORS[status];
        return (
          <div key={status} className="kanban-column">
            <div className="kanban-column-header">
              <span className="kanban-column-dot" style={{ backgroundColor: dotColor }} />
              <h2>{STATUS_LABELS[status]} <span className="kanban-column-count">{statusProspects.length}</span></h2>
            </div>
            <div className="kanban-column-content">
              {statusProspects.map(prospect => (
                <ProspectCard
                  key={prospect.id}
                  prospect={prospect}
                  onStatusChange={onStatusChange}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
