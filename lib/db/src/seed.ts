import { db } from "./index";
import { projectsTable, servicesTable, usersTable } from "./schema";

async function seed() {
  console.log("Seeding database...");

  // Seed demo users
  const demoUsers = [
    {
      clerkId: "demo_alice",
      name: "Alice Chen",
      email: "alice@techverse.dev",
      bio: "Full-stack engineer specializing in React & Go. Building the future, one commit at a time.",
      location: "San Francisco, CA",
      website: "https://alicechen.dev",
      github: "github.com/alicechen",
      linkedin: "linkedin.com/in/alicechen",
      skills: ["React", "TypeScript", "Go", "PostgreSQL", "Docker", "AWS"],
      isAdmin: false,
    },
    {
      clerkId: "demo_bob",
      name: "Bob Martinez",
      email: "bob@techverse.dev",
      bio: "Mobile developer & UI/UX enthusiast. Turning ideas into beautiful, functional experiences.",
      location: "Austin, TX",
      github: "github.com/bobmartinez",
      skills: ["React Native", "Swift", "Figma", "Node.js", "Firebase"],
      isAdmin: false,
    },
    {
      clerkId: "demo_carol",
      name: "Carol Zhang",
      email: "carol@techverse.dev",
      bio: "DevOps engineer & cloud architect. I automate everything so you don't have to.",
      location: "Seattle, WA",
      skills: ["Kubernetes", "Terraform", "AWS", "GCP", "Python", "Rust"],
      isAdmin: false,
    },
  ];

  const insertedUsers = await db.insert(usersTable).values(demoUsers).onConflictDoNothing().returning();
  console.log(`Seeded ${insertedUsers.length} users`);

  // Seed projects
  const demoProjects = [
    {
      userId: "demo_alice",
      title: "NeuralCanvas AI",
      description: "An AI-powered design tool that generates UI components from natural language descriptions.",
      longDescription: "NeuralCanvas AI leverages GPT-4 and Stable Diffusion to create production-ready React components from simple text prompts. Features real-time preview, code export, and design system integration.",
      techStack: ["React", "TypeScript", "OpenAI", "Stable Diffusion", "FastAPI", "PostgreSQL"],
      category: "AI/ML",
      imageUrl: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&auto=format&fit=crop",
      demoUrl: "https://neuralcanvas.ai",
      githubUrl: "https://github.com/demo/neural-canvas",
      featured: true,
    },
    {
      userId: "demo_bob",
      title: "ChainPulse Analytics",
      description: "Real-time blockchain analytics dashboard with predictive price modeling and portfolio tracking.",
      techStack: ["React", "Web3.js", "D3.js", "Rust", "Redis", "PostgreSQL"],
      category: "Blockchain",
      imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop",
      githubUrl: "https://github.com/demo/chain-pulse",
      featured: true,
    },
    {
      userId: "demo_carol",
      title: "Orchestrator Platform",
      description: "Self-healing Kubernetes orchestration platform with automated scaling and incident response.",
      techStack: ["Go", "Kubernetes", "Prometheus", "Grafana", "Terraform", "gRPC"],
      category: "DevOps",
      imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop",
      githubUrl: "https://github.com/demo/orchestrator",
      featured: true,
    },
    {
      userId: "demo_alice",
      title: "TechHire Pro",
      description: "An AI-powered technical interview platform with automated coding assessments and feedback.",
      techStack: ["React", "Node.js", "OpenAI", "Docker", "MongoDB"],
      category: "Web Development",
      imageUrl: "https://images.unsplash.com/photo-1573167507387-6b4b98cb7c13?w=800&auto=format&fit=crop",
      featured: false,
    },
    {
      userId: "demo_bob",
      title: "FitFlow Mobile",
      description: "Personalized fitness coaching app with computer vision for form correction and workout planning.",
      techStack: ["React Native", "TensorFlow Lite", "FastAPI", "PostgreSQL", "AWS"],
      category: "Mobile Development",
      imageUrl: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop",
      featured: false,
    },
    {
      userId: "demo_carol",
      title: "DataStream Pipeline",
      description: "High-throughput real-time data streaming pipeline processing 10M+ events per second.",
      techStack: ["Apache Kafka", "Apache Flink", "Rust", "ClickHouse", "Terraform"],
      category: "Data Science",
      imageUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format&fit=crop",
      featured: false,
    },
  ];

  const insertedProjects = await db.insert(projectsTable).values(demoProjects).onConflictDoNothing().returning();
  console.log(`Seeded ${insertedProjects.length} projects`);

  // Seed services
  const demoServices = [
    {
      userId: "demo_alice",
      title: "Full-Stack Web Application Development",
      description: "I'll build your complete web application from database design to deployed frontend. Specializing in React + TypeScript frontends with Node.js or Go backends.",
      category: "Web Development",
      price: "2500",
      priceUnit: "fixed",
      deliveryDays: 21,
      imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop",
      tags: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
      isActive: true,
    },
    {
      userId: "demo_alice",
      title: "Code Review & Architecture Consulting",
      description: "Get expert eyes on your codebase. I'll review your code quality, suggest architectural improvements, and provide a detailed report with actionable recommendations.",
      category: "Consulting",
      price: "150",
      priceUnit: "hourly",
      deliveryDays: 3,
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop",
      tags: ["Code Review", "Architecture", "Best Practices", "TypeScript"],
      isActive: true,
    },
    {
      userId: "demo_bob",
      title: "React Native iOS & Android App",
      description: "Cross-platform mobile app development with React Native. Pixel-perfect UI, smooth animations, and native performance. App Store & Play Store submission included.",
      category: "Mobile Development",
      price: "3500",
      priceUnit: "fixed",
      deliveryDays: 30,
      imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop",
      tags: ["React Native", "iOS", "Android", "TypeScript", "Firebase"],
      isActive: true,
    },
    {
      userId: "demo_bob",
      title: "UI/UX Design System Creation",
      description: "Complete design system in Figma including components, tokens, documentation, and React implementation. Consistent, scalable, and beautiful.",
      category: "UI/UX Design",
      price: "1200",
      priceUnit: "fixed",
      deliveryDays: 14,
      imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop",
      tags: ["Figma", "Design System", "React", "Tailwind CSS"],
      isActive: true,
    },
    {
      userId: "demo_carol",
      title: "Kubernetes Infrastructure Setup",
      description: "Production-grade Kubernetes cluster setup with auto-scaling, monitoring, CI/CD pipelines, and security hardening. On AWS, GCP, or Azure.",
      category: "DevOps",
      price: "2000",
      priceUnit: "fixed",
      deliveryDays: 10,
      imageUrl: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop",
      tags: ["Kubernetes", "Docker", "CI/CD", "AWS", "Terraform"],
      isActive: true,
    },
    {
      userId: "demo_carol",
      title: "DevOps & SRE Consulting",
      description: "Optimize your deployment pipeline, reduce incidents, and improve system reliability. Includes SLI/SLO setup, runbooks, and team training.",
      category: "DevOps",
      price: "200",
      priceUnit: "hourly",
      deliveryDays: 5,
      imageUrl: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&auto=format&fit=crop",
      tags: ["SRE", "DevOps", "Monitoring", "Incident Response", "Terraform"],
      isActive: true,
    },
    {
      userId: "demo_alice",
      title: "AI Integration & OpenAI API Development",
      description: "Add AI superpowers to your existing product. I'll integrate OpenAI, build custom prompts, fine-tuning pipelines, and streaming chat interfaces.",
      category: "AI/ML",
      price: "1800",
      priceUnit: "fixed",
      deliveryDays: 14,
      imageUrl: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&auto=format&fit=crop",
      tags: ["OpenAI", "GPT-4", "LangChain", "Python", "FastAPI"],
      isActive: true,
    },
  ];

  const insertedServices = await db.insert(servicesTable).values(demoServices).onConflictDoNothing().returning();
  console.log(`Seeded ${insertedServices.length} services`);

  console.log("Seeding complete!");
}

seed().catch(console.error).finally(() => process.exit(0));
