import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="text-6xl font-bold text-[hsl(var(--muted-foreground))]/30 mb-4">
        404
      </div>
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-[hsl(var(--muted-foreground))] mb-6 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist. It may have been moved or the URL might be incorrect.
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
        <Link href="/commands">
          <Button variant="outline">
            <Search className="mr-2 h-4 w-4" />
            Browse Commands
          </Button>
        </Link>
      </div>
    </div>
  );
}
