import { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Clock, DollarSign, Loader2, AlertCircle } from 'lucide-react'

export default function HistoryView() {
  const [generations, setGenerations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setGenerations(data.generations)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading history…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive py-8">
        <AlertCircle className="h-4 w-4" />
        <span>{error}</span>
      </div>
    )
  }

  if (generations.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-sm">No generations yet.</p>
        <p className="text-xs mt-1">Head to the Generate tab to create your first image.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{generations.length} generation{generations.length !== 1 ? 's' : ''}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {generations.map(gen => (
          <Card key={gen.id} className="overflow-hidden">
            {/* Image */}
            <div className="aspect-square bg-muted">
              {gen.image_url ? (
                <img
                  src={gen.image_url}
                  alt={gen.prompt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                  No image
                </div>
              )}
            </div>

            <CardContent className="p-3 space-y-2">
              {/* Model */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">{gen.model}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(gen.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Prompt */}
              <p className="text-xs text-muted-foreground line-clamp-2">
                {gen.refined_prompt || gen.prompt}
              </p>
              {gen.refined_prompt && (
                <Badge variant="secondary" className="text-[10px] py-0">Claude refined</Badge>
              )}

              {/* Stats */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                {gen.latency_ms && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {(gen.latency_ms / 1000).toFixed(1)}s
                  </span>
                )}
                {gen.cost_usd != null && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    ${gen.cost_usd.toFixed(3)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
