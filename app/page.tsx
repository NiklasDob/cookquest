import { GameHeader } from "@/components/game-header"
import { QuestMap } from "@/components/quest-map"
import { GameFooter } from "@/components/game-footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <GameHeader />
      <main className="flex-1 overflow-y-auto pb-20">
        <QuestMap />
      </main>
      <GameFooter />
    </div>
  )
}
