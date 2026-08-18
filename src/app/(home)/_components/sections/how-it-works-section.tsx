import { howItWorks } from "../landing-content";

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-16 sm:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="text-balance text-2xl font-bold sm:mb-3 sm:text-3xl lg:text-4xl">
            Como funciona
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg lg:text-xl">
            Comece a organizar a gestão em poucos passos
          </p>
        </div>
        <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((item) => (
            <li key={item.step} className="relative">
              <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
                <span aria-hidden="true">{item.step}</span>
                <span className="sr-only">Passo {item.step}</span>
              </div>
              <h3 className="mb-2 text-base font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
