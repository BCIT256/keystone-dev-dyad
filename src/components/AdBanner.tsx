import { Link } from 'react-router-dom';
import { Button } from './ui/button';

export function AdBanner() {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-2 border-t border-b z-10">
      <div className="container mx-auto flex items-center justify-between max-w-lg px-4">
        <p className="text-sm text-muted-foreground">
          Enjoy an ad-free experience.
        </p>
        <Button asChild size="sm" variant="ghost">
          <Link to="/purchase">Upgrade</Link>
        </Button>
      </div>
    </div>
  );
}