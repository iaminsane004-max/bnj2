-- Seed sample products for Bake & Joy
insert into public.products (name, description, price, category, is_available, is_featured, stock_count) values
('Belgian Chocolate Truffle Cake', 'Rich double chocolate sponge cake layered with silky Belgian dark chocolate ganache.', 699.00, 'Cakes', true, true, 10),
('Artisan Sourdough Boule', 'Traditional slow-fermented crusty sourdough bread made with organic flour. Warm and soft inside.', 180.00, 'Breads', true, false, null),
('Classic French Croissant', 'Buttery, flaky, and golden-brown crescent-shaped pastry baked fresh every morning.', 95.00, 'Pastries', true, true, 20),
('Red Velvet Cupcake', 'Decadent cocoa-flavored cupcake topped with a generous swirl of classic cream cheese frosting.', 80.00, 'Pastries', true, false, 15),
('Gourmet Chocolate Chip Cookies', 'Soft-baked giant cookies loaded with premium dark and milk chocolate chunks. Pack of 4.', 150.00, 'Cookies', true, false, null),
('Spiced Gingerbread Cookies', 'Warmly spiced ginger and cinnamon cookies iced with royal frosting details. Pack of 6.', 199.00, 'Seasonal', true, true, 8),
('Eggless Mango Cream Pastry', 'Light sponge cake infused with fresh Alphonso mango pulp and whipped dairy cream.', 110.00, 'Pastries', false, false, 0);
