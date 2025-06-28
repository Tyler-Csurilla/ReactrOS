import './Desktop.css';

export function Desktop() {
  // Random testing, going to remove this
  // TODO: Remove this
  const x = [1, 2, 3, 4];

  return (
    <div className="desktop">
      <div className="desktop-icons">
        {/* Desktop icons will go here */}
        <div className="desktop-icon">
          <div className="icon">💻</div>
          <div className="label">{x.join(',')}</div>
        </div>
        <div className="desktop-icon">
          <div className="icon">📁</div>
          <div className="label">Documents</div>
        </div>
        <div className="desktop-icon">
          <div className="icon">🗑️</div>
          <div className="label">Recycle Bin</div>
        </div>
      </div>
    </div>
  );
}
