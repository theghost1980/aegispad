import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Layout.module.css";
import AuthButton from "./AuthButton";
import { ErrorNotification } from "./ErrorNotification";
import ServerStatusIndicator from "./ServerStatusIndicator";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.container}>
      <ErrorNotification />

      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <img
            src="/src/assets/logos/aegispad256.png"
            alt="Aegispad Logo"
            className={styles.logo}
          />
          <Link to="/" className={styles.title}>
            Aegispad
          </Link>
        </div>

        <nav className={styles.nav}>
          <Link to="/editor">Editor</Link>
          <Link to="/profile">Perfil</Link>
        </nav>

        <ServerStatusIndicator />

        <div className={styles.userInfo}>
          <AuthButton />
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
