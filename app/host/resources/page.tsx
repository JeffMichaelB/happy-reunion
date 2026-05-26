import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RESOURCE_CATALOG } from "@/lib/resources/catalog"

export default function ResourcesPage() {
  return (
    <div>
      <h1 className="text-4xl font-semibold tracking-tight">Resources</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Conversation prompts to help you prepare for meaningful Reunions.
      </p>

      <div className="mt-10 space-y-6">
        {RESOURCE_CATALOG.map((category) => (
          <Card key={category.id} className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {category.prompts.map((prompt) => (
                  <li
                    key={prompt}
                    className="text-sm leading-relaxed text-foreground/80"
                  >
                    {prompt}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
