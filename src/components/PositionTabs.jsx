import './PositionTabs.css';

const PositionTabs = ({ positions, selectedPosition, onSelectPosition }) => {
  return (
    <div className="position-tabs-container">
      <div className="position-tabs">
        {positions.map((position) => (
          <button
            key={position.id}
            className={`position-tab ${selectedPosition === position.name ? 'active' : ''}`}
            onClick={() => onSelectPosition(position.name)}
          >
            {position.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PositionTabs;
