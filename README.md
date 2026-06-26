# 🧠 SAGE-BFA (Sistema de Automatización y Gestión de Evaluaciones)

![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Java](https://img.shields.io/badge/Backend-Java-ED8B00?style=for-the-badge&logo=java&logoColor=white)
![OpenXava](https://img.shields.io/badge/Framework-OpenXava-4A90E2?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Deploy-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

SAGE-BFA es una plataforma integral SaaS desarrollada para la **Universidad Americana (UAM)**, diseñada para digitalizar, administrar y automatizar la aplicación de la **Batería Factorial de Aptitudes (B.F.A.)**. 

El sistema elimina horas de tabulación manual al proveer una experiencia fluida para el candidato mediante una interfaz interactiva y protegida, mientras otorga a la facultad de psicología un panel administrativo robusto (Backoffice) capaz de calificar, baremar y generar reportes clínicos en PDF en tiempo real.

---

## ✨ Características Principales

* **Arquitectura 100% Data-Driven:** El motor psicométrico está diseñado con entidades genéricas (`ModuloPrueba`, `IntentoEvaluacion`). Permite a la facultad agregar nuevos tests (como Fluidez Verbal o Razonamiento) y configurar instrucciones directamente desde la base de datos sin necesidad de refactorizar ni compilar código Java.
* **Tolerancia a Fallos (Null-Safety):** Backend resiliente que intercepta auto-envíos incompletos (cuando el cronómetro expira) garantizando la persistencia de las respuestas en blanco sin romper la integridad referencial de la base de datos.
* **Renderizado Matemático Nativo:** Integración de **KaTeX** en el frontend para renderizar ecuaciones, fracciones y operadores matemáticos complejos con calidad de impresión (ej. $\frac{5}{24}$), garantizando la validez visual del test.
* **Motor de Baremos y Diagnóstico Automático:** Algoritmos de aproximación de distancia absoluta para cruzar puntuaciones directas con baremos nacionales y asignar diagnósticos cualitativos (ej. "Medio Alto", "Superior").
* **Generación de Reportes Clínicos (PDF):** Creación nativa de reportes listos para expediente usando `OpenPDF`, incluyendo la cabecera institucional y la interpretación clínica.
* **UX y Modo Quiosco:** Frontend construido en React/Vite con navegación rápida tolerante a nulos, diseño responsivo y prevención de recargas accidentales para asegurar la integridad de las sesiones en los laboratorios de cómputo.

---

## 🛠️ Stack Tecnológico

**Frontend:**
* React (Vite)
* Tailwind CSS
* KaTeX (Renderizado matemático)

**Backend & Core:**
* Java 11+
* OpenXava Framework (NaviOX para Backoffice)
* JPA / Hibernate (ORM)
* OpenPDF

**Infraestructura:**
* PostgreSQL
* Apache Tomcat
* Docker & Docker Compose

---

## 🚀 Despliegue y Ejecución

El proyecto está preparado para orquestarse en contenedores, aislando el frontend, el backend y la base de datos.

### Mediante Docker (Recomendado para Producción)
1. Clona el repositorio.
2. En la raíz del proyecto, ejecuta:
   ```bash
   docker-compose up -d --build
   ```
   El frontend estará disponible en [http://localhost:5173](http://localhost:5173) y el panel administrativo en [http://localhost:8080/sageBFA](http://localhost:8080/sageBFA).

### Entorno de Desarrollo Local

#### ☕ Backend (Java/OpenXava)
1. Navega al directorio del backend:
   ```bash
   cd sageBFA
   ```
2. Compila y empaqueta el proyecto Java:
   ```bash
   mvn clean compile
   mvn package
   ```
3. Despliega el `.war` generado en el servidor Tomcat local.

#### ⚛️ Frontend (React)
1. Navega al directorio del frontend:
   ```bash
   cd sageBFA-frontend
   ```
2. Instala las dependencias de node:
   ```bash
   npm install
   ```
3. Ejecuta el servidor de desarrollo local:
   ```bash
   npm run dev
   ```

---

## structure 🏗️ Arquitectura de Base de Datos
El sistema utiliza un modelo relacional estricto con eliminaciones en cascada (`CascadeType.ALL`, `orphanRemoval = true`). Eliminar a un candidato desde el panel administrativo purgará automáticamente y de forma segura todos sus intentos, respuestas históricas y rastros del sistema sin dejar registros huérfanos.

---

## 👥 Equipo de Desarrollo
Proyecto desarrollado por estudiantes de 3er Semestre de Ingeniería de Sistemas de la UAM:

* **Andrés Gonzalez** - Frontend / UX
* **Caleb Tardencilla** - Frontend / Integración
* **Rafael Hernandez** - Backend / DevOps
* **William García** - Arquitectura de Software / Backend
