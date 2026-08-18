import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faq } from "../landing-content";

export function FaqSection() {
  return (
    <section id="faq" className="py-16 sm:py-20">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-14">
          <h2 className="text-balance text-2xl font-bold sm:mb-3 sm:text-3xl lg:text-4xl">
            Perguntas frequentes
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            Dúvidas comuns sobre o WinERP Gestor
          </p>
        </div>
        <Accordion
          type="single"
          collapsible
          className="space-y-3 rounded-lg sm:space-y-4"
        >
          {faq.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`faq-item-${index + 1}`}
              className="rounded-lg border border-border bg-card px-4 sm:px-6"
            >
              <AccordionTrigger className="py-4 text-left text-sm hover:no-underline sm:py-5 sm:text-base">
                <span className="font-semibold">{item.question}</span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm text-muted-foreground sm:pb-5 sm:text-base">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
