# Frontend integration — drop-in instructions

## 1. Copy component files

```
components/chat/
├── ChatWidget.tsx     # floating bubble widget
└── types.ts

lib/
└── chat-api.ts        # fetch wrapper for /ai-assistant/chat

app/
└── chat/
    └── page.tsx       # full-page chat at /chat
```

The widget assumes your project already has:
- `lib/utils.ts` exporting `cn` (you do)
- `components/ui/button.tsx` (you do)
- `motion` package (you do — already in `package.json`)
- `react-icons` package (you do)

## 2. Install OpenAI icon (optional)

The widget imports `AiOutlineOpenAI` from `react-icons/si`. If your `react-icons`
submodule is restricted, swap it for any other small icon (e.g. `LuSparkles`,
already imported as well).

## 3. Mount the floating widget in your public layout

In `app/(public)/layout.tsx`, import and render `<ChatWidget />`:

```tsx
import { ChatWidget } from '@/components/chat/ChatWidget';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ChatWidget />
    </>
  );
}
```

(Or add it to your root `app/layout.tsx` if you want it on admin pages too.)

## 4. Add the /chat route

The widget is for casual visitors; the `/chat` page is for the demo
embedded in your portfolio. Drop `app/chat/page.tsx` into your repo to
expose `https://shifaul.dev/chat`. Add a link from your nav and from
the empty-state suggestions.

## 5. Verify

After the backend is running and seeded:

1. Open `https://dev.shifaul.dev/chat`
2. Ask "What experience does Shifaul have with Next.js?"
3. You should see:
   - An answer with specific projects named (PixlyOne, CalQuick, etc.)
   - Source pills showing "RESUME · 87%", "ABOUT · 71%" etc.
   - No hallucinated details

## Customization

Match the visual style to your existing site:

- **Colors**: The widget uses `emerald-500/cyan-500` accents to match your
  terminal aesthetic. If you prefer purple/pink, swap the Tailwind classes.
- **Position**: Currently `bottom-5 right-5`. Move anywhere.
- **Initial message**: Change `SUGGESTIONS` in `ChatWidget.tsx`.
- **Source labels**: Change `SOURCE_LABELS` to map `source` keys to display names.
