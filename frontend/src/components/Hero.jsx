import ScreenLogo from "../assets/SCREEN-Logo.svg"

export default function Hero() {
  return (
    <header className="project-health-header">
      <div>
        <p className="eyebrow">
          Python measures. TAT interprets. React explains.
        </p>
        <br />
        <div className="logo">
          <img className="screen-logo" src={ScreenLogo} alt="" />
        </div>
      </div>
    </header>
  );
}
