import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { AlertCircle, Clock, DollarSign } from 'lucide-react'

export default function ResultCard({ result, prompt }) {
  if (result.error) {
    return (
      <Card className="border-destructive/40">
        <CardContent className="p-4 space-y-2">
          <p className="text-sm font-medium">{result.model}</p>
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{result.error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      {/* Image */}
      <div className="aspect-square bg-muted relative">
        {result.imageUrl ? (
          <img
            src={result.imageUrl}
            alt={prompt}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No image returned
          </div>
        )}
      </div>

      {/* Metadata */}
      <CardContent className="p-3 space-y-2">
        <p className="text-sm font-medium">{result.model}</p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {/* Latency */}
          {result.latencyMs && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {(result.latencyMs / 1000).toFixed(1)}s
            </span>
          )}
          {/* Cost */}
          {result.costUsd != null && (
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              ${result.costUsd.toFixed(3)}
            </span>
          )}
        </div>

        {/* Cost/quality indicator — great discussion starter */}
        {result.latencyMs && result.costUsd != null && (
          <div className="pt-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Cost efficiency</span>
            </div>
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${Math.max(10, 100 - (result.costUsd / 0.025) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
