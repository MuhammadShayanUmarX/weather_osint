import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { buttonClasses } from '@/lib/ui';

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <GlassPanel className="w-full max-w-xl">
        <EmptyState
          icon={Compass}
          title="Page not found"
          description="The requested environmental intelligence view does not exist in this frontend milestone."
          className="min-h-64"
          action={
            <Link to="/" className={buttonClasses('primary', 'md')}>
              Return to overview
            </Link>
          }
        />
      </GlassPanel>
    </div>
  );
}
