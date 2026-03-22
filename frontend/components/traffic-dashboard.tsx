"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Clock,
  Calendar,
  Cpu,
  Gauge,
  Network,
  Trees,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Algorithm = "knn" | "rf" | "both"
type TrafficLevel = "Heavy" | "High" | "Normal" | "Low" | string

interface PredictionResult {
  level: TrafficLevel
  accuracy: number
}

interface ModelResult {
  knn?: PredictionResult
  rf?: PredictionResult
}

const DAYS = [
  { value: "monday", label: "Monday", short: "Mon" },
  { value: "tuesday", label: "Tuesday", short: "Tue" },
  { value: "wednesday", label: "Wednesday", short: "Wed" },
  { value: "thursday", label: "Thursday", short: "Thu" },
  { value: "friday", label: "Friday", short: "Fri" },
  { value: "saturday", label: "Saturday", short: "Sat" },
  { value: "sunday", label: "Sunday", short: "Sun" },
]

const TRAFFIC_COLORS: Record<string, string> = {
  Heavy: "#991b1b",
  High: "#dc2626",
  Normal: "#facc15",
  Low: "#22c55e",
}

const TRAFFIC_DESCRIPTIONS: Record<string, string> = {
  Heavy: "Severe congestion. Expect major delays and avoid travel if possible.",
  High: "Heavy congestion expected. Consider alternate routes or delay travel.",
  Normal: "Moderate traffic flow. Some delays may occur during peak hours.",
  Low: "Clear roads ahead. Optimal conditions for travel.",
}

// Simulated historical performance data (deterministic to avoid hydration mismatch)
const HISTORICAL_DATA = [
  { hour: "00:00", knn: 82, rf: 85 }, { hour: "01:00", knn: 79, rf: 83 },
  { hour: "02:00", knn: 76, rf: 81 }, { hour: "03:00", knn: 78, rf: 80 },
  { hour: "04:00", knn: 80, rf: 82 }, { hour: "05:00", knn: 83, rf: 86 },
  { hour: "06:00", knn: 87, rf: 89 }, { hour: "07:00", knn: 91, rf: 93 },
  { hour: "08:00", knn: 94, rf: 95 }, { hour: "09:00", knn: 92, rf: 94 },
  { hour: "10:00", knn: 88, rf: 90 }, { hour: "11:00", knn: 86, rf: 88 },
  { hour: "12:00", knn: 89, rf: 91 }, { hour: "13:00", knn: 87, rf: 89 },
  { hour: "14:00", knn: 85, rf: 87 }, { hour: "15:00", knn: 88, rf: 90 },
  { hour: "16:00", knn: 90, rf: 92 }, { hour: "17:00", knn: 93, rf: 95 },
  { hour: "18:00", knn: 91, rf: 93 }, { hour: "19:00", knn: 88, rf: 90 },
  { hour: "20:00", knn: 85, rf: 87 }, { hour: "21:00", knn: 83, rf: 85 },
  { hour: "22:00", knn: 81, rf: 84 }, { hour: "23:00", knn: 80, rf: 83 },
]

// Simulated radar chart data for model comparison
// Simulated radar chart data for model comparison
const getRadarData = (knnAccuracy: number, rfAccuracy: number, metrics?: any) => [
  { metric: "Accuracy", knn: knnAccuracy, rf: rfAccuracy },
  { metric: "Precision", knn: metrics?.knn?.report?.['macro avg']?.precision ? Math.round(metrics.knn.report['macro avg'].precision * 100) : Math.round(knnAccuracy - 2), rf: metrics?.rf?.report?.['macro avg']?.precision ? Math.round(metrics.rf.report['macro avg'].precision * 100) : Math.round(rfAccuracy + 1) },
  { metric: "Recall", knn: metrics?.knn?.report?.['macro avg']?.recall ? Math.round(metrics.knn.report['macro avg'].recall * 100) : Math.round(knnAccuracy - 3), rf: metrics?.rf?.report?.['macro avg']?.recall ? Math.round(metrics.rf.report['macro avg'].recall * 100) : Math.round(rfAccuracy - 1) },
  { metric: "F1 Score", knn: metrics?.knn?.report?.['macro avg']?.['f1-score'] ? Math.round(metrics.knn.report['macro avg']['f1-score'] * 100) : Math.round(knnAccuracy - 1), rf: metrics?.rf?.report?.['macro avg']?.['f1-score'] ? Math.round(metrics.rf.report['macro avg']['f1-score'] * 100) : Math.round(rfAccuracy) },
  { metric: "Consistency", knn: 85, rf: 91 },
]

