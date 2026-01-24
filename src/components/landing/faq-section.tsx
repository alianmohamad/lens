"use client";

import { motion } from "framer-motion";
import { Accordion } from "@/components/ui/accordion";

const faqs = [
    {
        id: "faq-1",
        title: "Do I own the images I generate?",
        content: "Yes, absolutely. You have full commercial ownership of all images you generate on our Pro and Agency plans. You can use them for your website, ads, social media, and marketing materials without any restrictions."
    },
    {
        id: "faq-2",
        title: "How does the quality compare to a real studio?",
        content: "ZeroLens uses advanced light simulation models trained specifically on professional product photography. Most users find our 4K results indistinguishable from traditional studio shots, but at 1/100th of the cost and time."
    },
    {
        id: "faq-3",
        title: "Can I use my own product photos?",
        content: "Yes! Simply upload a photo of your product (even a quick phone shot works). Our AI will automatically remove the background and place it into any scene you choose or describe, blending the lighting and shadows perfectly."
    },
    {
        id: "faq-4",
        title: "What if I'm not happy with the results?",
        content: "We offer a 'Satisfaction Guarantee'. If your first few generations don't meet your expectations, we'll refund your credits or work with you to refine your prompts. Our Pro plan also includes priority support to help you get the perfect shot."
    },
    {
        id: "faq-5",
        title: "Is there a free trial?",
        content: "Yes, you can start with 5 free generation credits to test the platform. No credit card is required to sign up and try it out."
    }
];

export function FaqSection() {
    return (
        <section className="relative py-32">
            <div className="section-container max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-5xl md:text-6xl font-display font-bold mb-4">
                        Common <span className="text-neon-subtle">Questions</span>
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Everything you need to know about ZeroLens.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    <Accordion items={faqs} />
                </motion.div>
            </div>
        </section>
    );
}
