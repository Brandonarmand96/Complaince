import nodemailer, { type Transporter } from 'nodemailer';
export interface MailMessage { to: string; subject: string; text: string }
export interface Mailer { send(message: MailMessage): Promise<void> }
export function createSmtpMailer(config: { host: string; port: number; from: string }): Mailer {
  const transport = nodemailer.createTransport({ host: config.host, port: config.port, secure: false, ignoreTLS: true });
  return { async send(message) { await transport.sendMail({ from: config.from, ...message }); } };
}
export function createCaptureMailer() {
  const messages: MailMessage[] = [];
  const transport: Transporter = nodemailer.createTransport({ jsonTransport: true });
  return { messages, async send(message: MailMessage) { await transport.sendMail({ from: 'capture@complyos.local', ...message }); messages.push(message); } } satisfies Mailer & { messages: MailMessage[] };
}
