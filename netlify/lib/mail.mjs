/**
 * Confirmation mail for IAAPA 2026 slot bookings.
 *
 * Called from netlify/functions/book.mjs right after the slot is stored.
 * Sends the visitor a branded confirmation with a .ics calendar file attached.
 *
 * Environment variables (Project configuration > Environment variables):
 *   SMTP_USER  the Google Workspace address that sends, e.g. info@conceptfactory.be
 *   SMTP_PASS  a Google app password (16 characters, no spaces)
 *   MAIL_FROM  optional, e.g. "Concept Factory <info@conceptfactory.be>"
 *   MAIL_BCC   optional, gets a blind copy of every confirmation
 *
 * Without SMTP_USER / SMTP_PASS the function does nothing and says so in the
 * logs — a booking is never blocked by a mail problem.
 */

import nodemailer from 'nodemailer';
import { LOGO_WHITE_BASE64 } from './logo.mjs';

const EVENT = {
  title: 'Concept Factory @ IAAPA Expo Europe 2026',
  venue: 'ExCeL London',
  booth: 'Booth S3937',
  city: 'London, United Kingdom',
  timeZone: 'Europe/London',
  slotMinutes: 30,
  contactName: 'Rob Van Riet',
  contactEmail: 'info@conceptfactory.be',
  address: 'Concept Factory BV · Grensstraat 3, 2200 Herentals, Belgium',
  tagline: 'We design it. We build it. We make it last.',
  pageUrl: 'https://conceptfactory.be/iaapa2026',
};

const C = {
  bg: '#0d0e12',
  panel: '#16181f',
  line: '#2a2c34',
  ink: '#e8e8ea',
  muted: '#9a9a9e',
  magenta: '#e6007e',
};

/**
 * @param {{slot:string, when:string, name:string, company?:string,
 *          email:string, phone?:string, message?:string}} booking
 */
export async function sendBookingConfirmation(booking) {
  const user = Netlify.env.get('SMTP_USER');
  const pass = Netlify.env.get('SMTP_PASS');
  if (!user || !pass) {
    console.warn('SMTP_USER / SMTP_PASS not set — confirmation mail skipped');
    return { sent: false, reason: 'no-credentials' };
  }

  const times = slotTimes(booking.slot);

  const attachments = [{
    filename: 'concept-factory.png',
    content: LOGO_WHITE_BASE64,
    encoding: 'base64',
    cid: 'cflogo',
    contentDisposition: 'inline',
  }];

  if (times) {
    attachments.push({
      filename: 'concept-factory-iaapa-2026.ics',
      content: buildIcs(times, booking),
      contentType: 'text/calendar; charset=utf-8; method=PUBLISH',
    });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: Netlify.env.get('MAIL_FROM') || `Concept Factory <${user}>`,
    to: booking.email,
    bcc: Netlify.env.get('MAIL_BCC') || undefined,
    replyTo: EVENT.contactEmail,
    subject: 'Your slot is confirmed — Concept Factory at IAAPA Expo Europe',
    text: textBody(booking, times),
    html: htmlBody(booking, times),
    attachments,
  });

  return { sent: true };
}

// --------------------------------------------------------------------------
// Slot key ("2026-09-22_1030") -> real UTC instants
// --------------------------------------------------------------------------

function slotTimes(slot) {
  const m = /^(\d{4})-(\d{2})-(\d{2})_(\d{2})(\d{2})$/.exec(String(slot || ''));
  if (!m) return null;
  const [, y, mo, d, h, mi] = m.map(Number);
  const naive = Date.UTC(y, mo - 1, d, h, mi);
  const start = new Date(naive - zoneOffsetMinutes(new Date(naive)) * 60000);
  return { start, end: new Date(start.getTime() + EVENT.slotMinutes * 60000) };
}

/** Minutes that EVENT.timeZone is ahead of UTC at the given instant. */
function zoneOffsetMinutes(date) {
  const name = new Intl.DateTimeFormat('en-GB', {
    timeZone: EVENT.timeZone, timeZoneName: 'longOffset',
  }).formatToParts(date).find((p) => p.type === 'timeZoneName')?.value || 'GMT+00:00';
  const m = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
  return m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0;
}

function slotLabel(times, fallback) {
  if (!times) return fallback || '';
  const day = times.start.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: EVENT.timeZone,
  });
  const clock = (x) => x.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: EVENT.timeZone,
  });
  return `${day} · ${clock(times.start)}–${clock(times.end)} (London time)`;
}

// --------------------------------------------------------------------------
// Calendar attachment
// --------------------------------------------------------------------------

