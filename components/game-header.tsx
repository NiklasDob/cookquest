import { Settings, Flame, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function GameHeader() {
  return (
    <header
      className="sticky top-0 z-50 border-b-2 bg-gradient-to-r from-card/90 via-card/95 to-card/90 backdrop-blur-md supports-[backdrop-filter]:bg-card/80"
      style={{ borderColor: "var(--game-orange)" }}
    >
      <div className="container flex h-16 items-center justify-between gap-4 px-4">
        {/* Left: Avatar and Level */}
        <div className="flex items-center gap-3">
          <div
            className="relative h-12 w-12 overflow-hidden rounded-full border-3 shadow-lg"
            style={{
              borderColor: "var(--game-orange)",
              boxShadow: "0 0 12px var(--game-orange)",
            }}
          >
            <Image src="/avatar.png" alt="Player Avatar" width={48} height={48} className="object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold" style={{ color: "var(--game-yellow)" }}>
              Chef Level 5
            </span>
            <div className="h-2 w-24 overflow-hidden rounded-full bg-muted/50 border border-[var(--game-green)]/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--game-green)] to-[var(--game-sage)] shadow-[0_0_8px_var(--game-green)]"
                style={{ width: "65%" }}
              />
            </div>
          </div>
        </div>

        {/* Right: Stats and Settings */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1 rounded-full px-3 py-1.5 border-2"
            style={{
              backgroundColor: "var(--game-orange)",
              borderColor: "var(--game-orange)",
              // boxShadow: "0 0 8px var(--game-orange)",
            }}
          >
            <Flame className="h-4 w-4" style={{ color: "white" }} />
            <span className="text-sm font-bold" style={{ color: "var(--game-cream)" }}>
              7
            </span>
          </div>
          <div
            className="flex items-center gap-1 rounded-full px-3 py-1.5 border-2"
            style={{
              backgroundColor: "var(--game-yellow)",
              borderColor: "var(--game-yellow)",
              // boxShadow: "0 0 8px var(--game-yellow)",
            }}
          >
            <Coins className="h-4 w-4" style={{ color: "white" }} />
            <span className="text-sm font-bold" style={{ color: "var(--game-cream)" }}>
              350
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-[var(--game-teal)]/20"
            style={{ color: "var(--game-teal)" }}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}