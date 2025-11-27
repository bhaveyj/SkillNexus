import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Sample user data with realistic names, bios, and skill combinations
const usersData = [
  { name: 'Alice Johnson', email: 'alice.johnson@test.com', bio: 'Full-stack developer passionate about React and Node.js', location: 'San Francisco, CA', canTeach: ['React', 'Node.js', 'TypeScript'], wantsLearn: ['Go', 'Kubernetes', 'GraphQL'] },
  { name: 'Bob Smith', email: 'bob.smith@test.com', bio: 'DevOps engineer with AWS expertise', location: 'Seattle, WA', canTeach: ['AWS', 'Docker', 'Kubernetes'], wantsLearn: ['React', 'TypeScript', 'Next.js'] },
  { name: 'Carol Davis', email: 'carol.davis@test.com', bio: 'UI/UX designer learning frontend development', location: 'New York, NY', canTeach: ['Figma', 'UI Design', 'Prototyping'], wantsLearn: ['React', 'CSS', 'Tailwind CSS'] },
  { name: 'David Wilson', email: 'david.wilson@test.com', bio: 'Backend developer specializing in Python', location: 'Austin, TX', canTeach: ['Python', 'Django', 'FastAPI'], wantsLearn: ['AWS Lambda', 'Microservices', 'Docker'] },
  { name: 'Emma Brown', email: 'emma.brown@test.com', bio: 'Mobile app developer with React Native experience', location: 'Boston, MA', canTeach: ['React Native', 'JavaScript', 'Expo'], wantsLearn: ['Flutter', 'Swift', 'Firebase'] },
  { name: 'Frank Miller', email: 'frank.miller@test.com', bio: 'Cloud architect focusing on Azure', location: 'Chicago, IL', canTeach: ['Azure', 'Azure DevOps', 'Terraform'], wantsLearn: ['AWS', 'GCP Cloud Run', 'Kubernetes'] },
  { name: 'Grace Lee', email: 'grace.lee@test.com', bio: 'Data scientist with ML expertise', location: 'Los Angeles, CA', canTeach: ['Machine Learning', 'TensorFlow', 'Python for Data Science'], wantsLearn: ['MLOps', 'Kubernetes', 'Docker'] },
  { name: 'Henry Taylor', email: 'henry.taylor@test.com', bio: 'Frontend specialist loving Vue.js', location: 'Denver, CO', canTeach: ['Vue.js', 'Nuxt.js', 'Tailwind CSS'], wantsLearn: ['React', 'Next.js', 'TypeScript'] },
  { name: 'Iris Anderson', email: 'iris.anderson@test.com', bio: 'Database expert and backend developer', location: 'Portland, OR', canTeach: ['PostgreSQL', 'MongoDB', 'Redis'], wantsLearn: ['Elasticsearch', 'Cassandra', 'Neo4j'] },
  { name: 'Jack Thomas', email: 'jack.thomas@test.com', bio: 'Security engineer passionate about ethical hacking', location: 'Miami, FL', canTeach: ['Ethical Hacking', 'Network Security', 'OWASP'], wantsLearn: ['Kubernetes', 'Docker', 'Cloud Security'] },
  { name: 'Kate Martinez', email: 'kate.martinez@test.com', bio: 'Full-stack developer with Spring Boot background', location: 'Dallas, TX', canTeach: ['Java', 'Spring Boot', 'MySQL'], wantsLearn: ['React', 'Node.js', 'PostgreSQL'] },
  { name: 'Liam Garcia', email: 'liam.garcia@test.com', bio: 'Go developer building microservices', location: 'Phoenix, AZ', canTeach: ['Go', 'Microservices', 'gRPC'], wantsLearn: ['Kubernetes', 'AWS EKS', 'Terraform'] },
  { name: 'Maya Rodriguez', email: 'maya.rodriguez@test.com', bio: 'iOS developer with SwiftUI skills', location: 'San Diego, CA', canTeach: ['Swift', 'SwiftUI', 'iOS'], wantsLearn: ['React Native', 'Flutter', 'Firebase'] },
  { name: 'Noah Hernandez', email: 'noah.hernandez@test.com', bio: 'Android developer exploring Kotlin', location: 'Philadelphia, PA', canTeach: ['Kotlin', 'Android', 'Firebase Firestore'], wantsLearn: ['React Native', 'Flutter', 'iOS'] },
  { name: 'Olivia Lopez', email: 'olivia.lopez@test.com', bio: 'DevOps enthusiast learning CI/CD', location: 'Houston, TX', canTeach: ['Jenkins', 'GitLab CI/CD', 'Linux'], wantsLearn: ['Kubernetes', 'AWS EKS', 'Terraform'] },
  { name: 'Paul Gonzalez', email: 'paul.gonzalez@test.com', bio: 'Blockchain developer working on Ethereum', location: 'San Jose, CA', canTeach: ['Solidity', 'Ethereum', 'Smart Contracts'], wantsLearn: ['React', 'Web3.js', 'Node.js'] },
  { name: 'Quinn Wilson', email: 'quinn.wilson@test.com', bio: 'Game developer using Unity', location: 'Orlando, FL', canTeach: ['Unity', 'C#', 'Game Design'], wantsLearn: ['Unreal Engine', 'C++', '3D Modeling'] },
  { name: 'Rachel Clark', email: 'rachel.clark@test.com', bio: 'Frontend developer mastering animations', location: 'Nashville, TN', canTeach: ['Framer Motion', 'Three.js', 'React'], wantsLearn: ['WebGL', 'Blender', 'Game Development'] },
  { name: 'Sam Lewis', email: 'sam.lewis@test.com', bio: 'Testing specialist with automation focus', location: 'Columbus, OH', canTeach: ['Cypress', 'Jest', 'Testing Library'], wantsLearn: ['Playwright', 'Selenium', 'E2E Testing'] },
  { name: 'Tina Walker', email: 'tina.walker@test.com', bio: 'Technical writer documenting APIs', location: 'Charlotte, NC', canTeach: ['Technical Writing', 'API Documentation', 'Markdown'], wantsLearn: ['REST API', 'GraphQL', 'Postman'] },
  { name: 'Uma Hall', email: 'uma.hall@test.com', bio: 'Data engineer working with Spark', location: 'Detroit, MI', canTeach: ['Apache Spark', 'Apache Kafka', 'Python'], wantsLearn: ['Airflow', 'Snowflake', 'BigQuery'] },
  { name: 'Victor Allen', email: 'victor.allen@test.com', bio: 'Cloud native developer', location: 'Indianapolis, IN', canTeach: ['Kubernetes', 'Docker', 'Helm'], wantsLearn: ['AWS ECS', 'Azure Functions', 'Serverless'] },
  { name: 'Wendy Young', email: 'wendy.young@test.com', bio: 'Frontend architect with design system expertise', location: 'Jacksonville, FL', canTeach: ['Design Systems', 'React', 'Storybook'], wantsLearn: ['Accessibility (A11y)', 'Web Components', 'PWA'] },
  { name: 'Xavier King', email: 'xavier.king@test.com', bio: 'Ruby on Rails developer', location: 'San Antonio, TX', canTeach: ['Ruby on Rails', 'PostgreSQL', 'REST API'], wantsLearn: ['Node.js', 'React', 'TypeScript'] },
  { name: 'Yara Wright', email: 'yara.wright@test.com', bio: 'NLP engineer working with transformers', location: 'Fort Worth, TX', canTeach: ['Natural Language Processing', 'Hugging Face', 'PyTorch'], wantsLearn: ['LangChain', 'OpenAI API', 'LLMs'] },
  { name: 'Zack Scott', email: 'zack.scott@test.com', bio: 'Full-stack JavaScript developer', location: 'Columbus, OH', canTeach: ['JavaScript', 'Express.js', 'MongoDB'], wantsLearn: ['TypeScript', 'NestJS', 'PostgreSQL'] },
  { name: 'Amber Torres', email: 'amber.torres@test.com', bio: 'UI designer transitioning to frontend', location: 'Charlotte, NC', canTeach: ['Sketch', 'Wireframing', 'User Research'], wantsLearn: ['HTML', 'CSS', 'JavaScript'] },
  { name: 'Blake Nguyen', email: 'blake.nguyen@test.com', bio: 'Senior backend engineer', location: 'El Paso, TX', canTeach: ['Node.js', 'NestJS', 'Microservices'], wantsLearn: ['Go', 'Rust', 'gRPC'] },
  { name: 'Chloe Hill', email: 'chloe.hill@test.com', bio: 'Data analyst learning visualization', location: 'Memphis, TN', canTeach: ['Pandas', 'NumPy', 'Jupyter'], wantsLearn: ['Tableau', 'Power BI', 'D3.js'] },
  { name: 'Derek Flores', email: 'derek.flores@test.com', bio: 'Systems architect with cloud focus', location: 'Boston, MA', canTeach: ['System Design', 'Software Architecture', 'AWS'], wantsLearn: ['Microservices', 'Event Driven Architecture', 'CQRS'] },
  { name: 'Elena Green', email: 'elena.green@test.com', bio: 'Web performance specialist', location: 'Seattle, WA', canTeach: ['Webpack', 'Vite', 'Performance Optimization'], wantsLearn: ['Rust', 'WebAssembly', 'Edge Computing'] },
  { name: 'Felix Adams', email: 'felix.adams@test.com', bio: 'Computer vision engineer', location: 'Portland, OR', canTeach: ['Computer Vision', 'OpenCV', 'TensorFlow'], wantsLearn: ['PyTorch', 'Model Deployment', 'Edge AI'] },
  { name: 'Gina Baker', email: 'gina.baker@test.com', bio: 'PHP developer modernizing legacy apps', location: 'Las Vegas, NV', canTeach: ['PHP', 'Laravel', 'MySQL'], wantsLearn: ['Node.js', 'TypeScript', 'PostgreSQL'] },
  { name: 'Hugo Nelson', email: 'hugo.nelson@test.com', bio: 'GraphQL enthusiast', location: 'Milwaukee, WI', canTeach: ['GraphQL', 'Apollo Client', 'React Query'], wantsLearn: ['gRPC', 'REST API', 'WebSockets'] },
  { name: 'Ivy Carter', email: 'ivy.carter@test.com', bio: 'Accessibility advocate', location: 'Albuquerque, NM', canTeach: ['Accessibility (A11y)', 'ARIA', 'WCAG'], wantsLearn: ['React', 'Vue.js', 'Testing Library'] },
  { name: 'Jason Mitchell', email: 'jason.mitchell@test.com', bio: 'Serverless architecture specialist', location: 'Tucson, AZ', canTeach: ['AWS Lambda', 'Serverless Framework', 'DynamoDB'], wantsLearn: ['Azure Functions', 'GCP Cloud Run', 'Event Sourcing'] },
  { name: 'Kara Perez', email: 'kara.perez@test.com', bio: 'Flutter developer building cross-platform apps', location: 'Fresno, CA', canTeach: ['Flutter', 'Dart', 'Firebase'], wantsLearn: ['React Native', 'Kotlin', 'Swift'] },
  { name: 'Leo Roberts', email: 'leo.roberts@test.com', bio: 'Infrastructure as Code expert', location: 'Sacramento, CA', canTeach: ['Terraform', 'Ansible', 'CloudFormation'], wantsLearn: ['Pulumi', 'CDK', 'Crossplane'] },
  { name: 'Mia Turner', email: 'mia.turner@test.com', bio: 'API developer focusing on REST', location: 'Long Beach, CA', canTeach: ['REST API', 'OpenAPI', 'Swagger'], wantsLearn: ['GraphQL', 'gRPC', 'WebRTC'] },
  { name: 'Nathan Phillips', email: 'nathan.phillips@test.com', bio: 'Message queue specialist', location: 'Kansas City, MO', canTeach: ['Apache Kafka', 'RabbitMQ', 'Redis'], wantsLearn: ['AWS SQS', 'Event Streaming', 'NATS'] },
  { name: 'Oscar Campbell', email: 'oscar.campbell@test.com', bio: 'Web3 developer exploring DeFi', location: 'Mesa, AZ', canTeach: ['Web3.js', 'Hardhat', 'Truffle'], wantsLearn: ['Solidity', 'Smart Contracts', 'DeFi'] },
  { name: 'Piper Parker', email: 'piper.parker@test.com', bio: 'E2E testing expert', location: 'Atlanta, GA', canTeach: ['Playwright', 'E2E Testing', 'Test Automation'], wantsLearn: ['Performance Testing', 'Load Testing', 'Chaos Engineering'] },
  { name: 'Quincy Evans', email: 'quincy.evans@test.com', bio: 'Frontend tooling enthusiast', location: 'Virginia Beach, VA', canTeach: ['ESLint', 'Prettier', 'Husky'], wantsLearn: ['Turborepo', 'Nx', 'Lerna'] },
  { name: 'Rosa Edwards', email: 'rosa.edwards@test.com', bio: 'State management specialist', location: 'Oakland, CA', canTeach: ['Redux', 'Redux Toolkit', 'MobX'], wantsLearn: ['Zustand', 'Recoil', 'Jotai'] },
  { name: 'Simon Collins', email: 'simon.collins@test.com', bio: 'Real-time systems developer', location: 'Minneapolis, MN', canTeach: ['WebSockets', 'Socket.io', 'SignalR'], wantsLearn: ['WebRTC', 'Server-Sent Events', 'Pusher'] },
  { name: 'Tara Stewart', email: 'tara.stewart@test.com', bio: 'Build systems expert', location: 'Wichita, KS', canTeach: ['Webpack', 'Rollup', 'esbuild'], wantsLearn: ['Vite', 'Turbopack', 'SWC'] },
  { name: 'Ulysses Morris', email: 'ulysses.morris@test.com', bio: 'SSR and SSG specialist', location: 'New Orleans, LA', canTeach: ['Next.js', 'Server Components', 'ISR'], wantsLearn: ['Astro', 'Remix', 'SvelteKit'] },
  { name: 'Violet Rogers', email: 'violet.rogers@test.com', bio: 'Authentication expert', location: 'Tampa, FL', canTeach: ['OAuth', 'JWT', 'Auth0'], wantsLearn: ['WebAuthn', 'Passkeys', 'Zero Trust'] },
  { name: 'Wade Reed', email: 'wade.reed@test.com', bio: 'Monitoring and observability engineer', location: 'Honolulu, HI', canTeach: ['Prometheus', 'Grafana', 'ELK Stack'], wantsLearn: ['Datadog', 'New Relic', 'OpenTelemetry'] },
  { name: 'Xena Cook', email: 'xena.cook@test.com', bio: 'Agile coach and Scrum master', location: 'Aurora, CO', canTeach: ['Agile', 'Scrum', 'Jira'], wantsLearn: ['Kanban', 'SAFe', 'DevOps Culture'] },
  { name: 'Yale Morgan', email: 'yale.morgan@test.com', bio: 'API gateway specialist', location: 'Anaheim, CA', canTeach: ['Kong', 'API Gateway', 'Rate Limiting'], wantsLearn: ['Service Mesh', 'Istio', 'Envoy'] },
];

