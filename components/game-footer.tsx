"use client"

import { Home, Map, BookOpen, Trophy, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function GameFooter() {
  const [activeTab, setActiveTab] = useState("quests")

  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "quests", label: "Quests", icon: Map },
    { id: "recipes", label: "Recipes", icon: BookOpen },
    { id: "leaderboard", label: "Ranks", icon: Trophy },
    { id: "profile", label: "Profile", icon: User },
  ]

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <nav className="container flex h-16 items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <Button
              key={tab.id}
              variant="ghost"
              className={`flex h-auto flex-col gap-1 px-3 py-2 ${
                isActive ? "text-[var(--game-green)]" : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className={`h-6 w-6 ${isActive ? "fill-[var(--game-green)]/20" : ""}`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </Button>
          )
        })}
      </nav>
    </footer>
  )
}