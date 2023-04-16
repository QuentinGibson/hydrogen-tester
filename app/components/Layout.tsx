import {
  type EnhancedMenu,
  type EnhancedMenuItem,
  useIsHomePath,
} from '~/lib/utils';
import { Image as ImageType, MenuItem, MenuItemType } from '@shopify/hydrogen/storefront-api-types';
import {
  Drawer,
  useDrawer,
  Text,
  Input,
  IconLogin,
  IconAccount,
  IconBag,
  IconSearch,
  Heading,
  IconMenu,
  IconCaret,
  Section,
  CountrySelector,
  Cart,
  CartLoading,
  Link,
} from '~/components';
import { useParams, Form, Await, useMatches } from '@remix-run/react';
import { Image } from '@shopify/hydrogen';
import { useWindowScroll } from 'react-use';
import { Disclosure } from '@headlessui/react';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useIsHydrated } from '~/hooks/useIsHydrated';
import { useCartFetchers } from '~/hooks/useCartFetchers';
import type { LayoutData } from '../root';
import NavItem from './NavItem';

export function Layout({
  children,
  layout,
}: {
  children: React.ReactNode;
  layout: LayoutData;
}) {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <div className="">
          <a href="#mainContent" className="sr-only">
            Skip to content
          </a>
        </div>
        <Header
          logo={layout?.shop?.brand?.logo?.image ?? ""}
          title={layout?.shop.name ?? 'Hydrogen'}
          menu={layout?.headerMenu}
        />
        <main role="main" id="mainContent" className="flex-grow">
          {children}
        </main>
      </div>
      <Footer menu={layout?.footerMenu} />
    </>
  );
}

function Header({ title, menu, logo }: { title: string; menu?: EnhancedMenu, logo: ImageType | string }) {
  const isHome = useIsHomePath();

  const {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
  } = useDrawer();

  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();

  const addToCartFetchers = useCartFetchers('ADD_TO_CART');

  // toggle cart drawer when adding to cart
  useEffect(() => {
    if (isCartOpen || !addToCartFetchers.length) return;
    openCart();
  }, [addToCartFetchers, isCartOpen, openCart]);

  return (
    <>
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      {menu && (
        <MenuDrawer isOpen={isMenuOpen} onClose={closeMenu} menu={menu} />
      )}
      <DesktopHeader
        logo={logo}
        isHome={isHome}
        title={title}
        menu={menu}
        openCart={openCart}
      />
      <MobileHeader
        isHome={isHome}
        title={title}
        openCart={openCart}
        openMenu={openMenu}
      />
    </>
  );
}

function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [root] = useMatches();

  return (
    <Drawer open={isOpen} onClose={onClose} heading="Cart" openFrom="right">
      <div className="grid">
        <Suspense fallback={<CartLoading />}>
          <Await resolve={root.data?.cart}>
            {(cart) => <Cart layout="drawer" onClose={onClose} cart={cart} />}
          </Await>
        </Suspense>
      </div>
    </Drawer>
  );
}

export function MenuDrawer({
  isOpen,
  onClose,
  menu,
}: {
  isOpen: boolean;
  onClose: () => void;
  menu: EnhancedMenu;
}) {
  return (
    <Drawer open={isOpen} onClose={onClose} openFrom="left" heading="Menu">
      <div className="grid">
        <MenuMobileNav menu={menu} onClose={onClose} />
      </div>
    </Drawer>
  );
}

function MenuMobileNav({
  menu,
  onClose,
}: {
  menu: EnhancedMenu;
  onClose: () => void;
}) {
  return (
    <nav className="grid gap-4 p-6 sm:gap-6 sm:px-12 sm:py-8">
      {/* Top level menu items */}
      {(menu?.items || []).map((item) => (
        <span key={item.id} className="block">
          <Link
            to={item.to}
            target={item.target}
            onClick={onClose}
            className={({ isActive }) =>
              isActive ? 'pb-1 border-b -mb-px' : 'pb-1'
            }
          >
            <Text as="span" size="copy">
              {item.title}
            </Text>
          </Link>
        </span>
      ))}
    </nav>
  );
}

