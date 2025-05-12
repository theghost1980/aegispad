import {
  FaCalendarAlt,
  FaDatabase,
  FaFeatherAlt,
  FaHive,
  FaLanguage,
  FaLightbulb,
  FaRocket,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import styles from "../styles/HomePage.module.css"; // Crearemos este archivo

function HomePage() {
  return (
    <div className={styles.homeContainer}>
      <header className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          Aegispad: Tu Centro de Creación y Traducción para HIVE
        </h1>
        <p className={styles.heroSubtitle}>
          Escribe en Markdown, traduce con IA y publica directamente en la
          blockchain de HIVE. Simplifica tu flujo de trabajo y expande tu
          alcance.
        </p>
        <Link to="/editor" className={styles.ctaButton}>
          ¡Comienza a Crear Ahora! <FaRocket style={{ marginLeft: "10px" }} />
        </Link>
      </header>

      <section className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>¿Qué puedes hacer con Aegispad?</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <FaFeatherAlt className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>
              Redacción Markdown Intuitiva
            </h3>
            <p className={styles.featureDescription}>
              Crea contenido rico y bien formateado con nuestro editor Markdown
              potente y fácil de usar.
            </p>
          </div>
          <div className={styles.featureCard}>
            <FaLanguage className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Traducción Inteligente</h3>
            <p className={styles.featureDescription}>
              Traduce tus artículos a múltiples idiomas con un solo clic,
              manteniendo la estructura y el formato.
            </p>
          </div>
          <div className={styles.featureCard}>
            <FaHive className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Publicación Directa en HIVE</h3>
            <p className={styles.featureDescription}>
              Conecta tu cuenta de HIVE y publica tus creaciones directamente en
              la blockchain, sin complicaciones.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.callToActionSection}>
        <h2 className={styles.sectionTitle}>
          ¿Listo para Potenciar tu Contenido?
        </h2>
        <p className={styles.ctaText}>
          Únete a la comunidad de creadores que utilizan Aegispad para llevar
          sus ideas más lejos.
        </p>
        <Link to="/login" className={styles.ctaButtonSecondary}>
          Inicia Sesión o Regístrate
        </Link>
      </section>

      <section className={styles.futureFeaturesSection}>
        <h2 className={styles.sectionTitle}>¡Lo que Viene en Aegispad!</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <FaDatabase className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Borradores Persistentes</h3>
            <p className={styles.featureDescription}>
              Guarda tus ideas y artículos en progreso de forma segura en tu
              navegador, con opción a sincronizar en la nube.
            </p>
          </div>
          <div className={styles.featureCard}>
            <FaCalendarAlt className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Publicaciones Programadas</h3>
            <p className={styles.featureDescription}>
              Prepara tus posts y decide exactamente cuándo se publicarán en
              HIVE, optimizando tu estrategia de contenido.
            </p>
          </div>
          <div className={styles.featureCard}>
            <FaLightbulb className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Asistente IA Creativo</h3>
            <p className={styles.featureDescription}>
              Recibe ayuda para redactar, generar ideas e incluso crear imágenes
              únicas con nuestro asistente inteligente integrado.
            </p>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>
          &copy; {new Date().getFullYear()} Aegispad. Todos los derechos
          reservados.
        </p>
        {/* Podrías añadir más enlaces aquí si es necesario */}
      </footer>
    </div>
  );
}
export default HomePage;
