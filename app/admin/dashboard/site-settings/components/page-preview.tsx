"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getSubscriptionPlansForTenant, type SubscriptionPlan } from "@/app/api/subscription-plans";

interface Block {
  id: string;
  type: 'hero' | 'features' | 'pricing' | 'cta' | 'custom';
  content: any;
}

interface PageData {
  title: string;
  description: string;
  blocks: Block[];
}

interface PagePreviewProps {
  data: PageData;
}

export function PagePreview({ data }: PagePreviewProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await getSubscriptionPlansForTenant();
        setPlans(response.filter(plan => plan.isActive));
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      }
    };

    fetchPlans();
  }, []);

  const renderBlock = (block: Block) => {
    switch (block.type) {
      case 'hero':
        return (
          <section
            className="relative py-24 px-8 bg-cover bg-center text-white"
            style={{
              backgroundImage: block.content.backgroundImage
                ? `url(${block.content.backgroundImage})`
                : 'linear-gradient(to right, #4F46E5, #7C3AED)'
            }}
          >
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 max-w-5xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6" contentEditable>{block.content.title}</h1>
              <p className="text-xl mb-8" contentEditable>{block.content.subtitle}</p>
              <Button size="lg" asChild>
                <a href={block.content.ctaLink}>{block.content.ctaText}</a>
              </Button>
            </div>
          </section>
        );

      case 'features':
        return (
          <section className="py-24 px-8 bg-white">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12" contentEditable>{block.content.title}</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {block.content.features.map((feature: any, index: number) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      {/* You can add proper icon rendering here */}
                      <span className="text-primary">{feature.icon}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2" contentEditable>{feature.title}</h3>
                    <p className="text-muted-foreground" contentEditable>{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'pricing':
        return (
          <section className="py-24 px-8 bg-gray-50">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-4" contentEditable>{block.content.title}</h2>
              <p className="text-center text-muted-foreground mb-12" contentEditable>{block.content.subtitle}</p>
              {block.content.showPlans && (
                <div className="grid md:grid-cols-3 gap-8">
                  {plans.map((plan) => (
                    <div key={plan.id} className="bg-white rounded-lg shadow-lg p-8">
                      <h3 className="text-xl font-bold mb-2" contentEditable>{plan.name}</h3>
                      <p className="text-muted-foreground mb-4" contentEditable>{plan.description}</p>
                      <div className="text-3xl font-bold mb-6">
                        ${plan.price}/{plan.interval}
                      </div>
                      <ul className="space-y-2 mb-8">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <span className="text-green-500 mr-2">✓</span>
                            <span contentEditable>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full" asChild>
                        <a href="/auth/register">Get Started</a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case 'cta':
        return (
          <section className="py-24 px-8 bg-primary text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4" contentEditable>{block.content.title}</h2>
              <p className="text-xl mb-8" contentEditable>{block.content.description}</p>
              <Button size="lg" variant="secondary" asChild>
                <a href={block.content.buttonLink}>{block.content.buttonText}</a>
              </Button>
            </div>
          </section>
        );

      case 'custom':
        return (
          <div dangerouslySetInnerHTML={{ __html: block.content.html }} />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {data.blocks.map((block) => (
        <div key={block.id}>{renderBlock(block)}</div>
      ))}
    </div>
  );
} 