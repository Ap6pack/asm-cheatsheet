import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ArrowRight, BookOpen } from "lucide-react";
import { getAllGuides } from "@/lib/content/loader";

export const metadata = {
  title: "Guides - ASM Cheatsheet",
  description: "In-depth guides for building and integrating ASM capabilities.",
};

export default async function GuidesPage() {
  const guides = await getAllGuides();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Guides</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          In-depth guides for building and integrating ASM capabilities.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {guides.map((guide) => (
          <Link key={guide.slug} href={`/guides/${guide.slug}`}>
            <Card className="h-full transition-colors hover:border-[var(--primary)]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[var(--primary)]" />
                  <CardTitle className="text-lg">{guide.title}</CardTitle>
                </div>
                {guide.description && (
                  <CardDescription className="line-clamp-3">
                    {guide.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center text-sm text-[var(--primary)]">
                  Read Guide <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
