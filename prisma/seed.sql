
INSERT INTO public."Resource" (id, name, category, capacity, description, "isActive", "createdAt", "updatedAt") VALUES (1, 'Room A', 'Meeting Room', 10, NULL, true, '2026-10-13 23:53:43.415+05:30', '2026-10-13 23:52:54.512+05:30');
INSERT INTO public."Resource" (id, name, category, capacity, description, "isActive", "createdAt", "updatedAt") VALUES (2, 'Conference Room B', 'Meeting Room', 6, 'Small room with a whiteboard', true, '2026-10-15 19:06:44.541+05:30', '2026-10-15 19:06:44.541+05:30');
INSERT INTO public."Resource" (id, name, category, capacity, description, "isActive", "createdAt", "updatedAt") VALUES (3, 'Training Lab', 'Lab', 20, 'Computer lab for workshops', true, '2026-10-15 19:06:44.541+05:30', '2026-10-15 19:06:44.541+05:30');
INSERT INTO public."Resource" (id, name, category, capacity, description, "isActive", "createdAt", "updatedAt") VALUES (4, 'Projector Kit', 'Equipment', 1, 'Portable projector', true, '2026-10-15 19:06:44.541+05:30', '2026-10-15 19:06:44.541+05:30');
INSERT INTO public."Resource" (id, name, category, capacity, description, "isActive", "createdAt", "updatedAt") VALUES (5, 'Company Van', 'Vehicle', 7, '7-seater van for site visits', true, '2026-10-15 19:06:44.541+05:30', '2026-10-15 19:16:14.247+05:30');

INSERT INTO public."User" (id, name, email, role, "createdAt") VALUES (1, 'Test User', 'test@example.com', 'MEMBER', '2026-10-13 23:51:44.756+05:30');
INSERT INTO public."User" (id, name, email, role, "createdAt") VALUES (2, 'Admin User', 'admin@example.com', 'ADMIN', '2026-10-15 19:06:44.541+05:30');
INSERT INTO public."User" (id, name, email, role, "createdAt") VALUES (3, 'Nimal Perera', 'nimal@example.com', 'MEMBER', '2026-10-15 19:06:44.541+05:30');
INSERT INTO public."User" (id, name, email, role, "createdAt") VALUES (4, 'Kavindi Silva', 'kavindi@example.com', 'MEMBER', '2026-10-15 19:06:44.541+05:30');

SELECT setval(pg_get_serial_sequence('public."Resource"', 'id'), (SELECT MAX(id) FROM public."Resource"));
SELECT setval(pg_get_serial_sequence('public."User"', 'id'), (SELECT MAX(id) FROM public."User"));