async function seedExchangeData() {
  console.log('🌱 Starting skill exchange data seeding...');
  
  try {
    // First ensure skills exist
    const skills = await prisma.skill.findMany();
    if (skills.length === 0) {
      console.error('❌ No skills found. Please run seed-skills.ts first.');
      return;
    }
    
    const skillMap = new Map(skills.map(s => [s.name, s.id]));
    const password = await bcrypt.hash('test123', 12);
    
    console.log('👥 Creating users...');
    const createdUsers = [];
    
    for (const userData of usersData) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          email: userData.email,
          name: userData.name,
          password,
          bio: userData.bio,
          location: userData.location,
          role: 'USER',
        },
      });
      createdUsers.push({ ...user, canTeach: userData.canTeach, wantsLearn: userData.wantsLearn });
    }
    
    console.log(`✅ Created ${createdUsers.length} users`);
    
    // Create offers (skills users can teach)
    console.log('📚 Creating skill offers...');
    let offersCount = 0;
    for (const user of createdUsers) {
      for (const skillName of user.canTeach) {
        const skillId = skillMap.get(skillName);
        if (skillId) {
          await prisma.offer.upsert({
            where: {
              userId_skillId: {
                userId: user.id,
                skillId: skillId,
              },
            },
            update: {},
            create: {
              userId: user.id,
              skillId: skillId,
            },
          });
          offersCount++;
        }
      }
    }
    
    console.log(`✅ Created ${offersCount} skill offers`);
    
    // Create requests (skills users want to learn)
    console.log('🎯 Creating skill requests...');
    let requestsCount = 0;
    for (const user of createdUsers) {
      for (const skillName of user.wantsLearn) {
        const skillId = skillMap.get(skillName);
        if (skillId) {
          await prisma.request.upsert({
            where: {
              userId_skillId: {
                userId: user.id,
                skillId: skillId,
              },
            },
            update: {},
            create: {
              userId: user.id,
              skillId: skillId,
            },
          });
          requestsCount++;
        }
      }
    }
    
    console.log(`✅ Created ${requestsCount} skill requests`);
    
    // Create exchange requests between matching users
    console.log('🔄 Creating exchange requests...');
    let exchangeCount = 0;
    
    const exchangeMessages = [
      "Hi! I'd love to exchange skills with you. Your expertise would be really valuable to me!",
      "Hey! I noticed we have complementary skills. Would you be interested in a skill swap?",
      "Hello! I'm excited about the possibility of learning from you while sharing what I know.",
      "Hi there! I think we could help each other grow. Let's exchange skills!",
      "Hey! Your skills align perfectly with what I'm looking to learn. Interested in an exchange?",
      "Hi! I've been wanting to learn this for a while. Would you be up for a skill swap?",
      "Hello! I think this could be mutually beneficial. Let's connect!",
      "Hey! I'd love to teach you what I know in exchange for learning from you.",
      "Hi! Your profile caught my eye. I think we'd be great skill exchange partners!",
      "Hello! Let's help each other level up our skills. What do you say?",
    ];
    
    // Create various exchange requests with different statuses
    for (let i = 0; i < createdUsers.length && exchangeCount < 60; i++) {
      const sender = createdUsers[i];
      
      // Find 1-3 potential matches for this user
      const potentialMatches = createdUsers.filter(u => {
        if (u.id === sender.id) return false;
        
        // Check if sender can teach something receiver wants to learn
        const canTeachForReceiver = sender.canTeach.some(skill => 
          u.wantsLearn.includes(skill)
        );
        
        // Check if receiver can teach something sender wants to learn
        const canTeachForSender = u.canTeach.some(skill => 
          sender.wantsLearn.includes(skill)
        );
        
        return canTeachForReceiver && canTeachForSender;
      });
      
      // Create 1-2 exchange requests for this user
      const numExchanges = Math.min(2, potentialMatches.length);
      for (let j = 0; j < numExchanges && exchangeCount < 60; j++) {
        const receiver = potentialMatches[j];
        
        // Find matching skills
        const senderSkillName = sender.canTeach.find(skill => 
          receiver.wantsLearn.includes(skill)
        );
        const receiverSkillName = receiver.canTeach.find(skill => 
          sender.wantsLearn.includes(skill)
        );
        
        if (senderSkillName && receiverSkillName) {
          const senderSkillId = skillMap.get(senderSkillName);
          const receiverSkillId = skillMap.get(receiverSkillName);
          
          if (senderSkillId && receiverSkillId) {
            // Determine status (60% pending, 25% accepted, 15% declined)
            const rand = Math.random();
            let status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
            if (rand < 0.60) status = 'PENDING';
            else if (rand < 0.85) status = 'ACCEPTED';
            else status = 'DECLINED';
            
            try {
              await prisma.exchangeRequest.create({
                data: {
                  senderId: sender.id,
                  receiverId: receiver.id,
                  senderSkillId,
                  receiverSkillId,
                  status,
                  message: exchangeMessages[Math.floor(Math.random() * exchangeMessages.length)],
                },
              });
              exchangeCount++;
            } catch (error) {
              // Skip if duplicate
              continue;
            }
          }
        }
      }
    }
    
    console.log(`✅ Created ${exchangeCount} exchange requests`);
    
    // Print summary
    console.log('\n📊 Summary:');
    console.log(`  Users: ${createdUsers.length}`);
    console.log(`  Skill Offers: ${offersCount}`);
    console.log(`  Skill Requests: ${requestsCount}`);
    console.log(`  Exchange Requests: ${exchangeCount}`);
    
    const statusCounts = await prisma.exchangeRequest.groupBy({
      by: ['status'],
      _count: true,
    });
    
    console.log('\n  Exchange Requests by Status:');
    statusCounts.forEach((stat) => {
      console.log(`    ${stat.status}: ${stat._count}`);
    });
    
    console.log('\n✨ Seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding exchange data:', error);
    throw error;
  }
}

seedExchangeData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
