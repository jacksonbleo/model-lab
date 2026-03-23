import { useState } from 'react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { Checkbox } from './ui/checkbox'
import { Separator } from './ui/separator'
import { Sparkles, Zap, Loader2, AlertCircle } from 'lucide-react'
import { MODELS } from '@/lib/models'
import ResultCard from './ResultCard'

export default function GenerateView({ onGenerated }) {
  const [prompt, setPrompt] = useState('')
  const [refinedPrompt, setRefinedPrompt] = useState('')
  const [selectedModelIds, setSelectedModelIds] = useState([MODELS[0].id])
  const [results, setResults] = useState([])
  const [isRefining, setIsRefining] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  const selectedModels = MODELS.filter(m => selectedModelIds.includes(m.id))
  const activePrompt = refinedPrompt || prompt

  // Toggle a model on/off (max 3)
  const toggleModel = (id) => {
    setSelectedModelIds(prev => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter(m => m !== id) : prev
      }
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  // Ask Claude to improve the prompt
  const handleRefine = async () => {
    if (!prompt.trim()) return
    setIsRefining(true)
    setError(null)
    try {
      const res = await fetch('/api/refine-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Refinement failed')
      setRefinedPrompt(data.refinedPrompt)
    } catch (e) {
      setError(e.message)
    } finally {
      setIsRefining(false)
    }
  }

  // Generate images across selected models
  const handleGenerate = async () => {
    if (!activePrompt.trim() || selectedModels.length === 0) return
    setIsGenerating(true)
    setResults([])
    setError(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          refinedPrompt: refinedPrompt || null,
          models: selectedModels,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResults(data.results)
      onGenerated?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Prompt Section */}
      <div className="space-y-3">
        <Label htmlFor="prompt">Prompt</Label>
        <Textarea
          id="prompt"
          placeholder="Describe the image you want to generate…"
          value={prompt}
          onChange={e => { setPrompt(e.target.value); setRefinedPrompt('') }}
          className="min-h-[100px] text-sm"
        />

        {/* Refine with Claude */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefine}
            disabled={!prompt.trim() || isRefining}
          >
            {isRefining
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Refining…</>
              : <><Sparkles className="h-3.5 w-3.5" /> Refine with Claude</>
            }
          </Button>
          {refinedPrompt && (
            <span className="text-xs text-muted-foreground">Prompt improved ✓</span>
          )}
        </div>

        {/* Show refined prompt if set */}
        {refinedPrompt && (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-4 space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Claude's refined prompt
              </p>
              <p className="text-sm">{refinedPrompt}</p>
              <button
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                onClick={() => setRefinedPrompt('')}
              >
                Discard and use original
              </button>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* Model Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Models to compare</Label>
          <span className="text-xs text-muted-foreground">Select up to 3</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MODELS.map(model => {
            const isSelected = selectedModelIds.includes(model.id)
            const isDisabled = !isSelected && selectedModelIds.length >= 3
            return (
              <button
                key={model.id}
                onClick={() => !isDisabled && toggleModel(model.id)}
                disabled={isDisabled}
                className={[
                  'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:bg-muted/50',
                  isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                ].join(' ')}
              >
                <Checkbox
                  checked={isSelected}
                  className="mt-0.5 pointer-events-none"
                  readOnly
                />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{model.name}</span>
                    {model.badge && (
                      <Badge variant="secondary" className="text-[10px] py-0">{model.badge}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{model.description}</p>
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Zap className="h-3 w-3" /> {model.speed}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ~${model.costPerImage.toFixed(3)}/image
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={!activePrompt.trim() || selectedModels.length === 0 || isGenerating}
        className="w-full"
        size="lg"
      >
        {isGenerating
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating across {selectedModels.length} model{selectedModels.length > 1 ? 's' : ''}…</>
          : `Generate with ${selectedModels.length} model${selectedModels.length > 1 ? 's' : ''}`
        }
      </Button>

      {/* Results Grid */}
      {results.length > 0 && (
        <div className="space-y-4">
          <Separator />
          <h2 className="text-sm font-medium">Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((result, i) => (
              <ResultCard key={i} result={result} prompt={activePrompt} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
