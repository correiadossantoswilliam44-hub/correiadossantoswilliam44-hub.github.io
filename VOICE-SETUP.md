# Nova Voice Guide — upgrading to the cinematic voice

The site's AI guide works **right now** using the browser's built-in voice
(free, slightly robotic — on-brand for an AI receptionist). To get the deep,
eerie, Blade-Runner-grade voice, generate 8 short MP3s once and drop them in
a `/voice/` folder. The site detects them automatically — no code changes.

**Cost: $0.** ElevenLabs' free tier (~10k characters/month) covers this
entire script about five times over. It's a one-time generation.

## Step 1 — Generate the lines (~10 min)

1. Go to **https://elevenlabs.io** → sign up free → **Text to Speech**.
2. Pick a deep, calm voice — **Brian**, **Adam**, or **Charlotte** work well.
3. Settings: **Stability ~35%**, **Similarity ~80%**, **Style ~15%**.
   Keep speed slightly slow if available.
4. ⚠️ Generate the lines **dry — no echo or reverb**. The website adds the
   cavernous Blade-Runner reverb live, in the browser. Baked-in echo would
   double up and turn to mud.
5. Generate each line below and download as MP3 with the **exact filename**:

| File | Line |
|---|---|
| `greeting.mp3` | You've reached Supernova. I'm the receptionist that never sleeps. Scroll — and I'll show you what I catch while you're gone. |
| `phases.mp3` | Five phases. One supernova. Every business is a star, waiting to ignite. |
| `built.mp3` | Built for the trades that build America. Tap any trade, and walk through a live demo. |
| `services.mp3` | A custom website, live in forty-eight hours. And me — answering every call you can't. |
| `work.mp3` | Real work, real clients. The day you sign on, we build yours. |
| `demo-call.mp3` | Want proof? Call me, right now. I answer in one ring. |
| `pricing.mp3` | One flat fee for a site you own forever. I'm one ninety-nine a month — and I never take a day off. |
| `contact.mp3` | Ready to ignite? Tell me about your business — your free preview lands in forty-eight hours. |

And 5 more for the trade demo sites (`demo-site.html` — the "AI tour"):

| File | Line |
|---|---|
| `demo-greeting.mp3` | This whole site? Yours in forty-eight hours — with me on your phones, answering the calls you miss and booking the jobs. That's how you land more clients. Scroll — I'll show you. |
| `demo-services.mp3` | Your services, front and center — so Google finds you, and customers pick you. |
| `demo-why.mp3` | While you're on a job, I'm on the phones. Every missed call becomes a booked one. |
| `demo-reviews.mp3` | Happy customers leave reviews. Reviews bring the next one. The cycle feeds itself. |
| `demo-book.mp3` | Like what you see? One flat fee — live in forty-eight hours. Or call the number, and ask me yourself. |

## Step 2 — Drop them in

Create a folder named `voice` in the repo root and put the 8 MP3s inside:

```
ProjectSuperNova/
  voice/
    greeting.mp3
    phases.mp3
    ...
```

Commit + push. Done — the site probes for `/voice/greeting.mp3` on load and
switches the whole guide to the cinematic files (with live reverb + the
nebula pulsing to the real waveform). If a file is missing it just falls
back to the browser voice for that line.

## How it behaves (already built)

- **Opt-in**: nothing plays until the visitor taps "Let the AI introduce
  itself" (browsers require a gesture for audio anyway — and it keeps the
  guide from fighting blind users' screen readers).
- Each section narrates **once** as it first scrolls into view.
- The mute toggle (bottom-right) remembers the choice; returning visitors
  who had it on get narration re-armed on their first tap, without
  replaying the greeting.
- Tab hidden → voice stops. Reduced-motion users: voice plays but the
  shader pulse stays off.