// Traffic Light Logo Component
function TrafficLightLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="w-10 h-28 bg-neutral-900 rounded-lg border-2 border-neutral-700 p-1.5 flex flex-col gap-1 relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-neutral-800 rounded-t" />
        <motion.div
          className="flex-1 rounded-full bg-red-600"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ boxShadow: "0 0 10px rgba(220, 38, 38, 0.8), inset 0 0 8px rgba(255, 255, 255, 0.3)" }}
        />
        <motion.div
          className="flex-1 rounded-full bg-yellow-500"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
          style={{ boxShadow: "0 0 10px rgba(250, 204, 21, 0.8), inset 0 0 8px rgba(255, 255, 255, 0.3)" }}
        />
        <motion.div
          className="flex-1 rounded-full bg-green-500"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
          style={{ boxShadow: "0 0 10px rgba(34, 197, 94, 0.8), inset 0 0 8px rgba(255, 255, 255, 0.3)" }}
        />
      </div>
    </div>
  )
}

// Mini Traffic Light Logo for Nav
function MiniTrafficLightLogo() {
  return (
    <div className="w-8 h-8 bg-neutral-900 rounded-md border border-neutral-700 p-1 flex flex-col gap-0.5">
      <div className="flex-1 rounded-full bg-red-600" style={{ boxShadow: "0 0 4px rgba(220, 38, 38, 0.8)" }} />
      <div className="flex-1 rounded-full bg-yellow-500" style={{ boxShadow: "0 0 4px rgba(250, 204, 21, 0.8)" }} />
      <div className="flex-1 rounded-full bg-green-500" style={{ boxShadow: "0 0 4px rgba(34, 197, 94, 0.8)" }} />
    </div>
  )
}

