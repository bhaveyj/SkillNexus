import { PrismaClient, SkillCategory } from '@prisma/client';

const prisma = new PrismaClient();

const skillsData = [
  // DevOps
  { name: 'Docker', category: SkillCategory.DEVOPS },
  { name: 'Kubernetes', category: SkillCategory.DEVOPS },
  { name: 'Jenkins', category: SkillCategory.DEVOPS },
  { name: 'GitLab CI/CD', category: SkillCategory.DEVOPS },
  { name: 'GitHub Actions', category: SkillCategory.DEVOPS },
  { name: 'CircleCI', category: SkillCategory.DEVOPS },
  { name: 'Ansible', category: SkillCategory.DEVOPS },
  { name: 'Terraform', category: SkillCategory.DEVOPS },
  { name: 'Puppet', category: SkillCategory.DEVOPS },
  { name: 'Chef', category: SkillCategory.DEVOPS },
  { name: 'Linux', category: SkillCategory.DEVOPS },
  { name: 'Nginx', category: SkillCategory.DEVOPS },
  { name: 'Apache', category: SkillCategory.DEVOPS },
  { name: 'Prometheus', category: SkillCategory.DEVOPS },
  { name: 'Grafana', category: SkillCategory.DEVOPS },
  { name: 'ELK Stack', category: SkillCategory.DEVOPS },
  { name: 'ArgoCD', category: SkillCategory.DEVOPS },
  { name: 'Helm', category: SkillCategory.DEVOPS },
  
  // Cloud
  { name: 'AWS', category: SkillCategory.CLOUD },
  { name: 'AWS EC2', category: SkillCategory.CLOUD },
  { name: 'AWS S3', category: SkillCategory.CLOUD },
  { name: 'AWS Lambda', category: SkillCategory.CLOUD },
  { name: 'AWS ECS', category: SkillCategory.CLOUD },
  { name: 'AWS EKS', category: SkillCategory.CLOUD },
  { name: 'AWS RDS', category: SkillCategory.CLOUD },
  { name: 'Azure', category: SkillCategory.CLOUD },
  { name: 'Azure DevOps', category: SkillCategory.CLOUD },
  { name: 'Azure Functions', category: SkillCategory.CLOUD },
  { name: 'Google Cloud Platform', category: SkillCategory.CLOUD },
  { name: 'GCP Cloud Run', category: SkillCategory.CLOUD },
  { name: 'Firebase', category: SkillCategory.CLOUD },
  { name: 'Heroku', category: SkillCategory.CLOUD },
  { name: 'Vercel', category: SkillCategory.CLOUD },
  { name: 'Netlify', category: SkillCategory.CLOUD },
  { name: 'DigitalOcean', category: SkillCategory.CLOUD },
  { name: 'Cloudflare', category: SkillCategory.CLOUD },
  
  // Web Development
  { name: 'HTML', category: SkillCategory.WEB_DEVELOPMENT },
  { name: 'CSS', category: SkillCategory.WEB_DEVELOPMENT },
  { name: 'JavaScript', category: SkillCategory.WEB_DEVELOPMENT },
  { name: 'TypeScript', category: SkillCategory.WEB_DEVELOPMENT },
  { name: 'React', category: SkillCategory.WEB_DEVELOPMENT },
  { name: 'Next.js', category: SkillCategory.WEB_DEVELOPMENT },
  { name: 'Vue.js', category: SkillCategory.WEB_DEVELOPMENT },
  { name: 'Nuxt.js', category: SkillCategory.WEB_DEVELOPMENT },
  { name: 'Angular', category: SkillCategory.WEB_DEVELOPMENT },
  { name: 'Svelte', category: SkillCategory.WEB_DEVELOPMENT },
  { name: 'SvelteKit', category: SkillCategory.WEB_DEVELOPMENT },
  { name: 'Remix', category: SkillCategory.WEB_DEVELOPMENT },
  { name: 'Astro', category: SkillCategory.WEB_DEVELOPMENT },
  { name: 'Webpack', category: SkillCategory.WEB_DEVELOPMENT },
  { name: 'Vite', category: SkillCategory.WEB_DEVELOPMENT },
  { name: 'Tailwind CSS', category: SkillCategory.WEB_DEVELOPMENT },
  { name: 'Bootstrap', category: SkillCategory.WEB_DEVELOPMENT },
  { name: 'Material-UI', category: SkillCategory.WEB_DEVELOPMENT },
  { name: 'Sass/SCSS', category: SkillCategory.WEB_DEVELOPMENT },
  
  // Frontend
  { name: 'Redux', category: SkillCategory.FRONTEND },
  { name: 'Redux Toolkit', category: SkillCategory.FRONTEND },
  { name: 'Zustand', category: SkillCategory.FRONTEND },
  { name: 'React Query', category: SkillCategory.FRONTEND },
  { name: 'React Router', category: SkillCategory.FRONTEND },
  { name: 'GraphQL Client', category: SkillCategory.FRONTEND },
  { name: 'Apollo Client', category: SkillCategory.FRONTEND },
  { name: 'Axios', category: SkillCategory.FRONTEND },
  { name: 'Framer Motion', category: SkillCategory.FRONTEND },
  { name: 'Three.js', category: SkillCategory.FRONTEND },
  { name: 'D3.js', category: SkillCategory.FRONTEND },
  { name: 'Chart.js', category: SkillCategory.FRONTEND },
  { name: 'WebSockets', category: SkillCategory.FRONTEND },
  { name: 'PWA', category: SkillCategory.FRONTEND },
  { name: 'Web Components', category: SkillCategory.FRONTEND },
  
  // Backend
  { name: 'Node.js', category: SkillCategory.BACKEND },
  { name: 'Express.js', category: SkillCategory.BACKEND },
  { name: 'NestJS', category: SkillCategory.BACKEND },
  { name: 'Fastify', category: SkillCategory.BACKEND },
  { name: 'Python', category: SkillCategory.BACKEND },
  { name: 'Django', category: SkillCategory.BACKEND },
  { name: 'Flask', category: SkillCategory.BACKEND },
  { name: 'FastAPI', category: SkillCategory.BACKEND },
  { name: 'Java', category: SkillCategory.BACKEND },
  { name: 'Spring Boot', category: SkillCategory.BACKEND },
  { name: 'Go', category: SkillCategory.BACKEND },
  { name: 'Gin', category: SkillCategory.BACKEND },
  { name: 'Rust', category: SkillCategory.BACKEND },
  { name: 'Ruby on Rails', category: SkillCategory.BACKEND },
  { name: 'PHP', category: SkillCategory.BACKEND },
  { name: 'Laravel', category: SkillCategory.BACKEND },
  { name: 'GraphQL', category: SkillCategory.BACKEND },
  { name: 'REST API', category: SkillCategory.BACKEND },
  { name: 'gRPC', category: SkillCategory.BACKEND },
  { name: 'Microservices', category: SkillCategory.BACKEND },
  { name: 'WebRTC', category: SkillCategory.BACKEND },
  { name: 'Socket.io', category: SkillCategory.BACKEND },
  
  // Mobile
  { name: 'React Native', category: SkillCategory.MOBILE },
  { name: 'Flutter', category: SkillCategory.MOBILE },
  { name: 'Swift', category: SkillCategory.MOBILE },
  { name: 'SwiftUI', category: SkillCategory.MOBILE },
  { name: 'Kotlin', category: SkillCategory.MOBILE },
  { name: 'Android', category: SkillCategory.MOBILE },
  { name: 'iOS', category: SkillCategory.MOBILE },
  { name: 'Ionic', category: SkillCategory.MOBILE },
  { name: 'Expo', category: SkillCategory.MOBILE },
  { name: 'Xamarin', category: SkillCategory.MOBILE },
  
  // Database
  { name: 'SQL', category: SkillCategory.DATABASE },
  { name: 'PostgreSQL', category: SkillCategory.DATABASE },
  { name: 'MySQL', category: SkillCategory.DATABASE },
  { name: 'MongoDB', category: SkillCategory.DATABASE },
  { name: 'Redis', category: SkillCategory.DATABASE },
  { name: 'Elasticsearch', category: SkillCategory.DATABASE },
  { name: 'Cassandra', category: SkillCategory.DATABASE },
  { name: 'DynamoDB', category: SkillCategory.DATABASE },
  { name: 'Firebase Firestore', category: SkillCategory.DATABASE },
  { name: 'Supabase', category: SkillCategory.DATABASE },
  { name: 'Prisma', category: SkillCategory.DATABASE },
  { name: 'TypeORM', category: SkillCategory.DATABASE },
  { name: 'Sequelize', category: SkillCategory.DATABASE },
  { name: 'Drizzle ORM', category: SkillCategory.DATABASE },
  { name: 'Neo4j', category: SkillCategory.DATABASE },
  { name: 'InfluxDB', category: SkillCategory.DATABASE },
  
  // Data Science
  { name: 'Python for Data Science', category: SkillCategory.DATA_SCIENCE },
  { name: 'Pandas', category: SkillCategory.DATA_SCIENCE },
  { name: 'NumPy', category: SkillCategory.DATA_SCIENCE },
  { name: 'Matplotlib', category: SkillCategory.DATA_SCIENCE },
  { name: 'Seaborn', category: SkillCategory.DATA_SCIENCE },
  { name: 'Jupyter', category: SkillCategory.DATA_SCIENCE },
  { name: 'R Programming', category: SkillCategory.DATA_SCIENCE },
  { name: 'Tableau', category: SkillCategory.DATA_SCIENCE },
  { name: 'Power BI', category: SkillCategory.DATA_SCIENCE },
  { name: 'Apache Spark', category: SkillCategory.DATA_SCIENCE },
  { name: 'Apache Kafka', category: SkillCategory.DATA_SCIENCE },
  { name: 'ETL', category: SkillCategory.DATA_SCIENCE },
  { name: 'Data Warehousing', category: SkillCategory.DATA_SCIENCE },
  { name: 'Snowflake', category: SkillCategory.DATA_SCIENCE },
  { name: 'BigQuery', category: SkillCategory.DATA_SCIENCE },
  
  // AI/ML
  { name: 'Machine Learning', category: SkillCategory.AI_ML },
  { name: 'Deep Learning', category: SkillCategory.AI_ML },
  { name: 'TensorFlow', category: SkillCategory.AI_ML },
  { name: 'PyTorch', category: SkillCategory.AI_ML },
  { name: 'Scikit-learn', category: SkillCategory.AI_ML },
  { name: 'Keras', category: SkillCategory.AI_ML },
  { name: 'Natural Language Processing', category: SkillCategory.AI_ML },
  { name: 'Computer Vision', category: SkillCategory.AI_ML },
  { name: 'OpenCV', category: SkillCategory.AI_ML },
  { name: 'Hugging Face', category: SkillCategory.AI_ML },
  { name: 'LangChain', category: SkillCategory.AI_ML },
  { name: 'OpenAI API', category: SkillCategory.AI_ML },
  { name: 'LLMs', category: SkillCategory.AI_ML },
  { name: 'MLOps', category: SkillCategory.AI_ML },
  { name: 'Model Deployment', category: SkillCategory.AI_ML },
  
  // UI/UX
  { name: 'Figma', category: SkillCategory.UI_UX },
  { name: 'Adobe XD', category: SkillCategory.UI_UX },
  { name: 'Sketch', category: SkillCategory.UI_UX },
  { name: 'UI Design', category: SkillCategory.UI_UX },
  { name: 'UX Design', category: SkillCategory.UI_UX },
  { name: 'Prototyping', category: SkillCategory.UI_UX },
  { name: 'Wireframing', category: SkillCategory.UI_UX },
  { name: 'User Research', category: SkillCategory.UI_UX },
  { name: 'Design Systems', category: SkillCategory.UI_UX },
  { name: 'Accessibility (A11y)', category: SkillCategory.UI_UX },
  
  // Cybersecurity
  { name: 'Ethical Hacking', category: SkillCategory.CYBERSECURITY },
  { name: 'Penetration Testing', category: SkillCategory.CYBERSECURITY },
  { name: 'Network Security', category: SkillCategory.CYBERSECURITY },
  { name: 'OWASP', category: SkillCategory.CYBERSECURITY },
  { name: 'Security Auditing', category: SkillCategory.CYBERSECURITY },
  { name: 'Cryptography', category: SkillCategory.CYBERSECURITY },
  { name: 'OAuth', category: SkillCategory.CYBERSECURITY },
  { name: 'JWT', category: SkillCategory.CYBERSECURITY },
  { name: 'Zero Trust', category: SkillCategory.CYBERSECURITY },
  
  // Blockchain
  { name: 'Blockchain', category: SkillCategory.BLOCKCHAIN },
  { name: 'Solidity', category: SkillCategory.BLOCKCHAIN },
  { name: 'Ethereum', category: SkillCategory.BLOCKCHAIN },
  { name: 'Smart Contracts', category: SkillCategory.BLOCKCHAIN },
  { name: 'Web3.js', category: SkillCategory.BLOCKCHAIN },
  { name: 'Hardhat', category: SkillCategory.BLOCKCHAIN },
  { name: 'Truffle', category: SkillCategory.BLOCKCHAIN },
  { name: 'NFTs', category: SkillCategory.BLOCKCHAIN },
  { name: 'DeFi', category: SkillCategory.BLOCKCHAIN },
  
  // Game Development
  { name: 'Unity', category: SkillCategory.GAME_DEVELOPMENT },
  { name: 'Unreal Engine', category: SkillCategory.GAME_DEVELOPMENT },
  { name: 'C#', category: SkillCategory.GAME_DEVELOPMENT },
  { name: 'C++', category: SkillCategory.GAME_DEVELOPMENT },
  { name: 'Godot', category: SkillCategory.GAME_DEVELOPMENT },
  { name: 'Game Design', category: SkillCategory.GAME_DEVELOPMENT },
  { name: '3D Modeling', category: SkillCategory.GAME_DEVELOPMENT },
  { name: 'Blender', category: SkillCategory.GAME_DEVELOPMENT },
  
  // Testing
  { name: 'Jest', category: SkillCategory.TESTING },
  { name: 'Vitest', category: SkillCategory.TESTING },
  { name: 'Cypress', category: SkillCategory.TESTING },
  { name: 'Playwright', category: SkillCategory.TESTING },
  { name: 'Selenium', category: SkillCategory.TESTING },
  { name: 'Testing Library', category: SkillCategory.TESTING },
  { name: 'Unit Testing', category: SkillCategory.TESTING },
  { name: 'Integration Testing', category: SkillCategory.TESTING },
  { name: 'E2E Testing', category: SkillCategory.TESTING },
  { name: 'TDD', category: SkillCategory.TESTING },
  { name: 'BDD', category: SkillCategory.TESTING },
  { name: 'Postman', category: SkillCategory.TESTING },
  
  // Other
  { name: 'Git', category: SkillCategory.OTHER },
  { name: 'GitHub', category: SkillCategory.OTHER },
  { name: 'GitLab', category: SkillCategory.OTHER },
  { name: 'Agile', category: SkillCategory.OTHER },
  { name: 'Scrum', category: SkillCategory.OTHER },
  { name: 'Jira', category: SkillCategory.OTHER },
  { name: 'Technical Writing', category: SkillCategory.OTHER },
  { name: 'API Documentation', category: SkillCategory.OTHER },
  { name: 'System Design', category: SkillCategory.OTHER },
  { name: 'Software Architecture', category: SkillCategory.OTHER },
];

async function seedSkills() {
  console.log('🌱 Starting skill seeding...');
  
  try {
    // Create skills
    for (const skillData of skillsData) {
      await prisma.skill.upsert({
        where: { name: skillData.name },
        update: {},
        create: skillData,
      });
    }
    
    console.log(`✅ Successfully seeded ${skillsData.length} skills!`);
    
    // Print summary by category
    const categories = await prisma.skill.groupBy({
      by: ['category'],
      _count: true,
    });
    
    console.log('\n📊 Skills by category:');
    categories.forEach((cat) => {
      console.log(`  ${cat.category}: ${cat._count} skills`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding skills:', error);
    throw error;
  }
}

seedSkills()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
