import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Gamepad2,
  Users,
  TrendingUp,
  AlertTriangle,
  Plus,
  Activity,
  BarChart3,
  Clock,
  Zap,
  ChevronRight,
  Eye,
  Brain,
} from "lucide-react";
import { Link } from "wouter";

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

function GameCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40 mb-1" />
        <Skeleton className="h-3 w-24" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user, loading } = useAuth();

  const [createGameOpen, setCreateGameOpen] = useState(false);
  const [gameName, setGameName] = useState("");
  const [gameDescription, setGameDescription] = useState("");
  const [gamePlatform, setGamePlatform] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const {
    data: games,
    isLoading: gamesLoading,
    error: gamesError,
  } = trpc.games.list.useQuery(undefined, { enabled: !!user });

  const {
    data: overviewMetrics,
    isLoading: metricsLoading,
  } = trpc.games.overviewMetrics.useQuery(undefined, { enabled: !!user });

  const {
    data: recentInsights,
    isLoading: insightsLoading,
  } = trpc.games.recentInsights.useQuery(undefined, { enabled: !!user });

  const utils = trpc.useUtils();

  const createGameMutation = trpc.games.create.useMutation({
    onSuccess: () => {
      utils.games.list.invalidate();
      utils.games.overviewMetrics.invalidate();
      setCreateGameOpen(false);
      setGameName("");
      setGameDescription("");
      setGamePlatform("");
      setCreateError(null);
    },
    onError: (err) => {
      setCreateError(err.message || "Failed to create game. Please try again.");
    },
  });

  function handleCreateGame() {
    if (!gameName.trim()) {
      setCreateError("Game name is required.");
      return;
    }
    setCreateError(null);
    createGameMutation.mutate({
      name: gameName.trim(),
      description: gameDescription.trim() || undefined,
      platform: gamePlatform || undefined,
    });
  }

  function getPlanColor(tier: string) {
    switch (tier) {
      case "pro":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "studio":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-green-100 text-green-700 border-green-200";
    }
  }

  function formatDuration(seconds: number) {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  }

  const totalGames = games?.length ?? 0;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ""}! 👋
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              Monitor your games, analyze player behavior, and improve retention.
            </p>
          </div>
          <Dialog open={createGameOpen} onOpenChange={(open) => {
            setCreateGameOpen(open);
            if (!open) {
              setCreateError(null);
              setGameName("");
              setGameDescription("");
              setGamePlatform("");
            }
          }}>
            <DialogTrigger asChild>
              <Button className="h-10 px-4 w-full sm:w-auto flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Game
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">Add New Game</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {createError && (
                  <Alert variant="destructive">
                    <AlertDescription>{createError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="game-name">Game Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="game-name"
                    placeholder="e.g. Dungeon Crawler X"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="game-platform">Platform</Label>
                  <Select value={gamePlatform} onValueChange={setGamePlatform}>
                    <SelectTrigger id="game-platform" className="h-10">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile">Mobile (iOS / Android)</SelectItem>
                      <SelectItem value="pc">PC (Windows / Mac / Linux)</SelectItem>
                      <SelectItem value="console">Console</SelectItem>
                      <SelectItem value="web">Web / Browser</SelectItem>
                      <SelectItem value="cross-platform">Cross-Platform</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="game-description">Description</Label>
                  <Textarea
                    id="game-description"
                    placeholder="A short description of your game..."
                    value={gameDescription}
                    onChange={(e) => setGameDescription(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="h-10 px-4 flex-1"
                    onClick={() => setCreateGameOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-10 px-4 flex-1"
                    onClick={handleCreateGame}
                    disabled={createGameMutation.isPending}
                  >
                    {createGameMutation.isPending ? "Creating..." : "Create Game"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metricsLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-1 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Total Games
                    </CardTitle>
                    <Gamepad2 className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {overviewMetrics?.totalGames ?? totalGames}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {overviewMetrics?.activeGames ?? 0} active
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-1 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Total Sessions
                    </CardTitle>
                    <Activity className="h-4 w-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {overviewMetrics?.totalSessions?.toLocaleString() ?? "0"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Last 30 days</p>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-1 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Unique Players
                    </CardTitle>
                    <Users className="h-4 w-4 text-violet-500" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {overviewMetrics?.totalUniquePlayers?.toLocaleString() ?? "0"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Across all games</p>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-1 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Avg Drop-off Rate
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {overviewMetrics?.avgDropOffRate != null
                      ? `${(Number(overviewMetrics.avgDropOffRate) * 100).toFixed(1)}%`
                      : "—"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">All levels</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content: Games List + Recent Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Games List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-blue-500" />
                Your Games
              </h2>
              {!gamesLoading && totalGames > 0 && (
                <span className="text-sm text-gray-400">{totalGames} game{totalGames !== 1 ? "s" : ""}</span>
              )}
            </div>

            {gamesError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {gamesError.message || "Failed to load games. Please refresh the page."}
                </AlertDescription>
              </Alert>
            )}

            {gamesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GameCardSkeleton />
                <GameCardSkeleton />
                <GameCardSkeleton />
              </div>
            ) : !gamesError && games && games.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <div className="rounded-full bg-blue-100 p-4 mb-4">
                    <Gamepad2 className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 mb-1">No games yet</h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-xs">
                    Add your first game to start tracking player sessions, drop-offs, and AI-powered insights.
                  </p>
                  <Button
                    className="h-10 px-5 flex items-center gap-2"
                    onClick={() => setCreateGameOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Game
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {games?.map((game) => (
                  <Card
                    key={game.id}
                    className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <CardTitle className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {game.name}
                          </CardTitle>
                          <CardDescription className="text-xs mt-0.5 truncate">
                            {game.platform ? game.platform : "No platform set"}
                          </CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs shrink-0 capitalize ${getPlanColor(game.planTier)}`}
                        >
                          {game.planTier}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-3">
                      {game.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">{game.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              game.isActive ? "bg-green-400" : "bg-gray-300"
                            }`}
                          />
                          {game.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {game.sessionRetentionDays}d retention
                        </span>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Link href={`/dashboard/games/${game.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs flex items-center gap-1"
                          >
                            <BarChart3 className="h-3 w-3" />
                            Analytics
                          </Button>
                        </Link>
                        <Link href={`/dashboard/games/${game.id}/sessions`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            Sessions
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {/* Add Game Card */}
                <Card
                  className="border-2 border-dashed border-gray-200 bg-gray-50/30 hover:border-blue-300 hover:bg-blue-50/20 transition-colors cursor-pointer group"
                  onClick={() => setCreateGameOpen(true)}
                >
                  <CardContent className="flex flex-col items-center justify-center h-full min-h-[160px] py-8">
                    <div className="rounded-full bg-gray-100 group-hover:bg-blue-100 p-3 mb-3 transition-colors">
                      <Plus className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
                      Add Game
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Recent Insights Panel */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Brain className="h-5 w-5 text-violet-500" />
              Recent Insights
            </h2>

            {insightsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border border-gray-100">
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : recentInsights && recentInsights.length > 0 ? (
              <div className="space-y-3">
                {recentInsights.map((insight) => (
                  <Card
                    key={insight.id}
                    className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-md bg-violet-50 p-1.5 shrink-0 mt-0.5">
                          <Zap className="h-3.5 w-3.5 text-violet-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 line-clamp-1">
                            {insight.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {insight.summary}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              {insight.affectedSessionCount > 0 && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {insight.affectedSessionCount}
                                </span>
                              )}
                              {insight.status && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs capitalize ${
                                    insight.status === "ready"
                                      ? "bg-green-50 text-green-600 border-green-200"
                                      : insight.status === "processing"
                                      ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                                      : insight.status === "failed"
                                      ? "bg-red-50 text-red-600 border-red-200"
                                      : "bg-gray-50 text-gray-500 border-gray-200"
                                  }`}
                                >
                                  {insight.status}
                                </Badge>
                              )}
                            </div>
                            <Link href={`/dashboard/games/${insight.gameId}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <div className="rounded-full bg-violet-100 p-3 mb-3">
                    <Brain className="h-6 w-6 text-violet-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">No insights yet</p>
                  <p className="text-xs text-gray-400">
                    Insights will appear once your games collect session data.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Quick Links */}
            <Card className="border border-gray-100 bg-gradient-to-br from-blue-50 to-violet-50">
              <CardContent className="p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Quick Actions
                </p>
                <Link href="/dashboard/integrations">
                  <Button
                    variant="ghost"
                    className="w-full h-9 justify-start text-sm text-gray-700 hover:text-blue-700 hover:bg-blue-100/60 px-3"
                  >
                    <Zap className="h-4 w-4 mr-2 text-blue-500" />
                    SDK Integrations
                  </Button>
                </Link>
                <Link href="/dashboard/settings/api-keys">
                  <Button
                    variant="ghost"
                    className="w-full h-9 justify-start text-sm text-gray-700 hover:text-violet-700 hover:bg-violet-100/60 px-3"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2 text-violet-500" />
                    API Keys
                  </Button>
                </Link>
                <Link href="/dashboard/settings/billing">
                  <Button
                    variant="ghost"
                    className="w-full h-9 justify-start text-sm text-gray-700 hover:text-green-700 hover:bg-green-100/60 px-3"
                  >
                    <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                    Billing & Plan
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}