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
  TrendingDown,
  Clock,
  Plus,
  AlertCircle,
  BarChart3,
  Zap,
  Eye,
  ChevronRight,
  Activity,
  Target,
} from "lucide-react";

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
      <CardHeader>
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user, loading } = useAuth();

  const {
    data: games,
    isLoading: gamesLoading,
    error: gamesError,
  } = trpc.games.list.useQuery(undefined, { enabled: !!user });

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = trpc.games.dashboardStats.useQuery(undefined, { enabled: !!user });

  const {
    data: recentReports,
    isLoading: reportsLoading,
  } = trpc.games.recentReports.useQuery(undefined, { enabled: !!user });

  const createGameMutation = trpc.games.create.useMutation({
    onSuccess: () => {
      trpc.useUtils().games.list.invalidate();
      trpc.useUtils().games.dashboardStats.invalidate();
      setCreateOpen(false);
      setGameName("");
      setGameDescription("");
      setGamePlatform("");
    },
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [gameName, setGameName] = useState("");
  const [gameDescription, setGameDescription] = useState("");
  const [gamePlatform, setGamePlatform] = useState("");
  const [formError, setFormError] = useState("");

  function handleCreateGame() {
    setFormError("");
    if (!gameName.trim()) {
      setFormError("Game name is required.");
      return;
    }
    createGameMutation.mutate({
      name: gameName.trim(),
      description: gameDescription.trim() || undefined,
      platform: gamePlatform || undefined,
    });
  }

  const platformColors: Record<string, string> = {
    ios: "bg-blue-100 text-blue-700",
    android: "bg-green-100 text-green-700",
    pc: "bg-purple-100 text-purple-700",
    web: "bg-orange-100 text-orange-700",
    console: "bg-red-100 text-red-700",
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Here's what's happening across your games today.
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 px-4 gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Add Game
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add a New Game</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {formError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="game-name">Game Name *</Label>
                  <Input
                    id="game-name"
                    placeholder="e.g. Space Jumper"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="game-description">Description</Label>
                  <Textarea
                    id="game-description"
                    placeholder="Brief description of your game..."
                    value={gameDescription}
                    onChange={(e) => setGameDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="game-platform">Platform</Label>
                  <Select value={gamePlatform} onValueChange={setGamePlatform}>
                    <SelectTrigger id="game-platform">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ios">iOS</SelectItem>
                      <SelectItem value="android">Android</SelectItem>
                      <SelectItem value="pc">PC</SelectItem>
                      <SelectItem value="web">Web</SelectItem>
                      <SelectItem value="console">Console</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-10"
                    onClick={() => setCreateOpen(false)}
                    disabled={createGameMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 h-10"
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
        {statsError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load stats: {statsError.message}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                      Total Games
                    </CardTitle>
                    <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl md:text-3xl font-bold">
                      {stats?.totalGames ?? 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats?.activeGames ?? 0} active
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                      Total Players
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl md:text-3xl font-bold">
                      {stats?.totalPlayers != null
                        ? stats.totalPlayers.toLocaleString()
                        : "0"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Across all games
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                      Avg. Quit Rate
                    </CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl md:text-3xl font-bold">
                      {stats?.avgQuitRate != null
                        ? `${(Number(stats.avgQuitRate) * 100).toFixed(1)}%`
                        : "—"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sessions ended early
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                      Avg. Session
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl md:text-3xl font-bold">
                      {stats?.avgSessionDuration != null
                        ? `${Math.floor(stats.avgSessionDuration / 60)}m`
                        : "—"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Average play time
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Games List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Games</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground h-8 px-3 text-xs"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>

            {gamesError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load games: {gamesError.message}
                </AlertDescription>
              </Alert>
            ) : gamesLoading ? (
              <div className="space-y-3">
                <GameCardSkeleton />
                <GameCardSkeleton />
                <GameCardSkeleton />
              </div>
            ) : !games || games.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Gamepad2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No games yet</h3>
                  <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                    Add your first game to start tracking player sessions, quit
                    patterns, and engagement analytics.
                  </p>
                  <Button
                    className="h-10 px-6 gap-2"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Game
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {games.map((game) => (
                  <Card
                    key={game.id}
                    className="hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-base truncate">
                              {game.name}
                            </CardTitle>
                            {game.isActive ? (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-700 text-xs shrink-0"
                              >
                                <Activity className="w-2.5 h-2.5 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs shrink-0">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          {game.description && (
                            <CardDescription className="mt-1 text-xs line-clamp-1">
                              {game.description}
                            </CardDescription>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {game.platform && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                              platformColors[game.platform] ??
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {game.platform}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground font-mono truncate max-w-[160px]">
                          Key: {game.sdkApiKey.slice(0, 12)}…
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(game.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Recent Insight Reports */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Recent Insights</h2>
              {reportsLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <Card key={i}>
                      <CardContent className="py-4">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-3/4 mt-1" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : !recentReports || recentReports.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center py-8 text-center">
                    <BarChart3 className="w-8 h-8 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Insight reports will appear once your games start collecting
                      session data.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {recentReports.map((report) => (
                    <Card
                      key={report.id}
                      className="hover:shadow-sm transition-shadow"
                    >
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-sm font-medium line-clamp-1 flex-1">
                            {report.gameName ?? `Game #${report.gameId}`}
                          </span>
                          <Badge
                            variant={report.isPublished ? "default" : "outline"}
                            className="text-xs shrink-0"
                          >
                            {report.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {new Date(report.reportPeriodStart).toLocaleDateString()} –{" "}
                          {new Date(report.reportPeriodEnd).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {report.totalSessions} sessions
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />
                            {report.totalQuits} quits
                          </span>
                        </div>
                        {report.llmInsightSummary && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
                            "{report.llmInsightSummary}"
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full h-10 justify-start gap-3 text-sm"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus className="w-4 h-4 text-muted-foreground" />
                  Add New Game
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-10 justify-start gap-3 text-sm"
                  onClick={() => window.location.assign("/dashboard/games")}
                >
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  View All Sessions
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-10 justify-start gap-3 text-sm"
                  onClick={() => window.location.assign("/dashboard/settings/api-keys")}
                >
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  Manage API Keys
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-10 justify-start gap-3 text-sm"
                  onClick={() => window.location.assign("/dashboard/integrations")}
                >
                  <Target className="w-4 h-4 text-muted-foreground" />
                  SDK Integration Guide
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}