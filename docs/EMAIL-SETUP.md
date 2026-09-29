# Sign-in email: unfinished setup

Sign-in sends a code by email (Supabase `signInWithOtp`, see `src/hooks/use-auth.tsx`).
Supabase has to send that email somehow, and right now it can't reach most people. Nothing
in the app needs to change to fix this: it's all settings in the Supabase dashboard (and
Resend, or a domain).

## Where it stands (2026-09-28)

- Custom SMTP (Resend) was turned **off**; Supabase's built-in email is sending codes.
- `bluehere1223@gmail.com` was invited to the Supabase team so it could get codes, for
  testing friends with two accounts (phone and web).
- Testing Epic Y (friends) with two accounts stopped at the email limit.

## Why codes don't arrive

| Sender | Limit | Who it reaches |
| --- | --- | --- |
| Supabase built-in | about 2 emails an hour, for the whole project | Only members of the Supabase team |
| Resend, no verified domain | Resend's free plan (about 3,000 a month) | Only the Resend account's own email |
| Resend, verified domain | Your choice, under Authentication → Rate Limits | Anyone |
| Gmail (app password) | About 500 a day | Anyone |

The built-in email is only for trying things out, on every plan: paying for Supabase Pro
doesn't lift it. Failed tries still count towards the hourly limit.

Errors seen:

- **"Error sending confirmation email"**: the address isn't allowed (not on the team, or
  not the Resend account's email).
- **Rate limit**: too many codes this hour. Wait an hour, then send one.

## The fix: Resend with a domain (recommended)

Costs a domain, about $10 a year. Resend itself stays free.

1. Buy a domain (Cloudflare, Porkbun or Namecheap).
2. Resend → **Domains → Add domain**, then add the DNS records it shows at the domain
   provider. It verifies in minutes to a few hours.
3. Supabase → **Authentication → Emails → SMTP Settings**, turn on custom SMTP:
   - Host `smtp.resend.com`, port `465`
   - Username `resend`, password: the Resend API key
   - Sender `noreply@<the domain>`, name `Kana Dojo`
4. Supabase → **Authentication → Rate Limits**: raise emails to about 30 an hour.
5. The team invite for `bluehere1223@gmail.com` isn't needed any more.

## Free instead: Gmail

1. Google account (`arishsoomar1@gmail.com`) → Security: turn on 2-Step Verification, then
   create an **App password** named "Supabase".
2. Supabase → **Authentication → Emails → SMTP Settings**, turn on custom SMTP:
   - Host `smtp.gmail.com`, port `587`
   - Username and sender: `arishsoomar1@gmail.com`, password: the app password
   - Sender name `Kana Dojo`

Codes then come from the personal address.

## Just for testing: a code without an email

A small local script can call Supabase's admin `generateLink` (type `magiclink`) to get a
sign-in code without sending anything. It needs the project's secret (service role) key, so
it only ever runs on the computer and never goes in the app. Not written yet.

## Then: finish testing friends

Two accounts (phone and web), then:

1. Both: Dojo tab → friends icon → choose a name.
2. Web: add the phone's friend code. Phone: reopen Friends, accept.
3. Web: reopen Friends; the phone account shows with a belt and streak.
4. Also try: a lesson on one side shows on the other after about 5 seconds; your own code; a
   made-up code; remove, then both add each other (friends straight away); decline and
   cancel.
