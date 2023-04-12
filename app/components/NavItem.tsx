import { Link } from "~/components";
import { BsChevronDown } from "react-icons/bs";

export default function NavItem({ item }: any) {
  return (item?.items) ?
    <div className="flex"><Link
      key={item.id}
      to={item.to}
      target={item.target}
      prefetch="intent"
      className={({ isActive }) =>
        isActive ? 'pb-1 mr-2 border-b -mb-px' : 'pb-1 mr-2'
      }
    >
      {item.title}
    </Link><BsChevronDown /></div> : <Link
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