import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path: string;
  isHome?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm mb-6 overflow-x-auto">
      {items.map((item, index) => (
        <div key={index} className="flex items-center flex-shrink-0">
          {index > 0 && (
            <span className="mx-2 text-text-muted">/</span>
          )}
          {index === items.length - 1 ? (
            <span className="text-text-secondary font-medium truncate max-w-[200px] sm:max-w-none">
              {item.isHome ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              ) : (
                item.label
              )}
            </span>
          ) : (
            <Link
              to={item.path}
              className="text-link hover:text-link-hover transition-colors flex items-center"
            >
              {item.isHome ? (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              ) : (
                <span className="truncate max-w-[120px] sm:max-w-none">{item.label}</span>
              )}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

export default Breadcrumbs;
