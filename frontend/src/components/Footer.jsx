import TatLogo from "../assets/TAT-Logo.svg";

export default function Footer() {
  return (
    <footer className="logo">
      <img className="tat-logo" src={TatLogo} alt="TAT Logo" />
      <h3>Powered by TryAngleTree</h3>
    </footer>
  );
}
