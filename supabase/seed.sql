insert into public.categories (slug, name, description, sort_order) values
  ('wigs', 'Wigs', 'Premium human hair wigs in various styles and lengths', 1),
  ('frontals', 'Frontals', 'High-quality lace frontals for a natural hairline', 2),
  ('tools', 'Wigging Tools', 'Professional tools for wig installation and maintenance', 3)
on conflict do nothing;

insert into public.products (slug, name, description, price, compare_at_price, category, features, tags, stock, rating, review_count, is_featured) values
  ('brazilian-body-wave-wig', 'Brazilian Body Wave Wig', '100% human hair body wave wig with a natural hairline, adding volume and movement.', 45000, 55000, 'wigs', '{"100% human hair","Pre-plucked hairline","Medium density","Lace frontal","18 inches"}', '{"body wave","brazilian","human hair"}', 12, 4.8, 24, true),
  ('straight-human-hair-wig', 'Straight Human Hair Wig', 'Silky straight wig with transparent HD lace, pre-plucked with baby hairs.', 52000, 60000, 'wigs', '{"100% human hair","HD lace","Pre-plucked","High density","20 inches"}', '{"straight","human hair","hd lace"}', 8, 4.9, 32, true),
  ('curly-synthetic-wig', 'Curly Synthetic Wig', 'Affordable curly wig with heat-resistant fibres and plenty of bounce.', 18000, 22000, 'wigs', '{"Heat-resistant fibre","Natural look","Lightweight"}', '{"curly","synthetic"}', 15, 4.3, 14, false),
  ('deep-wave-wig', 'Deep Wave Wig', 'Defined deep wave curls on a breathable lace cap.', 48000, null, 'wigs', '{"100% human hair","Deep wave","Breathable cap"}', '{"deep wave","human hair"}', 7, 4.7, 18, true),
  ('bob-style-wig', 'Bob Style Wig', 'Chic short bob with a natural deep parting.', 35000, 42000, 'wigs', '{"Human hair blend","Pre-plucked","Easy to style"}', '{"bob","short"}', 9, 4.6, 21, false),
  ('blonde-highlight-wig', 'Blonde Highlight Wig', 'Statement honey-blonde highlights over a rich base.', 55000, null, 'wigs', '{"100% human hair","Pre-coloured","HD lace"}', '{"blonde","highlight"}', 5, 4.8, 11, false),
  ('lace-frontal-closure', 'Lace Frontal Closure', '13x4 lace frontal for a seamless, natural hairline.', 28000, 32000, 'frontals', '{"13x4 lace","Bleached knots","Pre-plucked"}', '{"frontal","lace"}', 10, 4.7, 16, true),
  ('360-lace-frontal', '360 Lace Frontal', 'All-around lace for ponytails and updos.', 38000, null, 'frontals', '{"360 coverage","Pre-plucked","Transparent lace"}', '{"360","frontal"}', 6, 4.8, 9, true),
  ('hd-lace-closure', 'HD Lace Closure', 'Ultra-thin HD lace that melts into any skin tone.', 25000, null, 'frontals', '{"HD lace","5x5 closure","Pre-bleached"}', '{"closure","hd lace"}', 11, 4.6, 12, false),
  ('wig-cap', 'Wig Cap', 'Stretchy, breathable cap for a smooth base under any wig.', 1500, null, 'tools', '{"Stretchy","Breathable","Pack of 2"}', '{"cap","essentials"}', 50, 4.5, 40, false),
  ('wig-glue', 'Wig Glue', 'Strong-hold, skin-safe adhesive for lace wigs.', 5000, null, 'tools', '{"Strong hold","Skin-safe","Waterproof"}', '{"glue","adhesive"}', 25, 4.6, 33, true),
  ('lace-tint-spray', 'Lace Tint Spray', 'Tint lace to match your skin tone for an undetectable finish.', 4500, null, 'tools', '{"Even coverage","Quick dry"}', '{"lace tint","spray"}', 18, 4.4, 17, false)
on conflict do nothing;

insert into public.services (slug, name, description, price, duration_minutes, features, sort_order) values
  ('wig-installation', 'Wig Installation', 'Secure, comfortable and natural-looking installation.', 15000, 90, '{"Secure application","Natural hairline blending","Styling after installation","Application tips"}', 1),
  ('wig-customization', 'Wig Customization', 'Plucking, bleaching and cutting to make your wig truly yours.', 25000, 150, '{"Hairline plucking","Knot bleaching","Cut to your face shape"}', 2),
  ('wig-styling', 'Wig Styling', 'Curls, waves, straightening and updos.', 10000, 60, '{"Heat styling","Curls and waves","Finishing products"}', 3),
  ('wig-maintenance', 'Wig Maintenance', 'Deep cleaning, conditioning and restyling.', 12000, 90, '{"Deep cleaning","Conditioning","Detangling","Restyling"}', 4),
  ('frontal-installation', 'Frontal Installation', 'Seamless frontal install with natural blending.', 8000, 60, '{"Lace melting","Hairline blending","Styling"}', 5),
  ('wig-coloring', 'Wig Coloring', 'Professional colouring and highlights.', 20000, 150, '{"Consultation","Colour application","Toning and styling"}', 6)
on conflict do nothing;
