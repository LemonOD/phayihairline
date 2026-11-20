# Supabase auth email templates

Copy each file into Supabase Dashboard > Authentication > Emails > Templates, and set the subject below.

| Template (Supabase name) | File | Subject |
|---|---|---|
| Confirm signup | confirm-signup.html | Confirm your email to join Phayihairline |
| Reset password | reset-password.html | Reset your Phayihairline password |
| Magic link | magic-link.html | Your Phayihairline sign-in link |
| Change email address | change-email.html | Confirm your new email address |
| Invite user | invite-user.html | You're invited to Phayihairline |

Keep `{{ .ConfirmationURL }}` in every template; Supabase fills it in. `{{ .Data.full_name }}` is the name entered at signup.
For reliable delivery, also set Authentication > Emails > SMTP Settings (e.g. Resend) so mail comes from your own domain.
