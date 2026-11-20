-- Real Phayihairline photos (shipped in /public/brand) for the seeded products, plus the
-- one price confirmed from their TikTok (three-tone units, 125k). Idempotent; run in the Supabase SQL editor.
-- Update the remaining prices in /admin/products once the owner confirms them.

update public.products set images = '{"/brand/product-silky-straight-18in.jpg","/brand/model-straight-unit.jpg"}' where slug = 'straight-human-hair-wig';
update public.products set images = '{"/brand/product-bouncy-curls.jpg"}'          where slug = 'brazilian-body-wave-wig';
update public.products set images = '{"/brand/product-curly-revamp.jpg"}'          where slug = 'deep-wave-wig';
update public.products set images = '{"/brand/product-volume-curly.jpg"}'          where slug = 'curly-synthetic-wig';
update public.products set images = '{"/brand/wig-bob-curl.jpg"}'                  where slug = 'bob-style-wig';
update public.products set images = '{"/brand/product-honey-highlight-bob.jpg"}'   where slug = 'blonde-highlight-wig';

insert into public.products (slug, name, description, price, category, features, tags, stock, is_featured, images)
values ('luxury-three-tone-unit', 'Luxury Three-Tone Unit',
        'Luxury three-tone straight unit in a rich root, blonde and brown blend. Made to order.',
        125000, 'wigs', '{"Three-tone colour","Silky straight","Made to order"}', '{"three tone","straight","colour"}',
        5, true, '{"/brand/product-three-tone-125k.jpg"}')
on conflict (slug) do update set images = excluded.images, price = excluded.price;
