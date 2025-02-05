import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="stats-container">
      <div className="stats-card">
        <div className="stats-icon">📦</div>
        <div className="stats-content">
          <p>Revenue</p>
          <h3>30,000</h3>
        </div>
      </div>
      <div className="stats-card">
        <div className="stats-icon">💸</div>
        <div className="stats-content">
          <p>Sales Return</p>
          <h3>30,000</h3>
        </div>
      </div>
      <div className="stats-card">
        <div className="stats-icon">🛒</div>
        <div className="stats-content">
          <p>Purchase</p>
          <h3>30,000</h3>
        </div>
      </div>
      <div className="stats-card">
        <div className="stats-icon">💰</div>
        <div className="stats-content">
          <p>Income</p>
          <h3>30,000</h3>
        </div>
      </div>
    </div>
  );
};


export default Dashboard;
