import Link from "next/link";
import * as fs from "fs";
import * as path from "path";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ArrowRight, BookOpen } from "lucide-react";

export const metadata = {
  title: "Guides - ASM Cheatsheet",
  description: "In-depth guides for building and integrating ASM capabilities.",
};

interface Guide {
  slug: string;
  title: string;
  description: string;
  file: string;
}

function getGuides(): Guide[] {
  const guidesDir = path.resolve(process.cwd(), "../content/guides");
  const files = fs.readdirSync(guidesDir).filter((f) => f.endsWith(".md"));

  return files.map((file) => {
    const content = fs.readFileSync(path.join(guidesDir, file), "utf-8");
    const firstLine = content.split("\n").find((l) => l.startsWith("# "));
    const title = firstLine ? firstLine.replace(/^#\s+/, "") : file.replace(".md", "");

    // Get first paragraph as description
    const lines = content.split("\n");
    let desc = "";
    let foundHeading = false;
    for (const line of lines) {
      if (line.startsWith("# ")) {
        foundHeading = true;
        continue;
      }
      if (foundHeading && line.trim() && !line.startsWith("#")) {
        desc = line.trim();
        break;
      }
    }

    return {
      slug: file.replace(".md", ""),
      title,
      description: desc,
      file,
    };
  });
}

export default function GuidesPage() {
  const guides = getGuides();

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
