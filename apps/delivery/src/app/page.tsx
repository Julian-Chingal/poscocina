import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Clock, MapPin, Phone, Sparkles, ChefHat } from 'lucide-react';

export default function DeliveryHomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'poscocina Restaurant',
    image: 'http://localhost:3001/pwa-512x512.png',
    servesCuisine: 'Gastronomía Artesanal / Internacional',
    priceRange: '$$',
    hasMenu: 'http://localhost:3001#menu',
    potentialAction: {
      '@type': 'OrderAction',
      target: 'http://localhost:3001',
    },
  };

  const sampleCategories = [
    { id: '1', name: 'Platos Fuertes', count: 12, icon: '🍔' },
    { id: '2', name: 'Entradas & Tapas', count: 6, icon: '🥟' },
    { id: '3', name: 'Bebidas de Autor', count: 8, icon: '🍹' },
    { id: '4', name: 'Postres Artesanales', count: 5, icon: '🍰' },
  ];

  const featuredDishes = [
    {
      id: 'hamburguesa-artesanal',
      name: 'Hamburguesa Doble Smash Black Angus',
      description: 'Doble medallón 100g smash, queso cheddar madurado, tocineta crujiente y salsa especial de la casa en pan brioche.',
      price: '$ 34.900',
      tag: 'Más Pedido',
      time: '25-35 min',
    },
    {
      id: 'pizza-cuatro-quesos',
      name: 'Pizza Napolitana Cuatro Quesos & Miel',
      description: 'Masa fermentada 48h en horno de leña, mozzarella fior di latte, gorgonzola, provolone y un toque de miel de trufa.',
      price: '$ 42.000',
      tag: 'Recomendado',
      time: '20-30 min',
    },
    {
      id: 'bowl-salmon-teriyaki',
      name: 'Bowl Nórdico Salmón Teriyaki',
      description: 'Salmón glaseado al teriyaki, arroz shari, aguacate hass, edamames, pepino europeo y ajonjolí tostado.',
      price: '$ 39.500',
      tag: 'Saludable',
      time: '15-25 min',
    },
  ];

  return (
    <>
      {/* Schema.org para Google Search e indexación de Restaurante y Menú */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header / Barra de Navegación */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white font-bold shadow-lg shadow-orange-600/30">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white sm:text-xl">
                pos<span className="text-orange-500">cocina</span>
              </span>
              <span className="ml-2 rounded-full bg-orange-950/80 px-2 py-0.5 text-[11px] font-semibold text-orange-400 border border-orange-500/30">
                Domicilios
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              aria-label="Ver carrito de compras"
              className="relative flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-600/20 transition hover:bg-orange-500"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Mi Pedido</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-orange-600">
                0
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section con SEO Heading */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
              <Sparkles className="h-3.5 w-3.5" />
              Cocina en vivo & Entrega directa a tu puerta
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Platos de autor preparados al momento para disfrutar en casa
            </h1>
            <p className="mt-3 text-base text-slate-400 sm:text-lg">
              Selecciona tus favoritos de nuestra carta gastronómica. Pedidos despachados directamente desde nuestra cocina central en tiempo récord.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-orange-400" />
                <span>Tiempo de entrega: <strong>25 - 40 min</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-orange-400" />
                <span>Cobertura en toda la ciudad</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="border-b border-slate-800/60 bg-slate-950 py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {sampleCategories.map((cat) => (
              <button
                key={cat.id}
                className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-orange-500/50 hover:bg-slate-800"
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="text-xs text-slate-500">({cat.count})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Catálogo de Platos Destacados */}
      <main id="menu" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Platos Estrella de la Carta
            </h2>
            <p className="text-sm text-slate-400">
              Los favoritos más pedidos por nuestros comensales esta semana.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredDishes.map((dish) => (
            <article
              key={dish.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 transition duration-200 hover:-translate-y-1 hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-950/20"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-orange-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-orange-400 border border-orange-500/20">
                    {dish.tag}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{dish.time}</span>
                  </div>
                </div>

                <h3 className="mt-3 text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
                  {dish.name}
                </h3>
                <p className="mt-2 text-sm text-slate-400 line-clamp-3">
                  {dish.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-800/60 pt-4">
                <span className="text-xl font-extrabold text-white">
                  {dish.price}
                </span>
                <button
                  type="button"
                  className="rounded-xl bg-orange-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-500"
                >
                  Agregar +
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>© 2026 poscocina Domicilios — Sistema integral de pedidos gastronómicos.</p>
      </footer>
    </>
  );
}
