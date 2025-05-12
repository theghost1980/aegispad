import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import styles from "../styles/AuthButton.module.css";
import { UserMenu } from "./UserMenu";

const AuthButton: React.FC = () => {
  const { isLoggedIn } = useAuthStore();

  return (
    <>
      {!isLoggedIn ? (
        <Link to="/login" className={styles.loginButton}>
          Iniciar Sesión
        </Link>
      ) : (
        <UserMenu />
      )}
    </>
  );
};

export default AuthButton;