function MobileHeader({
  title,
  isHome,
  openCart,
  openMenu,
}: {
  title: string;
  isHome: boolean;
  openCart: () => void;
  openMenu: () => void;
}) {
  // useHeaderStyleFix(containerStyle, setContainerStyle, isHome);

  const params = useParams();

  return (
    <header
      role="banner"
      className={`${isHome
        ? 'bg-primary/80 dark:bg-contrast/60 text-contrast dark:text-primary shadow-darkHeader'
        : 'bg-contrast/80 text-primary'
        } flex lg:hidden items-center h-nav sticky backdrop-blur-lg z-40 top-0 justify-between w-full leading-none gap-4 px-4 md:px-8`}
    >
      <div className="flex items-center justify-start w-full gap-4">
        <button
          onClick={openMenu}
          className="relative flex items-center justify-center w-8 h-8"
        >
          <IconMenu />
        </button>
        <Form
          method="get"
          action={params.lang ? `/${params.lang}/search` : '/search'}
          className="items-center gap-2 sm:flex"
        >
          <button
            type="submit"
            className="relative flex items-center justify-center w-8 h-8"
          >
            <IconSearch />
          </button>
          <Input
            className={
              isHome
                ? 'focus:border-contrast/20 dark:focus:border-primary/20'
                : 'focus:border-primary/20'
            }
            type="search"
            variant="minisearch"
            placeholder="Search"
            name="q"
          />
        </Form>
      </div>

      <Link
        className="flex items-center self-stretch leading-[3rem] md:leading-[4rem] justify-center flex-grow w-full h-full"
        to="/"
      >
        <Heading className="font-bold text-center" as={isHome ? 'h1' : 'h2'}>
          {title}
        </Heading>
      </Link>

      <div className="flex items-center justify-end w-full gap-4">
        <AccountLink className="relative flex items-center justify-center w-8 h-8" />
        <CartCount isHome={isHome} openCart={openCart} />
      </div>
    </header>
  );
}

function DesktopHeader({
  isHome,
  logo,
  menu,
  openCart,
  title,
}: {
  isHome: boolean;
  openCart: () => void;
  menu?: EnhancedMenu;
  title: string;
  logo: ImageType | string
}) {
  const params = useParams();
  const { y } = useWindowScroll();
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [scrollDirection, setScrollDirection] = useState<string>('up');
  const [hoveredItem, setHoveredItem] = useState<MenuItem | undefined>(undefined)
  const [hovered, setHovered] = useState<boolean>(false)

  const handleMenuItemEnter = (item: MenuItem) => {
    console.log(`Set item to ${JSON.stringify(item)}`)
    setHoveredItem(item)
    if (item?.items.length > 0) {
      setHovered(true)
    } else {
      setHovered(false)
    }
  }
  const handleMenuItemExit = () => {
    setHovered(false)
    setHoveredItem(undefined)
  }
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [])
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 0) {
        if (window.scrollY < previousScrollY) {
          setScrollDirection('up');
        } else if (window.scrollY > previousScrollY) {
          setScrollDirection('down');
        }
        previousScrollY = window.scrollY;
      }
    };

    let previousScrollY = window.scrollY;

    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);


  return (
    <header
      role="banner"
      onMouseLeave={handleMenuItemExit}
      className={`${isHome
        ? 'bg-primary dark:bg-contrast text-contrast dark:text-primary shadow-darkHeader'
        : 'bg-contrast text-primary'
        } ${!isHome && y > 50 && ' shadow-lightHeader'} 
        ${scrolled && scrollDirection === "down" ? ' -translate-y-56' : ' translate-y-0'}
         hidden h-nav lg:flex items-center sticky transition duration-300 top-0 backdrop-blur-lg z-40 justify-between w-full leading-none gap-8 px-12 py-8`}
    >
      <div className="flex items-center gap-12">
        <Link className="font-bold" to="/" prefetch="intent">
          {(typeof logo !== "string") &&
            <Image width={70} alt="logo for our site" data={logo} />
          }
        </Link>
        <nav className="flex gap-8">
          {/* Top level menu items */}
          {(menu?.items || []).map((item) => (
            <NavItem handleMenuItemEnter={handleMenuItemEnter} handleMenuItemExit={handleMenuItemExit} key={item.id} item={item} />

          ))}
        </nav>
      </div>
      <div className="flex items-center gap-1">
        <Form
          method="get"
          action={params.lang ? `/${params.lang}/search` : '/search'}
          className="flex items-center gap-2"
        >
          <Input
            className={
              isHome
                ? 'focus:border-contrast/20 dark:focus:border-primary/20'
                : 'focus:border-primary/20'
            }
            type="search"
            variant="minisearch"
            placeholder="Search"
            name="q"
          />
          <button
            type="submit"
            className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
          >
            <IconSearch />
          </button>
        </Form>
        <AccountLink className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5" />
        <CartCount isHome={isHome} openCart={openCart} />
      </div>
      {hovered &&
        <div className={`absolute left-0 w-full h-52 top-nav ${isHome
          ? 'bg-primary dark:bg-contrast text-contrast dark:text-primary shadow-darkHeader'
          : 'bg-contrast text-primary'
          }`}>
          <ul className='flex w-full text-lg justify-evenly'>
            {hoveredItem?.items.map(item =>
              <li className="font-bold" key={item.id}>
                {item.title}
                {item?.items &&
                  <ul className="flex flex-col text-base font-normal">
                    {item?.items.map(subitem => (<li className="">{subitem.title}</li>))}
                  </ul>}

              </li>
            )}
          </ul>
        </div>
      }
    </header>
  );
}

