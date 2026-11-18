BEGIN;

CREATE ROLE kstyles_app NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;

CREATE TABLE public.users (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'customer',
  createdat text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS'),
  password_changed_at bigint NOT NULL DEFAULT 0,
  reset_token_hash text,
  reset_token_expires_at bigint
);

CREATE TABLE public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  price double precision NOT NULL,
  image text DEFAULT '',
  category text NOT NULL,
  sizes text DEFAULT 'S,M,L,XL',
  colors text DEFAULT 'Black',
  featured integer NOT NULL DEFAULT 0,
  createdat text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE public.orders (
  id text PRIMARY KEY,
  userid text REFERENCES public.users(id),
  email text NOT NULL,
  firstname text NOT NULL,
  lastname text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  zip text NOT NULL,
  country text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  total double precision NOT NULL,
  createdat text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE public.order_items (
  id text PRIMARY KEY,
  orderid text NOT NULL REFERENCES public.orders(id),
  productid text NOT NULL,
  name text NOT NULL DEFAULT '',
  quantity integer NOT NULL,
  size text NOT NULL,
  color text NOT NULL,
  price double precision NOT NULL,
  image text DEFAULT ''
);

CREATE TABLE public.blog_posts (
  id text PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  image text DEFAULT '',
  author text NOT NULL,
  date text NOT NULL,
  tags text DEFAULT ''
);

CREATE TABLE public.contacts (
  id text PRIMARY KEY,
  firstname text NOT NULL,
  lastname text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  createdat text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE public.subscribers (
  id text PRIMARY KEY,
  email text UNIQUE NOT NULL,
  createdat text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE public.rate_limit_buckets (
  key text PRIMARY KEY,
  timestamps text NOT NULL,
  failures integer NOT NULL DEFAULT 0,
  lockeduntil bigint NOT NULL DEFAULT 0,
  updatedat bigint NOT NULL
);

CREATE TABLE public.admin_audit (
  id text PRIMARY KEY,
  adminid text NOT NULL,
  adminemail text NOT NULL,
  action text NOT NULL,
  target text NOT NULL,
  details text DEFAULT '',
  createdat text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE public.designs (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  price double precision NOT NULL,
  sizeprices text DEFAULT '{}',
  image text DEFAULT '',
  category text DEFAULT '',
  tags text DEFAULT '',
  active integer NOT NULL DEFAULT 1,
  createdat text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE public.design_orders (
  id text PRIMARY KEY,
  designid text NOT NULL,
  designname text NOT NULL,
  size text NOT NULL,
  price double precision NOT NULL,
  quantity integer NOT NULL,
  fabric text DEFAULT '',
  color text DEFAULT '',
  dimensions text DEFAULT '',
  notes text DEFAULT '',
  customername text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  createdat text NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
);

REVOKE ALL ON TABLE
  public.users,
  public.products,
  public.orders,
  public.order_items,
  public.blog_posts,
  public.contacts,
  public.subscribers,
  public.rate_limit_buckets,
  public.admin_audit,
  public.designs,
  public.design_orders
FROM PUBLIC, anon, authenticated;

GRANT USAGE ON SCHEMA public TO kstyles_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.users,
  public.products,
  public.orders,
  public.order_items,
  public.blog_posts,
  public.contacts,
  public.subscribers,
  public.rate_limit_buckets,
  public.admin_audit,
  public.designs,
  public.design_orders
TO kstyles_app;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products FORCE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders FORCE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items FORCE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers FORCE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_buckets FORCE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit FORCE ROW LEVEL SECURITY;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.design_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_orders FORCE ROW LEVEL SECURITY;

CREATE POLICY users_read_self_or_server ON public.users
  FOR SELECT TO kstyles_app
  USING (
    current_setting('app.user_role', true) IN ('auth', 'admin')
    OR id = NULLIF(current_setting('app.user_id', true), '')
  );
CREATE POLICY users_create_from_auth ON public.users
  FOR INSERT TO kstyles_app
  WITH CHECK (current_setting('app.user_role', true) = 'auth');
CREATE POLICY users_update_from_auth ON public.users
  FOR UPDATE TO kstyles_app
  USING (current_setting('app.user_role', true) = 'auth')
  WITH CHECK (current_setting('app.user_role', true) = 'auth');
CREATE POLICY users_delete_admin ON public.users
  FOR DELETE TO kstyles_app
  USING (current_setting('app.user_role', true) = 'admin');

CREATE POLICY products_public_read ON public.products
  FOR SELECT TO kstyles_app USING (true);
CREATE POLICY products_admin_write ON public.products
  FOR ALL TO kstyles_app
  USING (current_setting('app.user_role', true) = 'admin')
  WITH CHECK (current_setting('app.user_role', true) = 'admin');

CREATE POLICY orders_customer_read ON public.orders
  FOR SELECT TO kstyles_app
  USING (
    current_setting('app.user_role', true) = 'admin'
    OR userid = NULLIF(current_setting('app.user_id', true), '')
  );
CREATE POLICY orders_server_create ON public.orders
  FOR INSERT TO kstyles_app
  WITH CHECK (
    current_setting('app.user_role', true) IN ('public', 'customer', 'admin')
    AND (
      userid IS NULL
      OR userid = NULLIF(current_setting('app.user_id', true), '')
    )
  );
CREATE POLICY orders_admin_update ON public.orders
  FOR UPDATE TO kstyles_app
  USING (current_setting('app.user_role', true) = 'admin')
  WITH CHECK (current_setting('app.user_role', true) = 'admin');
CREATE POLICY orders_admin_delete ON public.orders
  FOR DELETE TO kstyles_app
  USING (current_setting('app.user_role', true) = 'admin');

CREATE POLICY order_items_customer_read ON public.order_items
  FOR SELECT TO kstyles_app
  USING (
    current_setting('app.user_role', true) = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.orders
      WHERE public.orders.id = order_items.orderid
        AND public.orders.userid = NULLIF(current_setting('app.user_id', true), '')
    )
  );
CREATE POLICY order_items_server_create ON public.order_items
  FOR INSERT TO kstyles_app
  WITH CHECK (current_setting('app.user_role', true) IN ('public', 'customer', 'admin'));
CREATE POLICY order_items_admin_update ON public.order_items
  FOR UPDATE TO kstyles_app
  USING (current_setting('app.user_role', true) = 'admin')
  WITH CHECK (current_setting('app.user_role', true) = 'admin');
CREATE POLICY order_items_admin_delete ON public.order_items
  FOR DELETE TO kstyles_app
  USING (current_setting('app.user_role', true) = 'admin');

CREATE POLICY blog_public_read ON public.blog_posts
  FOR SELECT TO kstyles_app USING (true);
CREATE POLICY blog_admin_write ON public.blog_posts
  FOR ALL TO kstyles_app
  USING (current_setting('app.user_role', true) = 'admin')
  WITH CHECK (current_setting('app.user_role', true) = 'admin');

CREATE POLICY contacts_public_create ON public.contacts
  FOR INSERT TO kstyles_app
  WITH CHECK (current_setting('app.user_role', true) IN ('public', 'admin'));
CREATE POLICY contacts_admin_read ON public.contacts
  FOR SELECT TO kstyles_app
  USING (current_setting('app.user_role', true) = 'admin');

CREATE POLICY subscribers_public_create ON public.subscribers
  FOR INSERT TO kstyles_app
  WITH CHECK (current_setting('app.user_role', true) IN ('public', 'admin'));
CREATE POLICY subscribers_admin_read ON public.subscribers
  FOR SELECT TO kstyles_app
  USING (current_setting('app.user_role', true) = 'admin');

CREATE POLICY rate_limit_server_access ON public.rate_limit_buckets
  FOR ALL TO kstyles_app
  USING (current_setting('app.user_role', true) = 'system')
  WITH CHECK (current_setting('app.user_role', true) = 'system');

CREATE POLICY admin_audit_admin_access ON public.admin_audit
  FOR ALL TO kstyles_app
  USING (current_setting('app.user_role', true) = 'admin')
  WITH CHECK (current_setting('app.user_role', true) = 'admin');

CREATE POLICY designs_public_read ON public.designs
  FOR SELECT TO kstyles_app
  USING (active = 1 OR current_setting('app.user_role', true) = 'admin');
CREATE POLICY designs_admin_write ON public.designs
  FOR ALL TO kstyles_app
  USING (current_setting('app.user_role', true) = 'admin')
  WITH CHECK (current_setting('app.user_role', true) = 'admin');

CREATE POLICY design_orders_public_create ON public.design_orders
  FOR INSERT TO kstyles_app
  WITH CHECK (current_setting('app.user_role', true) IN ('public', 'customer', 'admin'));
CREATE POLICY design_orders_admin_read ON public.design_orders
  FOR SELECT TO kstyles_app
  USING (current_setting('app.user_role', true) = 'admin');
CREATE POLICY design_orders_admin_update ON public.design_orders
  FOR UPDATE TO kstyles_app
  USING (current_setting('app.user_role', true) = 'admin')
  WITH CHECK (current_setting('app.user_role', true) = 'admin');
CREATE POLICY design_orders_admin_delete ON public.design_orders
  FOR DELETE TO kstyles_app
  USING (current_setting('app.user_role', true) = 'admin');

COMMIT;
