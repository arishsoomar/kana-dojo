# Sign-in email

Sign-in sends a code by email (Supabase `signInWithOtp`, see `src/hooks/use-auth.tsx`).
How that email gets sent is all settings in the Supabase dashboard and Resend, not code.

## Where it stands (2026-09-29): working

- Supabase sends through **Resend**, from `noreply@kanadojo.app` (custom SMTP: host
  `smtp.resend.com`, port `465`, username `resend`, password a Resend API key).
- `kanadojo.app` is verified in Resend (DKIM and SPF; DNS on Cloudflare, set up with
  Resend's "Auto configure").
- The **Magic link or OTP** and **Confirm sign up** templates show the code with
  `{{ .Token }}`, and no link: the app asks for a code (`signInWithOtp`, then `verifyOtp`).
  Supabase's default templates send only a link.
- Codes reach anyone now, not just the Supabase team.

## If codes stop arriving

- **Resend → Emails** shows every send and why one failed.
- Supabase → **Logs → Auth** shows each sign-in request.
- Each address can ask for a code about once a minute; the project's email limit is under
  Authentication → Rate Limits.
- A template change can look like it didn't work: Gmail files emails with the same subject
  in one conversation, so check for a new one.

## Background: why codes didn't arrive at first

| Sender | Limit | Who it reaches |
| --- | --- | --- |
| Supabase built-in | about 2 emails an hour, for the whole project | Only members of the Supabase team |
| Resend, no verified domain | Resend's free plan (about 3,000 a month) | Only the Resend account's own email |
| Resend, verified domain | Your choice, under Authentication → Rate Limits | Anyone |

"Error sending confirmation email" meant the address wasn't allowed by the sender.

## Then: finish testing friends

Two accounts (phone and web), then:

1. Both: Dojo tab → friends icon → choose a name.
2. Web: add the phone's friend code. Phone: reopen Friends, accept.
3. Web: reopen Friends; the phone account shows with a belt and streak.
4. Also try: a lesson on one side shows on the other after about 5 seconds; your own code; a
   made-up code; remove, then both add each other (friends straight away); decline and
   cancel.
