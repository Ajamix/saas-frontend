const fs = require('fs').promises;
const path = require('path');

const templatesDir = path.join(process.cwd(), 'public/templates');

async function saveHomeTemplate() {
  const templateData = {
    title: "Welcome to Our Amazing Service",
    description: "Your journey to success starts here.",
    blocks: [
      {
        id: "1",
        type: "hero",
        content: {
          title: "Welcome to Our Amazing Service",
          subtitle: "Your journey to success starts here.",
          ctaText: "Get Started",
          ctaLink: "/auth/register",
          backgroundImage: "url('/images/hero-bg.jpg')",
          color: "#4F46E5"
        }
      },
      {
        id: "2",
        type: "features",
        content: {
          title: "Why Choose Us?",
          features: [
            { title: "Unlimited Access", description: "Enjoy unlimited access to all features.", icon: "star" },
            { title: "24/7 Support", description: "We're here to help you anytime.", icon: "support" },
            { title: "Easy Integration", description: "Integrate seamlessly with your existing tools.", icon: "plug" }
          ],
          color: "#3B82F6"
        }
      },
      {
        id: "3",
        type: "pricing",
        content: {
          title: "Choose Your Plan",
          plans: [
            { name: "Basic", price: "$10/month", description: "Perfect for individuals." },
            { name: "Pro", price: "$30/month", description: "Ideal for small teams." },
            { name: "Enterprise", price: "$100/month", description: "Best for large organizations." }
          ],
          color: "#10B981"
        }
      },
      {
        id: "4",
        type: "cta",
        content: {
          title: "Ready to Get Started?",
          description: "Join thousands of satisfied customers.",
          buttonText: "Sign Up Now",
          buttonLink: "/auth/register",
          color: "#FBBF24"
        }
      }
    ]
  };

  const filePath = path.join(templatesDir, 'Home 1.json');
  await fs.writeFile(filePath, JSON.stringify(templateData, null, 2));
  console.log('Template Home 1 saved successfully!');
}

saveHomeTemplate().catch(console.error); 