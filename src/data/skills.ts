// Skill data configuration file
// Used to manage data for the skill display page

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string; // Iconify icon name
  category: "frontend" | "backend" | "database" | "tools" | "other";
  level: "beginner" | "intermediate" | "advanced" | "expert";
  experience: {
    years: number;
    months: number;
  };
  projects?: string[]; // Related project IDs
  certifications?: string[];
  color?: string; // Skill card theme color
}

export const skillsData: Skill[] = [
  // Frontend Skills
  {
    id: "javascript",
    name: "JavaScript",
    description:
      "Modern JavaScript development, including ES6+ syntax, asynchronous programming, and modular development.",
    icon: "logos:javascript",
    category: "frontend",
    level: "advanced",
    experience: { years: 2, months: 0 },
    projects: ["mizuki-blog", "portfolio-website", "data-visualization-tool"],
    color: "#F7DF1E",
  },

  {
    id: "vue",
    name: "Vue.js",
    description:
      "A progressive JavaScript framework that is easy to learn and use, suitable for rapid development.",
    icon: "logos:vue",
    category: "frontend",
    level: "intermediate",
    experience: { years: 0, months: 5 },
    projects: ["data-visualization-tool"],
    color: "#4FC08D",
  },

  {
    id: "vite",
    name: "Vite",
    description:
      "Next-generation frontend build tool with fast cold starts and hot updates.",
    icon: "logos:vitejs",
    category: "frontend",
    level: "intermediate",
    experience: { years: 0, months: 5 },
    projects: ["vue-project", "react-project"],
    color: "#646CFF",
  },

  // Backend Skills
  {
    id: "nodejs",
    name: "Node.js",
    description:
      "A JavaScript runtime based on Chrome V8 engine, used for server-side development.",
    icon: "logos:nodejs-icon",
    category: "backend",
    level: "intermediate",
    experience: { years: 1, months: 5 },
    projects: ["data-visualization-tool", "e-commerce-platform"],
    color: "#339933",
  },

  {
    id: "csharp",
    name: "C#",
    description: "I like it very much.",
    icon: "devicon:csharp",
    category: "backend",
    level: "intermediate",
    experience: { years: 3, months: 0 },
    projects: ["desktop-application", "web-api"],
    color: "#239120",
  },

  {
    id: "kotlin",
    name: "Kotlin",
    description:
      "A modern programming language developed by JetBrains, fully compatible with Java, the preferred choice for Android development.",
    icon: "logos:kotlin-icon",
    category: "backend",
    level: "beginner",
    experience: { years: 0, months: 8 },
    projects: ["android-app", "kotlin-backend"],
    color: "#7F52FF",
  },

  // Tools
  {
    id: "git",
    name: "Git",
    description:
      "A distributed version control system, an essential tool for code management and team collaboration.",
    icon: "logos:git-icon",
    category: "tools",
    level: "advanced",
    experience: { years: 1, months: 0 },
    color: "#F05032",
  },
  {
    id: "vscode",
    name: "VS Code",
    description:
      "A lightweight but powerful code editor with a rich plugin ecosystem.",
    icon: "logos:visual-studio-code",
    category: "tools",
    level: "advanced",
    experience: { years: 2, months: 0 },
    color: "#007ACC",
  },
  {
    id: "linux",
    name: "Linux",
    description:
      "An open-source operating system, the preferred choice for server deployment and development environments.",
    icon: "logos:linux-tux",
    category: "tools",
    level: "intermediate",
    experience: { years: 1, months: 0 },
    projects: ["server-management", "shell-scripting"],
    color: "#FCC624",
  },
];
