# NASA GISTEMP Climate Visualizer 🌍

Une application web interactive pour visualiser les anomalies de température globale basée sur les données NASA GISTEMP depuis 1880.

Ce projet est né de ma passion pour la climatologie et les visualisations interactives. Il permet d'explorer les anomalies de température sur un globe 3D, tout en naviguant dans le temps et en consultant les données issues de la NASA et de la NOAA.

## 🚀 Démo Live

**[Voir l'application en action →](https://nasa-gistemp-viewer.vercel.app)**

## ✨ Fonctionnalités

- 🌍 **Globe 3D interactif** avec visualisation des anomalies de température
- 📊 **Données en temps réel** depuis NASA GISTEMP et NOAA
- 📅 **Navigation temporelle** de 1880 à aujourd'hui
- 📱 **Design responsive** pour mobile et desktop
- 🎨 **Interface moderne** avec animations fluides
- 📈 **Table de données triable** par régions (Global, Nord, Sud)
- 🌊 **Indices océaniques** El Niño/La Niña (ONI)
- ℹ️ **Mode d'emploi intégré** pour guider les utilisateurs

## 🛠️ Technologies

- **Frontend :** Next.js 15 (App Router), React 18
- **3D :** Three.js, React Three Fiber
- **Animations :** Framer Motion
- **Styling :** CSS Modules, CSS-in-JS
- **Déploiement :** Vercel
- **APIs :** NASA GISTEMP, NOAA Climate Prediction Center

## 📊 Sources de Données

- **[NASA GISTEMP](https://data.giss.nasa.gov/gistemp/)** - Analyse des températures de surface
- **[NOAA CPC](https://www.cpc.ncep.noaa.gov/data/indices/)** - Indices océaniques Niño (ONI)

## 🏃‍♂️ Installation locale

```bash
# Cloner le projet
git clone https://github.com/JohanL-78/nasa-gistemp-viewer.git
cd nasa-gistemp-viewer

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Ouvrir http://localhost:3000
```

## 📁 Structure du projet

```
├── app/                    # App Router (Next.js 15)
│   ├── api/               # API Routes
│   ├── layout.js          # Layout principal
│   └── page.js            # Page d'accueil
├── components/            # Composants React
│   ├── ClimateGlobe.jsx  # Globe 3D interactif
│   ├── DataTable.jsx     # Table de données
│   ├── Navbar.jsx        # Navigation
│   └── HelpModal.jsx     # Mode d'emploi
├── lib/                  # Logique métier
│   ├── data.js           # Récupération des données
│   └── actions.js        # Server Actions
├── public/              # Assets statiques
│   └── textures/        # Textures pour le globe 3D
└── styles/             # Styles globaux
```

## 🎯 Fonctionnement

1. **Récupération automatique** des données NASA/NOAA
2. **Mise en cache** pour optimiser les performances
3. **Génération de textures** pour la visualisation 3D
4. **Rendu hybride** : Server Components + composants client
5. **Actualisation** : Les données sont mises à jour automatiquement

## 🌟 Captures d'écran

### Globe interactif
![Globe 3D](screenshots/ClimateGlobe.png)

### Interface mobile
![Mobile](screenshots/MobileGlobe.png)

### Table de données
![Data Table](screenshots/TableGlobe.png)

## 📈 Performance

- ⚡ **Server Components** pour un rendu initial rapide
- 💾 **Cache intelligent** des données (48h)
- 🗜️ **Optimisation automatique** des images et textures
- 📱 **Responsive** avec chargement adaptatif

## 👨‍💻 Auteur

**Johan Lorck**

- 🌐 Portfolio : [portfolio-spa-alpha.vercel.app](https://portfolio-spa-alpha.vercel.app)
- 💼 LinkedIn : [Johan Lorck](https://www.linkedin.com/in/johan-lorck-21949a350/)
- 📧 Email : jokafe.lo@gmail.com

## 🙏 Remerciements

- **NASA GISS** pour les données de température
- **NOAA** pour les indices océaniques
- **Vercel** pour l'hébergement
- **Next.js Team** pour le framework

---

⭐ **Si ce projet vous plaît, n'hésitez pas à lui donner une étoile !**