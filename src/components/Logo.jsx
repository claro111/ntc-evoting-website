import './Logo.css';

const Logo = () => {
  return (
    <div className="logo-container">
      <img 
        src="/ntc-logo.png" 
        alt="NTC Logo" 
        className="logo-image"
      />
      <span className="logo-text">NTC E-Voting</span>
    </div>
  );
};

export default Logo;
