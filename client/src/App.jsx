import { useState } from 'react'
import GenerateView from './components/GenerateView'
import HistoryView from './components/HistoryView'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Separator } from './components/ui/separator'
import { FlaskConical } from 'lucide-react'

export default function App() {
  const [historyKey, setHistoryKey] = useState(0)

  // Called after a successful generation so History tab refreshes
  const handleGenerated = () => setHistoryKey(k => k + 1)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <FlaskConical className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-base font-semibold leading-none">Model Lab</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Compare Leonardo AI models side by side
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <Tabs defaultValue="generate">
          <TabsList>
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <Separator className="mt-4 mb-6" />

          <TabsContent value="generate">
            <GenerateView onGenerated={handleGenerated} />
          </TabsContent>

          <TabsContent value="history">
            <HistoryView key={historyKey} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