function buildIcs(times, booking) {
  const stamp = (x) => x.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const uid = `iaapa2026-${booking.slot}@conceptfactory.be`;
  const description = [
    'Meeting with Concept Factory at IAAPA Expo Europe 2026.',
    booking.name ? `Booked by: ${booking.name}${booking.company ? ` (${booking.company})` : ''}` : '',
    `Questions or a change of plan? ${EVENT.contactEmail}`,
  ].filter(Boolean).join('\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Concept Factory//IAAPA 2026//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(times.start)}`,
    `DTEND:${stamp(times.end)}`,
    `SUMMARY:${ics(EVENT.title)}`,
    `LOCATION:${ics(`${EVENT.venue}, ${EVENT.booth}, ${EVENT.city}`)}`,
    `DESCRIPTION:${ics(description)}`,
    `ORGANIZER;CN=${ics(EVENT.contactName)}:mailto:${EVENT.contactEmail}`,
    `URL:${EVENT.pageUrl}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Concept Factory meeting in 30 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].map(fold).join('\r\n') + '\r\n';
}

const ics = (s) => String(s).replace(/([,;\\])/g, '\\$1').replace(/\r?\n/g, '\\n');

/** RFC 5545 caps lines at 75 octets; continuation lines start with a space. */
function fold(line) {
  if (line.length <= 73) return line;
  const out = [line.slice(0, 73)];
  for (let i = 73; i < line.length; i += 72) out.push(' ' + line.slice(i, i + 72));
  return out.join('\r\n');
}

// --------------------------------------------------------------------------
// Mail bodies
// --------------------------------------------------------------------------

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function textBody(booking, times) {
  return [
    `Hi${booking.name ? ' ' + booking.name.split(' ')[0] : ''},`,
    '',
    'Thank you — your slot is confirmed. We look forward to seeing you.',
    '',
    `When:  ${slotLabel(times, booking.when)}`,
    `Where: ${EVENT.venue}, ${EVENT.booth}`,
    `       ${EVENT.city}`,
    '',
    times ? 'A calendar file is attached — open it to drop the meeting into your agenda.' : null,
    times ? '' : null,
    'Anything you would like us to prepare, or plans changed? Just reply to this mail.',
    '',
    'See you in London,',
    EVENT.contactName,
    'Concept Factory',
    '',
    EVENT.tagline,
    EVENT.address,
  ].filter((l) => l !== null).join('\n');
}

function htmlBody(booking, times) {
  const head = "font-family:'Helvetica Neue',Helvetica,Arial,sans-serif";
  const label = slotLabel(times, booking.when);
  const first = booking.name ? esc(booking.name.split(' ')[0]) : '';

  const row = (k, v) => `
              <tr>
                <td style="padding:16px 0 16px 0;border-bottom:1px solid ${C.line};${head};font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:${C.muted};width:96px;vertical-align:top;">${k}</td>
                <td style="padding:16px 0 16px 0;border-bottom:1px solid ${C.line};${head};font-size:16px;line-height:1.5;color:${C.ink};">${v}</td>
              </tr>`;

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><title>Your slot is confirmed</title></head>
<body style="margin:0;padding:0;background:${C.bg};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Confirmed — ${esc(label)} · ${EVENT.booth}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.bg}" style="background:${C.bg};">
    <tr><td align="center" style="padding:32px 16px;">

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:${C.panel};border:1px solid ${C.line};">

        <tr><td style="padding:28px 36px;border-bottom:1px solid ${C.line};">
          <img src="cid:cflogo" alt="Concept Factory" width="132" style="display:block;border:0;width:132px;height:auto;">
        </td></tr>

        <tr><td style="padding:38px 36px 0 36px;">
          <div style="${head};font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:${C.magenta};">Our IAAPA debut · ExCeL London</div>
          <h1 style="margin:16px 0 0 0;${head};font-size:34px;line-height:1.05;font-weight:700;text-transform:uppercase;letter-spacing:-.01em;color:#ffffff;">Your slot is<br>confirmed</h1>
          <p style="margin:18px 0 0 0;${head};font-size:16px;line-height:1.6;color:${C.muted};">
            ${first ? `Hi ${first} — thank you.` : 'Thank you.'} We've kept one warm for you at ${EVENT.booth}, and we look forward to seeing you.
          </p>
        </td></tr>

        <tr><td style="padding:28px 36px 0 36px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${C.line};">
            ${row('When', `<span style="color:#ffffff;">${esc(label)}</span>`)}
            ${row('Where', `${EVENT.venue}, <span style="color:${C.magenta};font-weight:600;">${EVENT.booth}</span><br><span style="font-size:14px;color:${C.muted};">${EVENT.city}</span>`)}
            ${booking.company ? row('Company', esc(booking.company)) : ''}
            ${booking.message ? row('Your note', `<span style="color:${C.muted};font-size:15px;">${esc(booking.message)}</span>`) : ''}
          </table>
        </td></tr>

        ${times ? `
        <tr><td style="padding:26px 36px 0 36px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.bg}" style="background:${C.bg};border-left:3px solid ${C.magenta};">
            <tr><td style="padding:15px 18px;${head};font-size:14px;line-height:1.5;color:${C.muted};">
              A calendar file is attached to this mail — open it to drop the meeting straight into your agenda.
            </td></tr>
          </table>
        </td></tr>` : ''}

        <tr><td style="padding:28px 36px 34px 36px;">
          <p style="margin:0;${head};font-size:15px;line-height:1.6;color:${C.muted};">
            Anything you'd like us to prepare, or plans changed? Just reply to this mail.
          </p>
          <p style="margin:22px 0 0 0;${head};font-size:15px;line-height:1.6;color:${C.ink};">
            See you in London,<br>
            <span style="color:#ffffff;font-weight:600;">${EVENT.contactName}</span><br>
            <span style="color:${C.muted};">Concept Factory</span>
          </p>
        </td></tr>

        <tr><td style="padding:22px 36px;border-top:1px solid ${C.line};">
          <div style="${head};font-size:13px;font-style:italic;color:${C.ink};">${EVENT.tagline}</div>
          <div style="margin-top:8px;${head};font-size:12px;line-height:1.6;color:${C.muted};">
            ${EVENT.address}<br>
            <a href="https://conceptfactory.be" style="color:${C.muted};">conceptfactory.be</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
