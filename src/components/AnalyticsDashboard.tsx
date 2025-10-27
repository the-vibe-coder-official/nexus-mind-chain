import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Activity, TrendingUp, Users, Zap } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface AnalyticsDashboardProps {
  walletAddress: string;
  onBack: () => void;
}

const AnalyticsDashboard = ({ walletAddress, onBack }: AnalyticsDashboardProps) => {
  const [analytics, setAnalytics] = useState<any>({
    totalEvents: 0,
    eventsByType: [],
    agentActivity: [],
    recentEvents: [],
    timeSeriesData: [],
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  useEffect(() => {
    fetchAnalytics();

    // Subscribe to real-time analytics updates
    const channel = supabase
      .channel('analytics-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics_events'
        },
        () => {
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all events for the user
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process analytics data
      const totalEvents = events?.length || 0;

      // Events by type
      const eventTypeCount: Record<string, number> = {};
      events?.forEach(event => {
        eventTypeCount[event.event_type] = (eventTypeCount[event.event_type] || 0) + 1;
      });
      const eventsByType = Object.entries(eventTypeCount).map(([name, value]) => ({
        name,
        value,
      }));

      // Agent activity
      const agentActivityMap: Record<string, number> = {};
      events?.forEach(event => {
        if (event.agent_id) {
          agentActivityMap[event.agent_id] = (agentActivityMap[event.agent_id] || 0) + 1;
        }
      });
      const agentActivity = Object.entries(agentActivityMap).map(([agent, count]) => ({
        agent: `Agent ${agent.slice(0, 8)}...`,
        count,
      }));

      // Time series data (last 7 days)
      const timeSeriesMap: Record<string, number> = {};
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      events?.forEach(event => {
        const date = new Date(event.created_at).toISOString().split('T')[0];
        if (last7Days.includes(date)) {
          timeSeriesMap[date] = (timeSeriesMap[date] || 0) + 1;
        }
      });

      const timeSeriesData = last7Days.map(date => ({
        date: new Date(date).toLocaleDateString('de-DE', { month: 'short', day: 'numeric' }),
        events: timeSeriesMap[date] || 0,
      }));

      setAnalytics({
        totalEvents,
        eventsByType,
        agentActivity: agentActivity.slice(0, 5),
        recentEvents: events?.slice(0, 10) || [],
        timeSeriesData,
      });
    } catch (error: any) {
      console.error('Analytics error:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="space-y-6">
        <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-time Analytics Dashboard
            </CardTitle>
            <CardDescription>
              Track your AI agent performance and user engagement
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalEvents}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Event Types</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.eventsByType.length}</div>
              <p className="text-xs text-muted-foreground">Unique types</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.agentActivity.length}</div>
              <p className="text-xs text-muted-foreground">With activity</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.recentEvents.length}</div>
              <p className="text-xs text-muted-foreground">Last 10 events</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Activity Over Time</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="events" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Events by Type</CardTitle>
              <CardDescription>Distribution of event types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.eventsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {analytics.eventsByType.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agent Activity</CardTitle>
              <CardDescription>Top 5 most active agents</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.agentActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="agent" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Latest activity stream</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {analytics.recentEvents.map((event: any) => (
                  <div key={event.id} className="flex items-start gap-3 p-2 border rounded-lg">
                    <Activity className="h-4 w-4 mt-1 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{event.event_type}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {new Date(event.created_at).toLocaleString('de-DE')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;