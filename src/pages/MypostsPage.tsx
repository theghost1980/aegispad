import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserPosts, type HivePost } from "../services/hiveService";
import { useAuthStore } from "../stores/authStore";
import { useErrorStore } from "../stores/errorStore";
import { useOperationLoadingStore } from "../stores/operationLoadingStore";
import styles from "../styles/MyPostsPage.module.css";
import { createAppError } from "../types/error";

const MyPostsPage: React.FC = () => {
  const { username } = useAuthStore();
  const { showLoader, hideLoader, isLoading } = useOperationLoadingStore();
  const { error, setError, clearError } = useErrorStore();

  const [posts, setPosts] = useState<HivePost[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!username) {
        setError(
          createAppError(
            "Usuario no autenticado",
            "No se puede cargar las publicaciones sin un usuario.",
            undefined,
            "auth"
          )
        );
        return;
      }

      clearError();
      showLoader("Cargando tus publicaciones...");
      try {
        const userPosts = await getUserPosts(username, 10);
        setPosts(userPosts);
      } catch (err: any) {
        console.error("Error al obtener las publicaciones del usuario:", err);
        setError(
          createAppError(
            "Error al cargar publicaciones",
            err.message || "No se pudieron obtener las publicaciones.",
            err.stack,
            "hive-api"
          )
        );
        setPosts([]);
      } finally {
        hideLoader();
      }
    };

    fetchPosts();
  }, [username, setError, clearError, showLoader, hideLoader]);

  if (isLoading) {
    return (
      <div className={styles.statusMessage}>Cargando publicaciones...</div>
    );
  }

  if (error && error.type !== "auth") {
    // No mostrar error de auth si ya se está manejando
    return (
      <div className={`${styles.statusMessage} ${styles.errorMessage}`}>
        Error: {error.message}
      </div>
    );
  }

  if (!username) {
    return (
      <div className={styles.statusMessage}>
        Por favor, inicia sesión para ver tus publicaciones.
      </div>
    );
  }

  return (
    <div className={styles.myPostsContainer}>
      <h2>Mis Publicaciones Recientes</h2>
      {posts.length === 0 && !isLoading && (
        <p>No tienes publicaciones recientes o no se pudieron cargar.</p>
      )}
      {posts.length > 0 && (
        <ul className={styles.postsList}>
          {posts.map((post) => (
            <li key={post.permlink} className={styles.postItem}>
              <Link
                to={`/@${post.author}/${post.permlink}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.postLink}
              >
                <h3>{post.title}</h3>
              </Link>
              <p className={styles.postDetails}>
                Publicado: {new Date(post.created).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyPostsPage;