function AccountLink({ className }: { className?: string }) {
  const [root] = useMatches();
  const isLoggedIn = root.data?.isLoggedIn;
  return isLoggedIn ? (
    <Link to="/account" className={className}>
      <IconAccount />
    </Link>
  ) : (
    <Link to="/account/login" className={className}>
      <IconLogin />
    </Link>
  );
}

function CartCount({
  isHome,
  openCart,
}: {
  isHome: boolean;
  openCart: () => void;
}) {
  const [root] = useMatches();

  return (
    <Suspense fallback={<Badge count={0} dark={isHome} openCart={openCart} />}>
      <Await resolve={root.data?.cart}>
        {(cart) => (
          <Badge
            dark={isHome}
            openCart={openCart}
            count={cart?.totalQuantity || 0}
          />
        )}
      </Await>
    </Suspense>
  );
}

function Badge({
  openCart,
  dark,
  count,
}: {
  count: number;
  dark: boolean;
  openCart: () => void;
}) {
  const isHydrated = useIsHydrated();

  const BadgeCounter = useMemo(
    () => (
      <>
        <IconBag />
        <div
          className={`${dark
            ? 'text-primary bg-contrast dark:text-contrast dark:bg-primary'
            : 'text-contrast bg-primary'
            } absolute bottom-1 right-1 text-[0.625rem] font-medium subpixel-antialiased h-3 min-w-[0.75rem] flex items-center justify-center leading-none text-center rounded-full w-auto px-[0.125rem] pb-px`}
        >
          <span>{count || 0}</span>
        </div>
      </>
    ),
    [count, dark],
  );

  return isHydrated ? (
    <button
      onClick={openCart}
      className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
    >
      {BadgeCounter}
    </button>
  ) : (
    <Link
      to="/cart"
      className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
    >
      {BadgeCounter}
    </Link>
  );
}

function Footer({ menu }: { menu?: EnhancedMenu }) {
  const isHome = useIsHomePath();
  const itemsCount = menu
    ? menu?.items?.length + 1 > 4
      ? 4
      : menu?.items?.length + 1
    : [];

  return (
    <Section
      divider={isHome ? 'none' : 'top'}
      as="footer"
      role="contentinfo"
      className={`grid min-h-[25rem] items-start grid-flow-row w-full gap-6 py-8 px-6 md:px-8 lg:px-12 md:gap-8 lg:gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-${itemsCount}
        bg-primary dark:bg-contrast dark:text-primary text-contrast overflow-hidden`}
    >
      <FooterMenu menu={menu} />
      <CountrySelector />
      <div
        className={`self-end pt-8 opacity-50 md:col-span-2 lg:col-span-${itemsCount}`}
      >
        &copy; {new Date().getFullYear()} / Shopify, Inc. Hydrogen is an MIT
        Licensed Open Source project.
      </div>
    </Section>
  );
}

const FooterLink = ({ item }: { item: EnhancedMenuItem }) => {
  if (item.to.startsWith('http')) {
    return (
      <a href={item.to} target={item.target} rel="noopener noreferrer">
        {item.title}
      </a>
    );
  }

  return (
    <Link to={item.to} target={item.target} prefetch="intent">
      {item.title}
    </Link>
  );
};

function FooterMenu({ menu }: { menu?: EnhancedMenu }) {
  const styles = {
    section: 'grid gap-4',
    nav: 'grid gap-2 pb-6',
  };

  return (
    <>
      {(menu?.items || []).map((item: EnhancedMenuItem) => (
        <section key={item.id} className={styles.section}>
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="text-left md:cursor-default">
                  <Heading className="flex justify-between" size="lead" as="h3">
                    {item.title}
                    {item?.items?.length > 0 && (
                      <span className="md:hidden">
                        <IconCaret direction={open ? 'up' : 'down'} />
                      </span>
                    )}
                  </Heading>
                </Disclosure.Button>
                {item?.items?.length > 0 ? (
                  <div
                    className={`${open ? `max-h-48 h-fit` : `max-h-0 md:max-h-fit`
                      } overflow-hidden transition-all duration-300`}
                  >
                    <Suspense data-comment="This suspense fixes a hydration bug in Disclosure.Panel with static prop">
                      <Disclosure.Panel static>
                        <nav className={styles.nav}>
                          {item.items.map((subItem) => (
                            <FooterLink key={subItem.id} item={subItem} />
                          ))}
                        </nav>
                      </Disclosure.Panel>
                    </Suspense>
                  </div>
                ) : null}
              </>
            )}
          </Disclosure>
        </section>
      ))}
    </>
  );
}