export function TrafficDashboard() {
  const [hour, setHour] = useState(14)
  const [minute, setMinute] = useState(30)
  const [day, setDay] = useState("wednesday")
  const [algorithm, setAlgorithm] = useState<Algorithm>("both")
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState("Processing...")
  const [result, setResult] = useState<ModelResult | null>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [error, setError] = useState<{title: string, message: string} | null>(null)

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    fetch(`${apiUrl}/api/metrics`)
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(console.error)
  }, [])

  const historicalData = metrics?.knn?.cv_scores
    ? metrics.knn.cv_scores.map((score: number, index: number) => ({
      hour: `Fold ${index + 1}`,
      knn: Math.round(score * 100),
      rf: Math.round(metrics.rf.cv_scores[index] * 100)
    }))
    : HISTORICAL_DATA

  const handlePredict = async () => {
    setLoading(true)
    setLoadingText("Processing...")
    setResult(null)
    setError(null)
    
    const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    const dayStr = day.charAt(0).toUpperCase() + day.slice(1);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    let success = false;
    let attempts = 0;
    const maxAttempts = 100; // 500 seconds total, free ML servers can take an enormous amount of time to load large models.
    let lastError = "";

    while (!success && attempts < maxAttempts) {
      try {
        const res = await fetch(`${apiUrl}/api/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ time: timeStr, day: dayStr, algorithm })
        });
        
        if (!res.ok && res.status >= 500) {
           throw new Error("Server Error " + res.status);
        }
        
        const data = await res.json();

        if (data.error) {
          if (data.error.includes("failed to get prediction") || data.error.includes("offline")) {
             lastError = data.error;
             setLoadingText(`Waking up ML Models... (Attempt ${attempts + 1}/${maxAttempts})`);
             attempts++;
             await new Promise(r => setTimeout(r, 5000));
             continue;
          } else {
            setError({
              title: "Prediction Error",
              message: data.error
            });
            setLoading(false);
            return;
          }
        }

        if (!data.traffic_level && !data.knn && !data.rf) {
          setError({
            title: "Empty Response",
            message: "The prediction API returned an empty response. Please try again."
          });
          setLoading(false);
          return;
        }

        let currentMetrics = metrics;
        if (!currentMetrics || currentMetrics.error || !currentMetrics.knn) {
           try {
              const metricsRes = await fetch(`${apiUrl}/api/metrics`);
              if (metricsRes.ok) {
                 const metricsData = await metricsRes.json();
                 if (!metricsData.error && metricsData.knn) {
                     setMetrics(metricsData);
                     currentMetrics = metricsData;
                 }
              }
           } catch(e) {}
        }

        const formatLvl = (lvl: string) => {
          if (!lvl) return "Normal";
          return lvl.charAt(0).toUpperCase() + lvl.slice(1);
        }

        const knnAcc = currentMetrics?.knn?.accuracy ? Math.round(currentMetrics.knn.accuracy * 100) : 85;
        const rfAcc = currentMetrics?.rf?.accuracy ? Math.round(currentMetrics.rf.accuracy * 100) : 92;

        let predictionResult: ModelResult = {};
        if (algorithm === "knn" && data.traffic_level) {
          predictionResult.knn = { level: formatLvl(data.traffic_level), accuracy: knnAcc };
        } else if (algorithm === "rf" && data.traffic_level) {
          predictionResult.rf = { level: formatLvl(data.traffic_level), accuracy: rfAcc };
        } else {
          predictionResult.knn = { level: formatLvl(data.knn), accuracy: knnAcc };
          predictionResult.rf = { level: formatLvl(data.rf), accuracy: rfAcc };
        }
        setResult(predictionResult);
        success = true;
      } catch (err: any) {
        console.error("Fetch attempt failed:", err);
        lastError = err.message || JSON.stringify(err);
        setLoadingText(`Waiting for Server... (Attempt ${attempts + 1}/${maxAttempts})`);

        // Bypass Vercel's 10s timeout by making the browser wait out the Render boot-cycle directly
        try {
           const wakeupRes = await fetch(`${apiUrl}/api/wakeup`);
           if (wakeupRes.ok) {
              const wakeupData = await wakeupRes.json();
              if (wakeupData.ml_api_url && wakeupData.ml_api_url !== "http://127.0.0.1:5000") {
                  setLoadingText(`Waking up ML Models directly... This usually takes ~60 seconds.`);
                  // This direct request hangs up to 100 seconds while the Python API boots, keeping the Wake sequence alive!
                  await fetch(`${wakeupData.ml_api_url}/metrics`, { mode: 'no-cors' }).catch(() => {});
              }
           }
        } catch(e) { }

        attempts++;
        await new Promise(r => setTimeout(r, 5000));
      }
    }
    
    if (!success) {
      setError({
        title: "API Timeout",
        message: `The ML API failed to wake up or respond. Detailed Error: ${lastError}`
      });
    }
    setLoading(false)
  }

  const getComparisonChartData = () => {
    if (!result) return []

    const data = []
    if (result.knn) {
      data.push({
        name: "KNN",
        accuracy: result.knn.accuracy,
        level: result.knn.level,
      })
    }
    if (result.rf) {
      data.push({
        name: "RF",
        accuracy: result.rf.accuracy,
        level: result.rf.level,
      })
    }
    return data
  }

  const selectedDay = DAYS.find(d => d.value === day)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MiniTrafficLightLogo />
            <div className="hidden sm:block">
              <span className="font-bold text-lg tracking-tight text-foreground">TrafficFlow</span>
              <span className="text-xs text-muted-foreground block">ML-Powered Predictions</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="hidden sm:flex gap-1.5 items-center border-green-600/50 text-green-500">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              System Online
            </Badge>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16 py-12 md:py-24"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 lg:gap-16 w-full">
              {/* Left Side - Traffic Light and Title */}
              <div className="flex items-center gap-8 lg:gap-12">
                <div className="hidden md:block">
                  <TrafficLightLogo />
                </div>
                <div>
                  <motion.div
                    className="flex items-center gap-4 mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground tracking-widest uppercase mb-1">
                      ML-Powered Traffic Analysis
                    </span>
                  </motion.div>
                  <h1 className="text-5xl sm:text-6xl lg:text-8xl tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                    <span className="text-red-600">Traffic</span>
                    <span className="text-foreground">Flow</span>
                  </h1>
                  <p className="text-lg sm:text-xl text-muted-foreground mt-8 max-w-lg text-pretty leading-relaxed">
                    Intelligent traffic prediction powered by advanced machine learning algorithms.
                  </p>
                </div>
              </div>

              {/* Right Side - Model Cards */}
              <div className="lg:max-w-lg w-full lg:ml-auto mt-6 lg:mt-0">
                <div className="grid grid-cols-2 gap-6 lg:gap-8">
                  <div className="bg-card/50 border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-red-600/10 flex items-center justify-center mb-4">
                      <Network className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">KNN Algorithm</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Instance-based learning for pattern recognition</p>
                  </div>
                  <div className="bg-card/50 border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                      <Trees className="w-6 h-6 text-green-500" />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">Random Forest</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Ensemble learning with decision trees</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid lg:grid-cols-3 gap-6 mb-8"
          >
            {/* Time Input Card */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-red-600/10 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-red-600" />
                  </div>
                  <CardTitle className="text-base text-foreground">Time Selection</CardTitle>
                </div>
                <CardDescription>Choose the time for prediction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Hour */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hour</span>
                    <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                      {hour.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="23"
                    value={hour}
                    onChange={(e) => setHour(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-[10px] font-mono text-muted-foreground">
                    <span>00</span>
                    <span>06</span>
                    <span>12</span>
                    <span>18</span>
                    <span>23</span>
                  </div>
                </div>

                {/* Minute */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Minute</span>
                    <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
                      {minute.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="59"
                    value={minute}
                    onChange={(e) => setMinute(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-[10px] font-mono text-muted-foreground">
                    <span>00</span>
                    <span>15</span>
                    <span>30</span>
                    <span>45</span>
                    <span>59</span>
                  </div>
                </div>

                {/* Full Time Display */}
                <div className="bg-secondary/50 rounded-lg p-4 text-center border border-border/50">
                  <span className="font-mono text-4xl font-bold tracking-wider text-foreground">
                    {hour.toString().padStart(2, "0")}:{minute.toString().padStart(2, "0")}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">Selected Time</p>
                </div>
              </CardContent>
            </Card>

            {/* Day Selection Card */}
            <Card className="border-border/50 bg-card/50 flex flex-col h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-yellow-500/10 flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5 text-yellow-500" />
                  </div>
                  <CardTitle className="text-base text-foreground">Day of Week</CardTitle>
                </div>
                <CardDescription>Select the day for analysis</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="grid grid-cols-7 gap-1 mb-6">
                  {DAYS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDay(d.value)}
                      className={`py-2 px-1 text-xs font-medium rounded-md transition-all duration-200 ${d.value === day
                        ? "bg-yellow-500 text-black shadow-lg"
                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                    >
                      {d.short}
                    </button>
                  ))}
                </div>

                <div className="bg-secondary/50 rounded-lg p-4 border border-border/50 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-foreground">{selectedDay?.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {day === "saturday" || day === "sunday" ? "Weekend" : "Weekday"}
                      </p>
                    </div>
                    <Badge className={day === "saturday" || day === "sunday"
                      ? "bg-green-500/10 text-green-500 border-green-500/50 hover:bg-green-500/20"
                      : "bg-yellow-500/10 text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/20"
                    }>
                      {day === "saturday" || day === "sunday" ? "Low Traffic Expected" : "Regular Traffic"}
                    </Badge>
                  </div>
                </div>

                {/* Day Visualization */}
                <div className="mt-auto p-4 rounded-lg border border-border/50 bg-muted/20">
                  <p className="text-xs text-muted-foreground mb-3 text-center sm:text-left">Traffic Pattern Preview</p>
                  <div className="flex items-end gap-1.5 h-16">
                    {DAYS.map((d, index) => {
                      const isWeekend = d.value === "saturday" || d.value === "sunday"
                      // Use deterministic heights based on index to avoid hydration mismatch
                      const heights = [85, 75, 90, 80, 95, 35, 30]
                      const height = isWeekend ? heights[index] : heights[index]
                      return (
                        <div
                          key={d.value}
                          className={`flex-1 rounded-t transition-all duration-300 ${d.value === day
                            ? "bg-yellow-500"
                            : isWeekend
                              ? "bg-green-500/50"
                              : "bg-red-600/50"
                            }`}
                          style={{ height: `${d.value === day ? 100 : height}%` }}
                        />
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Algorithm Selection Card */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-green-500/10 flex items-center justify-center">
                    <Cpu className="w-3.5 h-3.5 text-green-500" />
                  </div>
                  <CardTitle className="text-base text-foreground">ML Model</CardTitle>
                </div>
                <CardDescription>Choose prediction algorithm</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { value: "knn", label: "K-Nearest Neighbors", icon: Network, desc: "Instance-based learning", color: "red" },
                  { value: "rf", label: "Random Forest", icon: Trees, desc: "Ensemble decision trees", color: "yellow" },
                  { value: "both", label: "Compare Both", icon: Gauge, desc: "Side-by-side comparison", color: "green" },
                ].map((option) => {
                  const colorClasses = {
                    red: "border-red-600 bg-red-600/10",
                    yellow: "border-yellow-500 bg-yellow-500/10",
                    green: "border-green-500 bg-green-500/10",
                  }
                  const iconColorClasses = {
                    red: "bg-red-600 text-white",
                    yellow: "bg-yellow-500 text-black",
                    green: "bg-green-500 text-white",
                  }
                  return (
                    <button
                      key={option.value}
                      onClick={() => setAlgorithm(option.value as Algorithm)}
                      className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 text-left ${algorithm === option.value
                        ? colorClasses[option.color as keyof typeof colorClasses]
                        : "border-border/50 bg-secondary/30 hover:bg-secondary/50 hover:border-border"
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${algorithm === option.value
                        ? iconColorClasses[option.color as keyof typeof iconColorClasses]
                        : "bg-muted text-muted-foreground"
                        }`}>
                        <option.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${algorithm === option.value ? "text-foreground" : "text-muted-foreground"}`}>
                          {option.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{option.desc}</p>
                      </div>
                      {algorithm === option.value && (
                        <div className={`w-2 h-2 rounded-full animate-pulse ${option.color === "red" ? "bg-red-600" : option.color === "yellow" ? "bg-yellow-500" : "bg-green-500"
                          }`} />
                      )}
                    </button>
                  )
                })}

                <Button
                  onClick={handlePredict}
                  disabled={loading}
                  className="w-full mt-4 h-12 text-base font-semibold bg-red-600 hover:bg-red-700 text-white"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      {loadingText.includes("Waking") || loadingText.includes("Waiting") ? "Waking API..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      Run Prediction
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {!result && !loading && !error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="border-dashed border-2 border-border/50 bg-card/30">
                  <CardContent className="py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Gauge className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-foreground">Ready to Predict</h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Configure your time, day, and model preferences above, then click &quot;Run Prediction&quot; to get traffic analysis.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {error && !loading && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="border-red-500/50 bg-red-500/10">
                  <CardContent className="py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                        <Network className="w-8 h-8 text-red-500" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-foreground">{error.title}</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mb-6">
                        {error.message}
                      </p>
                      <Button onClick={() => setError(null)} variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="border-yellow-500/50 bg-card/50">
                  <CardContent className="py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="relative w-20 h-20 mb-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full"
                        />
                        <div className="absolute inset-2 flex items-center justify-center">
                          <Cpu className="w-8 h-8 text-yellow-500" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-foreground">
                        {loadingText.includes("Waking") || loadingText.includes("Waiting") ? "Waking up ML Models" : "Analyzing Traffic Patterns"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {loadingText === "Processing..." 
                          ? `Processing data with ${algorithm === "both" ? "KNN & Random Forest" : algorithm === "knn" ? "K-Nearest Neighbors" : "Random Forest"}...` 
                          : loadingText}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Results Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Prediction Results</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedDay?.label} at {hour % 12 || 12}:{minute.toString().padStart(2, "0")} {hour >= 12 ? 'PM' : 'AM'}
                    </p>
                  </div>
                  <Badge variant="outline" className="w-fit border-foreground/20">
                    {algorithm === "both" ? "Dual Model Comparison" : algorithm === "knn" ? "KNN Model" : "Random Forest"}
                  </Badge>
                </div>

                {/* Result Cards */}
                <div className={`grid gap-6 ${result.knn && result.rf ? "md:grid-cols-2" : "max-w-2xl"}`}>
                  {result.knn && (
                    <ResultCard
                      title="K-Nearest Neighbors"
                      shortTitle="KNN"
                      result={result.knn}
                      delay={0}
                    />
                  )}
                  {result.rf && (
                    <ResultCard
                      title="Random Forest"
                      shortTitle="RF"
                      result={result.rf}
                      delay={0.1}
                    />
                  )}
                </div>

                {/* Charts Section */}
                {result.knn && result.rf && (
                  <Tabs defaultValue="comparison" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-3 bg-secondary/50">
                      <TabsTrigger value="comparison" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Comparison</TabsTrigger>
                      <TabsTrigger value="radar" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">Model Analysis</TabsTrigger>
                      <TabsTrigger value="historical" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Historical</TabsTrigger>
                    </TabsList>

                    <TabsContent value="comparison" className="mt-4">
                      <Card className="border-border/50 bg-card/50">
                        <CardHeader>
                          <CardTitle className="text-base text-foreground">Model Performance Comparison</CardTitle>
                          <CardDescription>Accuracy metrics for both models</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={getComparisonChartData()} barSize={60}>
                                <XAxis
                                  dataKey="name"
                                  stroke="#a3a3a3"
                                  fontSize={12}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <YAxis
                                  stroke="#a3a3a3"
                                  fontSize={12}
                                  tickLine={false}
                                  axisLine={false}
                                  domain={[0, 100]}
                                  tickFormatter={(value) => `${value}%`}
                                />
                                <Tooltip
                                  cursor={false}
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload
                                      return (
                                        <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-xl">
                                          <p className="font-semibold mb-2 text-foreground">{data.name}</p>
                                          <p className="text-sm text-muted-foreground">
                                            Accuracy: <span className="text-foreground font-medium">{data.accuracy}%</span>
                                          </p>
                                          <p className="text-sm text-muted-foreground">
                                            Level: <span className="font-medium" style={{ color: TRAFFIC_COLORS[data.level as TrafficLevel] }}>{data.level}</span>
                                          </p>
                                        </div>
                                      )
                                    }
                                    return null
                                  }}
                                />
                                <Bar dataKey="accuracy" name="Accuracy" radius={[4, 4, 0, 0]}>
                                  {getComparisonChartData().map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={index === 0 ? "#dc2626" : "#facc15"}
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex items-center justify-center gap-8 mt-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded bg-red-600" />
                              <span className="text-sm text-muted-foreground">KNN</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded bg-yellow-500" />
                              <span className="text-sm text-muted-foreground">RF</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="radar" className="mt-4">
                      <Card className="border-border/50 bg-card/50">
                        <CardHeader>
                          <CardTitle className="text-base text-foreground">Multi-Metric Model Analysis</CardTitle>
                          <CardDescription>Comprehensive comparison across different performance metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart data={getRadarData(result.knn?.accuracy || 0, result.rf?.accuracy || 0, metrics)}>
                                <PolarGrid stroke="#262626" />
                                <PolarAngleAxis dataKey="metric" tick={{ fill: "#a3a3a3", fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#a3a3a3", fontSize: 10 }} />
                                <Tooltip
                                  cursor={false}
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                      return (
                                        <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-xl">
                                          <p className="font-semibold mb-2 text-foreground">{label}</p>
                                          {payload.map((item, i) => (
                                            <p key={i} className="text-sm font-medium" style={{ color: item.color }}>
                                              {item.name}: {item.value}%
                                            </p>
                                          ))}
                                        </div>
                                      )
                                    }
                                    return null
                                  }}
                                />
                                <Radar
                                  name="KNN"
                                  dataKey="knn"
                                  stroke="#dc2626"
                                  fill="#dc2626"
                                  fillOpacity={0.3}
                                />
                                <Radar
                                  name="RF"
                                  dataKey="rf"
                                  stroke="#facc15"
                                  fill="#facc15"
                                  fillOpacity={0.3}
                                />
                                <Legend />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="historical" className="mt-4">
                      <Card className="border-border/50 bg-card/50">
                        <CardHeader>
                          <CardTitle className="text-base text-foreground">Historical Accuracy Trend</CardTitle>
                          <CardDescription>24-hour model performance comparison</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={historicalData}>
                                <XAxis
                                  dataKey="hour"
                                  stroke="#a3a3a3"
                                  fontSize={10}
                                  tickLine={false}
                                  axisLine={false}
                                  interval={3}
                                />
                                <YAxis
                                  stroke="#a3a3a3"
                                  fontSize={12}
                                  tickLine={false}
                                  axisLine={false}
                                  domain={[70, 100]}
                                  tickFormatter={(value) => `${value}%`}
                                />
                                <Tooltip
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                      return (
                                        <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-xl">
                                          <p className="font-semibold mb-2 text-foreground">{label}</p>
                                          {payload.map((item, i) => (
                                            <p key={i} className="text-sm" style={{ color: item.color }}>
                                              {item.name}: {item.value}%
                                            </p>
                                          ))}
                                        </div>
                                      )
                                    }
                                    return null
                                  }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="knn"
                                  name="KNN"
                                  stroke="#dc2626"
                                  strokeWidth={2}
                                  dot={false}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="rf"
                                  name="RF"
                                  stroke="#facc15"
                                  strokeWidth={2}
                                  dot={false}
                                />
                                <Legend />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                )}


              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <MiniTrafficLightLogo />
                <span className="font-bold text-xl text-foreground tracking-tight">TrafficFlow</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
                Advanced traffic prediction system utilizing machine learning algorithms.
                Making your commute smarter with AI-driven insights.
              </p>
            </div>

            {/* Models */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">ML Models</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  K-Nearest Neighbors (KNN)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  Random Forest (RF)
                </li>
              </ul>
            </div>

            {/* Team Members */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Team Members</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  Narayan
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  Arjun
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Vency
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2026 TrafficFlow. All rights reserved.
            </p>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ResultCard({
  title,
  shortTitle,
  result,
  delay = 0,
}: {
  title: string
  shortTitle: string
  result: PredictionResult
  delay?: number
}) {
  const levelColor = TRAFFIC_COLORS[result.level]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card
        className="border-2 overflow-hidden bg-card/50"
        style={{ borderColor: levelColor }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-foreground">{title}</CardTitle>
              <CardDescription>{shortTitle} Model</CardDescription>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor: levelColor,
                boxShadow: `0 0 16px ${levelColor}`,
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Traffic Level */}
          <div className="bg-secondary/50 rounded-lg p-4">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">
              Traffic Level
            </span>
            <span
              className="text-4xl font-bold"
              style={{ color: levelColor }}
            >
              {result.level}
            </span>
            <p className="text-xs text-muted-foreground mt-2">
              {TRAFFIC_DESCRIPTIONS[result.level]}
            </p>
          </div>

          {/* Accuracy Metric */}
          <div className="bg-secondary/30 rounded-lg p-4">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">
              Model Accuracy
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">{result.accuracy}</span>
              <span className="text-lg text-muted-foreground">%</span>
            </div>
            <div className="mt-3 h-2 bg-border rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.accuracy}%` }}
                transition={{ delay: delay + 0.2, duration: 0.8 }}
                className="h-full rounded-full"
                style={{ backgroundColor: levelColor }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
