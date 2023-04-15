import { Link } from "~/components";
import { BsChevronDown } from "react-icons/bs";

export default function NavItem({ item, handleMenuItemEnter, handleMenuItemExit }: any) {

  return (item?.items) ?
    <div onMouseEnter={() => handleMenuItemEnter(item)} onMouseLeave={() => handleMenuItemExit(item)} >
      <Link
        key={item.id}
        to={item.to}
        target={item.target}
        prefetch="intent"
        className={({ isActive }) =>
          isActive ? 'pb-1 border-b -mb-px flex' : 'pb-1 mr-2 flex'
        }
      >
        {item.title}
        <BsChevronDown className="ml-2" />
      </Link></div> : <Link
        key={item.id}
        to={item.to}
        target={item.target}
        prefetch="intent"
        className={({ isActive }) =>
          isActive ? 'pb-1 border-b -mb-px' : 'pb-1'
        }
      >
      {item.title}
    </Link>
} 