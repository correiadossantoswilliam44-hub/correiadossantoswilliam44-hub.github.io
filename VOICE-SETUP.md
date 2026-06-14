# Nova Voice Guide — upgrading to the cinematic voice

The site's AI guide works **right now** using the browser's built-in voice
(free, slightly robotic — on-brand for an AI receptionist). To get the deep,
eerie, Blade-Runner-grade voice, generate 8 short MP3s once and drop them in
a `/voice/` folder. The site detects them automatically — no code changes.

**Cost: $0.** ElevenLabs' free tier (~10k characters/month) covers this
entire script about five times over. It's a one-time generation.

## Step 1 — Generate the lines (~10 min)

1. Go to **https://elevenlabs.io** → sign up free → **Text to Speech**.
2. Pick a **confident female** voice — **Charlotte**, **Jessica**, **Matilda**,
   or **Rachel** all read confident and warm. (This is the brand voice.)
3. Settings: **Stability ~40%**, **Similarity ~85%**, **Style ~20%**.
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

And 4 more so the guide speaks on the About, Get-Started, and call-log pages too:

| File | Line |
|---|---|
| `about-greeting.mp3` | I'm Nova — and William built me to make sure your business never misses another call. Scroll, and meet the human behind me. |
| `about-cta.mp3` | Ready when you are. Book a free call — and let's light your business up. |
| `gs-greeting.mp3` | Smart move. Tell me about your business below, and your free preview lands within forty-eight hours. I'll take it from here. |
| `d2-greeting.mp3` | This is every call I caught while the owner was busy. Each one's a customer that didn't slip away. Imagine this, for your shop. |

(17 files total. The guide + hologram now live in one shared file, `nova-guide.js`, loaded on every page — so a visitor who turns the guide on keeps it, and the head, as they move from page to page.)

---

## Optional — make the hologram's MOUTH actually move (talking-head video)

The still image can't truly lip-sync — a flat picture has no mouth rig. To get
the face **moving its mouth/eyes/head while it speaks**, generate a short
**talking-head video** of the face and drop it in as **`holo-face.mp4`** (or
`.webm`) in the repo root. The hologram auto-detects it, plays it **while the
voice is speaking**, and freezes on a still frame when idle — so it looks like
it's actually talking.

How to make one (pick any):
- **D-ID** (d-id.com) or **HeyGen** (heygen.com) — upload the face image +
  your ElevenLabs audio → it renders a lip-synced talking video. Best result.
- **SadTalker** (free, open-source) — same idea, runs locally/Colab.
- Keep it a tight crop of the face, dark background, a few seconds, looping.

No video = the still image still works (now cleaned up: dark backing so it
isn't washed out, calmer shimmer, breathing + head sway, audio-reactive glow).

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
