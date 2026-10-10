import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { categoryStyle } from '../utils/catalog';

const HERO_PHOTO =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1100&q=70';

const AISLES = [
  { name: 'Groceries', blurb: 'Rice, atta, dal & the everyday staples' },
  { name: 'Breakfast', blurb: 'Cereal, oats and the morning cuppa' },
  { name: 'Chocolate', blurb: 'Something sweet for later' },
  { name: 'Personal Care', blurb: 'Soap, toothpaste, the bathroom shelf' },
];

const STEPS = [
  {
    title: 'Tell us where home is',
    body: 'Sign up with your address and we’ll line up the shops that actually deliver to your city.',
  },
  {
    title: 'Fill one basket',
    body: 'Mix and match from different shops — rice from one, soap from another. It all lands in one basket.',
  },
  {
    title: 'Pay the way you like',
    body: 'Cash when it arrives, or UPI, cards and netbanking online. Any offers are applied before you pay.',
  },
];

function Scribble() {
  return (
    <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M2 8.5C30 3.5 62 2.8 96 5.2c26 1.8 52 3.6 101-.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Round "shop local" stamp that slowly turns. */
function Stamp() {
  return (
    <div className="relative h-28 w-28" aria-hidden="true">
      <svg viewBox="0 0 120 120" className="absolute inset-0 animate-spin-slow">
        <defs>
          <path id="stamp-circle" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1-88 0" />
        </defs>
        <circle cx="60" cy="60" r="58" fill="#F2B33D" />
        <text fontSize="12" fontWeight="600" fill="#1D2B22">
          <textPath href="#stamp-circle" textLength="272" lengthAdjust="spacing">
            SHOP LOCAL · SHOP LOCAL · SHOP LOCAL ·
          </textPath>
        </text>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-ink">
        <Icon name="heart" size={26} strokeWidth={1.75} />
      </span>
    </div>
  );
}

/** Paper receipt that sits over the hero photo. */
function Receipt() {
  const rows = [
    ['Fortune Rice', '1', '₹500'],
    ['Dairy Milk', '2', '₹200'],
    ['Dettol Soap', '3', '₹135'],
  ];
  return (
    <div className="w-60 rotate-[-4deg] rounded-t-md bg-white px-5 pb-6 pt-5 font-mono text-[11px] text-ink-soft shadow-lift [clip-path:polygon(0_0,100%_0,100%_calc(100%-8px),95%_100%,90%_calc(100%-8px),85%_100%,80%_calc(100%-8px),75%_100%,70%_calc(100%-8px),65%_100%,60%_calc(100%-8px),55%_100%,50%_calc(100%-8px),45%_100%,40%_calc(100%-8px),35%_100%,30%_calc(100%-8px),25%_100%,20%_calc(100%-8px),15%_100%,10%_calc(100%-8px),5%_100%,0_calc(100%-8px))]">
      <p className="text-center font-display text-sm font-semibold not-italic text-ink">retailstore</p>
      <p className="mb-3 text-center text-[10px] uppercase tracking-widest text-ink-muted">Tuesday basket</p>
      <div className="space-y-1.5 border-y border-dashed border-line py-2.5">
        {rows.map(([n, q, p]) => (
          <div key={n} className="flex justify-between gap-2">
            <span className="truncate">
              {q} × {n}
            </span>
            <span>{p}</span>
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex justify-between text-xs font-semibold text-ink">
        <span>TOTAL</span>
        <span>₹835</span>
      </div>
      <p className="mt-2 text-[10px] text-forest-600">Paid: cash on delivery</p>
    </div>
  );
}

function HeroPhoto() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[32px] bg-forest-700 sm:aspect-[5/5] lg:aspect-[4/5]">
      {/* Fallback art (also shows while the photo loads) */}
      <div className="grain absolute inset-0" aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <div className="grid grid-cols-3 gap-4 opacity-90">
          {['wheat', 'apple', 'milk', 'cookie', 'basket', 'carrot', 'coffee', 'droplet', 'soda'].map((n, i) => (
            <span
              key={n}
              className={`flex h-16 w-16 items-center justify-center rounded-2xl sm:h-20 sm:w-20 ${
                i % 3 === 0 ? 'bg-marigold-400 text-ink' : i % 3 === 1 ? 'bg-cream-50 text-forest-700' : 'bg-tomato-500 text-cream-50'
              } ${i % 2 ? 'rotate-3' : '-rotate-3'}`}
            >
              <Icon name={n} size={30} strokeWidth={1.3} />
            </span>
          ))}
        </div>
      </div>
      {!failed && (
        <img
          src={HERO_PHOTO}
          alt="Fresh fruit and vegetables on display at a grocery store"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const shopLink = user ? '/dashboard' : '/register';

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="container-page grid items-center gap-12 pb-16 pt-10 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-24">
          <div className="animate-rise-in">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink-soft">
              <Icon name="leaf" size={14} className="text-forest-600" />
              Groceries &amp; daily essentials
            </p>
            <h1 className="mt-6 font-display text-[44px] font-medium leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-[68px]">
              Your neighbourhood shops,{' '}
              <span className="scribble italic text-forest-600">
                delivered.
                <Scribble />
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
              See what the stores in your city have on their shelves today, fill a single basket, and pay when it
              reaches your door.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to={shopLink} className="btn btn-primary btn-lg">
                {user ? 'Continue shopping' : 'Start shopping'}
                <Icon name="arrow-right" size={18} />
              </Link>
              {!user && (
                <Link to="/login" className="btn btn-outline btn-lg">
                  I have an account
                </Link>
              )}
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-soft">
              {[
                ['cash', 'Cash on delivery'],
                ['shield', 'Secure online payments'],
                ['package', 'Live stock from each shop'],
              ].map(([icon, label]) => (
                <li key={label} className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-100 text-forest-700">
                    <Icon name={icon} size={15} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <HeroPhoto />
            <div className="absolute -bottom-8 -left-4 sm:-left-10">
              <Receipt />
            </div>
            <div className="absolute -right-3 -top-6 sm:-right-8">
              <Stamp />
            </div>
          </div>
        </section>

        {/* Aisles */}
        <section className="border-y border-line bg-cream-50 py-16 sm:py-20">
          <div className="container-page">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">Wander the aisles</p>
                <h2 className="mt-2 font-display text-3xl font-medium text-ink sm:text-4xl">What are you after today?</h2>
              </div>
              <Link to={user ? '/dashboard' : '/register'} className="group flex items-center gap-1.5 text-sm font-semibold text-forest-700">
                See everything
                <Icon name="arrow-right" size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {AISLES.map((a, i) => {
                const s = categoryStyle(a.name);
                return (
                  <Link
                    key={a.name}
                    to={user ? `/dashboard?category=${encodeURIComponent(a.name)}` : '/register'}
                    className="group relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-3xl p-5 transition-transform duration-300 hover:-translate-y-1 sm:min-h-[240px] sm:p-6"
                    style={{ backgroundColor: s.bg, color: s.fg }}
                  >
                    <Icon
                      name={s.icon}
                      size={120}
                      strokeWidth={0.9}
                      className={`absolute -right-5 -top-5 opacity-25 transition-transform duration-500 group-hover:scale-110 ${
                        i % 2 ? 'rotate-12' : '-rotate-12'
                      }`}
                    />
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/70">
                      <Icon name={s.icon} size={22} />
                    </span>
                    <div className="relative">
                      <h3 className="font-display text-2xl font-medium text-ink">{a.name}</h3>
                      <p className="mt-1 text-sm text-ink-soft">{a.blurb}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="container-page scroll-mt-24 py-16 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div>
              <p className="eyebrow">How it works</p>
              <h2 className="mt-2 font-display text-3xl font-medium leading-tight text-ink sm:text-[44px]">
                Like popping down to the shops, minus the queue.
              </h2>
              <p className="mt-5 max-w-md text-ink-soft">
                Every order goes to a real store in your city — the same people you&rsquo;d see behind the counter.
                We just make the walking part optional.
              </p>
            </div>
            <ol className="space-y-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="card flex gap-5 p-6 sm:p-7">
                  <span className="font-display text-5xl font-light italic leading-none text-marigold-500">{i + 1}</span>
                  <div>
                    <h3 className="font-display text-xl font-medium text-ink">{s.title}</h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA band */}
        <section className="container-page pb-20">
          <div className="relative overflow-hidden rounded-[32px] bg-marigold-400 px-7 py-12 sm:px-14 sm:py-16">
            <Icon name="basket" size={260} strokeWidth={0.6} className="absolute -right-10 -top-10 text-marigold-500/50" />
            <div className="relative max-w-xl">
              <h2 className="font-display text-3xl font-medium leading-tight text-ink sm:text-5xl">
                The shelves are stocked. Ready when you are.
              </h2>
              <p className="mt-4 text-ink/75">It takes about a minute to set up an account.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={shopLink} className="btn btn-primary btn-lg">
                  {user ? 'Back to the shops' : 'Create my account'}
                  <Icon name="arrow-right" size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
