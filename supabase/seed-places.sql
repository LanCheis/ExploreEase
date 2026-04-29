-- FR-04 seed: ~25 places in Ho Chi Minh City.
-- Image URLs use Lorem Picsum seeded URLs (https://picsum.photos/seed/<seed>/800/600).
-- Safe to re-run after a clean truncate; not idempotent on its own.

insert into public.places (name, description, category, address, lat, lng, price_level, image_url) values
-- Attractions
('Notre-Dame Cathedral Basilica of Saigon',
 'Late-19th-century French colonial cathedral built with bricks shipped from Marseille. Twin bell towers rise 58 metres over the city centre.',
 'attraction', '01 Cong xa Paris, Ben Nghe, District 1', 10.7798, 106.6991, 1,
 'https://picsum.photos/seed/notre-dame-saigon/800/600'),

('Saigon Central Post Office',
 'Working post office designed in the Gustave Eiffel era. Vaulted ceilings, hand-painted maps, and old wooden phone booths.',
 'attraction', '02 Cong xa Paris, Ben Nghe, District 1', 10.7799, 106.6997, 1,
 'https://picsum.photos/seed/saigon-post-office/800/600'),

('War Remnants Museum',
 'Three floors of photographs, vehicles, and exhibits documenting the Vietnam War from the Vietnamese perspective. Heavy but essential.',
 'attraction', '28 Vo Van Tan, Vo Thi Sau, District 3', 10.7793, 106.6921, 1,
 'https://picsum.photos/seed/war-remnants-museum/800/600'),

('Independence Palace',
 'Former presidential palace where the Vietnam War effectively ended in 1975. Preserved 1960s interiors, helipad, and underground command bunker.',
 'attraction', '135 Nam Ky Khoi Nghia, Ben Thanh, District 1', 10.7770, 106.6951, 2,
 'https://picsum.photos/seed/independence-palace/800/600'),

('Bitexco Financial Tower Skydeck',
 '49th-floor observation deck inside the lotus-shaped Bitexco tower. Best at sunset for a 360-degree view of the city.',
 'attraction', '36 Ho Tung Mau, Ben Nghe, District 1', 10.7716, 106.7042, 3,
 'https://picsum.photos/seed/bitexco-skydeck/800/600'),

('Bui Vien Walking Street',
 'Backpacker district turned pedestrian street at night. Bars, street food carts, and live music spill out across both sides.',
 'attraction', 'Bui Vien, Pham Ngu Lao, District 1', 10.7670, 106.6924, 2,
 'https://picsum.photos/seed/bui-vien-street/800/600'),

('Jade Emperor Pagoda',
 'Atmospheric Taoist temple from 1909 dedicated to the Jade Emperor. Heavy with incense smoke and intricate wood carvings.',
 'attraction', '73 Mai Thi Luu, Da Kao, District 1', 10.7919, 106.6951, 1,
 'https://picsum.photos/seed/jade-emperor-pagoda/800/600'),

('Cho Lon (Chinatown)',
 'Saigon''s sprawling Chinese quarter. Wholesale markets, Cantonese temples, and herbal medicine shops along narrow streets.',
 'attraction', 'District 5, Ho Chi Minh City', 10.7530, 106.6594, 1,
 'https://picsum.photos/seed/cho-lon-chinatown/800/600'),

('Tao Dan Park',
 'Leafy central park where locals do tai chi, walk songbirds in cages, and gather around chess tables in the morning.',
 'attraction', '55C Nguyen Thi Minh Khai, Ben Thanh, District 1', 10.7765, 106.6919, 1,
 'https://picsum.photos/seed/tao-dan-park/800/600'),

-- Cuisines
('Pho Hoa Pasteur',
 'Family-run pho house open since 1968. Beef pho with house quay (fried dough sticks) and a deep, clear broth.',
 'cuisine', '260C Pasteur, Vo Thi Sau, District 3', 10.7869, 106.6906, 2,
 'https://picsum.photos/seed/pho-hoa-pasteur/800/600'),

('Banh Mi Huynh Hoa',
 'The legendary "pink" banh mi shop. Pate-heavy sandwich with five kinds of cold cut and pickled veg, packed daily with queues.',
 'cuisine', '26 Le Thi Rieng, Ben Thanh, District 1', 10.7654, 106.6925, 1,
 'https://picsum.photos/seed/banh-mi-huynh-hoa/800/600'),

('Com Tam Ba Ghien',
 'Saigon-style broken rice with grilled pork chop, shredded pork skin, and steamed egg meatloaf. Lunch crowd worth queuing for.',
 'cuisine', '84 Dang Van Ngu, Phu Nhuan District', 10.8101, 106.6783, 1,
 'https://picsum.photos/seed/com-tam-ba-ghien/800/600'),

('Bun Cha 145 Bui Vien',
 'Hanoi-style bun cha (charcoal-grilled pork patties with rice noodles) inside the backpacker district.',
 'cuisine', '145 Bui Vien, Pham Ngu Lao, District 1', 10.7672, 106.6917, 1,
 'https://picsum.photos/seed/bun-cha-145/800/600'),

('Quan Ut Ut',
 'American-style barbecue and craft beer joint by the river. Pulled pork, ribs, and a long Vietnamese craft list.',
 'cuisine', '168 Vo Van Kiet, Co Giang, District 1', 10.7660, 106.6981, 3,
 'https://picsum.photos/seed/quan-ut-ut-bbq/800/600'),

('Banh Xeo 46A',
 'Sizzling crispy turmeric pancakes stuffed with pork, prawn, and bean sprouts. Wrap in mustard greens with herbs and dip.',
 'cuisine', '46A Dinh Cong Trang, Tan Dinh, District 1', 10.7896, 106.6843, 2,
 'https://picsum.photos/seed/banh-xeo-46a/800/600'),

('Hum Vegetarian Lounge',
 'Modern Vietnamese vegetarian restaurant in a quiet villa. Lotus stem salad, claypot mushrooms, fresh juices.',
 'cuisine', '32 Vo Van Tan, Vo Thi Sau, District 3', 10.7798, 106.6911, 3,
 'https://picsum.photos/seed/hum-vegetarian/800/600'),

('The Coffee House Nguyen Hue',
 'Local chain on the pedestrian street. Reliable Vietnamese drip coffee, ca phe sua da, and air-conditioning.',
 'cuisine', '86-88 Nguyen Hue, Ben Nghe, District 1', 10.7741, 106.7029, 1,
 'https://picsum.photos/seed/coffee-house-nguyen-hue/800/600'),

('Secret Garden Restaurant',
 'Rooftop home-style Vietnamese kitchen tucked above an alley. Clay pot fish, morning glory, family-recipe braises.',
 'cuisine', '158 Pasteur, Ben Nghe, District 1', 10.7782, 106.7016, 2,
 'https://picsum.photos/seed/secret-garden-saigon/800/600'),

-- Activities
('Saigon River Sunset Cruise',
 'Two-hour dinner cruise along the Saigon River. Live music, set Vietnamese menu, skyline views from the deck.',
 'activity', 'Bach Dang Wharf, Ton Duc Thang, District 1', 10.7681, 106.7050, 3,
 'https://picsum.photos/seed/saigon-river-cruise/800/600'),

('Cu Chi Tunnels Day Trip',
 'Half-day trip 70km northwest to the Viet Cong tunnel network. Crawl through preserved sections and learn about wartime life underground.',
 'activity', 'Pickup at District 1 hotels', 10.7898, 106.7000, 2,
 'https://picsum.photos/seed/cu-chi-tunnels/800/600'),

('Vespa Street Food Tour',
 'Evening 4-hour ride on vintage Vespas through alleys most tourists miss. Five food stops and a local guide per pillion.',
 'activity', 'Pickup in District 1', 10.7720, 106.6970, 4,
 'https://picsum.photos/seed/vespa-food-tour/800/600'),

('Mekong Delta Day Tour',
 'Full-day group tour to My Tho and Ben Tre. Sampan ride, coconut candy workshop, lunch in an orchard.',
 'activity', 'Pickup in District 1', 10.7720, 106.6960, 2,
 'https://picsum.photos/seed/mekong-delta-tour/800/600'),

('Saigon Cooking Class',
 'Three-hour hands-on class. Market visit, then cook pho, fresh spring rolls, and banh xeo with a chef.',
 'activity', '74/7 Hai Ba Trung, Ben Nghe, District 1', 10.7800, 106.7000, 3,
 'https://picsum.photos/seed/saigon-cooking-class/800/600'),

('Ben Thanh Market Shopping',
 'Iconic central market. Knockoff goods, Vietnamese coffee, and souvenir stalls by day; food court by night.',
 'activity', 'Le Loi, Ben Thanh, District 1', 10.7724, 106.6985, 2,
 'https://picsum.photos/seed/ben-thanh-market/800/600'),

('Suoi Tien Theme Park',
 'Buddhist-themed amusement park on the city outskirts. Crocodile lake, rollercoasters, and giant statues.',
 'activity', '120 Xa lo Ha Noi, Tan Phu, District 9', 10.8636, 106.8161, 2,
 'https://picsum.photos/seed/suoi-tien-park/800/600');
