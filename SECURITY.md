# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public issue
2. Email the maintainer or use GitHub's private vulnerability reporting
3. Include steps to reproduce the issue and any relevant details

## Known Considerations

- **Supabase anon key**: The `supabase-config.js` file ships with blank credentials. The anon key is designed to be public (protected by Row Level Security), but you should still configure proper RLS policies for production use.
- **Login credentials**: The current login is hardcoded for demo purposes. For production, migrate to Supabase Auth.
- **RLS policies**: The included `schema.sql` sets open RLS policies for demo use. Restrict these before deploying to production.

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest  | ✅        |
