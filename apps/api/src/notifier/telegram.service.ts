import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Telegram Bot API client — shared notifier used by:
 *   - AI assistant (contact-request intent)
 *   - Contact form (shifaul.dev/contact)
 *   - Visitor-arrival pings (analytics)
 *
 * Setup:
 *   1. Open Telegram, search @BotFather
 *   2. /newbot → follow prompts → copy bot token
 *   3. Open a chat with your bot, send any message
 *   4. GET https://api.telegram.org/bot<TOKEN>/getUpdates → find your chat.id
 *      (or use @userinfobot / @RawDataBot)
 *   5. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env
 *
 * Disable: leave TELEGRAM_BOT_TOKEN blank. Saves persist, sends are skipped.
 */
@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private botToken: string | null;
  private chatId: string | null;
  private apiBase: string;

  constructor(private readonly config: ConfigService) {
    this.botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN') || null;
    this.chatId = this.config.get<string>('TELEGRAM_CHAT_ID') || null;
    this.apiBase = this.botToken
      ? `https://api.telegram.org/bot${this.botToken}`
      : '';

    if (this.botToken && this.chatId && /^\d+$/.test(this.chatId)) {
      this.logger.log(
        `Telegram notifier initialised (chat_id=${this.chatId.slice(0, 6)}…)`,
      );
    } else if (this.botToken && (!this.chatId || this.chatId === 'REPLACE_ME_AFTER_FIRST_MESSAGE')) {
      this.logger.warn(
        'TELEGRAM_CHAT_ID is not set — send any message to your bot, then GET https://api.telegram.org/bot<TOKEN>/getUpdates to find chat.id and paste it in .env.',
      );
    } else {
      this.logger.warn(
        'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — notifications will be saved but not delivered.',
      );
    }
  }

  isConfigured(): boolean {
    return Boolean(
      this.botToken && this.chatId && /^\d+$/.test(this.chatId),
    );
  }

  /**
   * Send a plain-text message. Returns true on success.
   * On failure returns false (does not throw) — caller persists status.
   */
  async sendText(text: string): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }
    try {
      const res = await fetch(`${this.apiBase}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        this.logger.error(
          `Telegram sendMessage failed (${res.status}): ${body.slice(0, 300)}`,
        );
        return false;
      }
      this.logger.log('Telegram message sent');
      return true;
    } catch (err) {
      this.logger.error(
        `Telegram sendMessage error: ${err instanceof Error ? err.message : String(err)}`,
      );
      return false;
    }
  }

  /**
   * Notification: AI assistant detected contact intent in chat.
   */
  async sendContactRequest(input: {
    intent: string;
    message: string;
    visitorName?: string | null;
    visitorContact?: string | null;
    sessionKey?: string | null;
    context?: Array<{ role: string; content: string }>;
  }): Promise<boolean> {
    const lines: string[] = [];
    lines.push(`🔔 <b>New contact request</b> <i>(from chat)</i>`);
    lines.push(`<b>Intent:</b> ${escape(input.intent)}`);
    if (input.visitorName) lines.push(`<b>From:</b> ${escape(input.visitorName)}`);
    if (input.visitorContact) lines.push(`<b>Contact:</b> ${escape(input.visitorContact)}`);
    lines.push('');
    lines.push('<b>Message:</b>');
    lines.push(escape(input.message));
    if (input.context && input.context.length > 0) {
      lines.push('');
      lines.push('<b>Recent conversation:</b>');
      for (const turn of input.context.slice(-6)) {
        const who = turn.role === 'user' ? '👤 Visitor' : '🤖 PA';
        const text = turn.content.slice(0, 300);
        lines.push(`${who}: ${escape(text)}`);
      }
    }
    lines.push('');
    lines.push(
      `<i>Session: ${escape((input.sessionKey || 'unknown').slice(0, 32))} · ${new Date().toISOString()}</i>`,
    );
    return this.sendText(lines.join('\n'));
  }

  /**
   * Notification: contact form submission at /contact.
   */
  async sendContactForm(input: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<boolean> {
    const lines: string[] = [];
    lines.push(`📨 <b>New contact form submission</b>`);
    lines.push(`<b>From:</b> ${escape(input.name)}`);
    lines.push(`<b>Email:</b> ${escape(input.email)}`);
    lines.push(`<b>Subject:</b> ${escape(input.subject)}`);
    lines.push('');
    lines.push('<b>Message:</b>');
    lines.push(escape(input.message));
    lines.push('');
    lines.push(`<i>${new Date().toISOString()}</i>`);
    return this.sendText(lines.join('\n'));
  }

  /**
   * Notification: a new visitor landed on the site.
   * Only fires once per visitor (caller should dedupe by IP/session in DB).
   */
  async sendVisitorVisit(input: {
    path: string;
    referrer?: string | null;
    userAgent?: string | null;
    country?: string | null;
    city?: string | null;
    isReturning?: boolean;
  }): Promise<boolean> {
    const lines: string[] = [];
    lines.push(
      input.isReturning ? '🔁 <b>Returning visitor</b>' : '🆕 <b>New visitor</b>',
    );
    lines.push(`<b>Path:</b> ${escape(input.path)}`);
    if (input.referrer) lines.push(`<b>Referrer:</b> ${escape(input.referrer)}`);
    if (input.country || input.city) {
      lines.push(`<b>Location:</b> ${escape([input.city, input.country].filter(Boolean).join(', '))}`);
    }
    if (input.userAgent) {
      // Shorten UA for readability
      const short = input.userAgent.length > 200
        ? input.userAgent.slice(0, 200) + '…'
        : input.userAgent;
      lines.push(`<b>UA:</b> <code>${escape(short)}</code>`);
    }
    lines.push('');
    lines.push(`<i>${new Date().toISOString()}</i>`);
    return this.sendText(lines.join('\n'));
  }
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
