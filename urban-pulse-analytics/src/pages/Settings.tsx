import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import {
    User, Palette, LayoutDashboard, BarChart3, Database,
    FileDown, Shield, Settings as SettingsIcon, BookOpen,
    LogOut, ChevronLeft, Save, RotateCcw, Monitor, RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
    const { user, updateProfile, logout } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    // --- STATE MANAGEMENT ---
    // Load from LocalStorage or use Defaults
    const loadSettings = () => {
        const saved = localStorage.getItem("urban_pulse_settings");
        if (saved) return JSON.parse(saved);
        return {
            role: "Senior Analyst",
            timezone: "UTC",
            language: "English (US)",
            theme: "light",
            density: "comfortable",
            fontSize: "medium",
            colorBlindMode: false,
            defaultLanding: "overview",
            defaultRegion: "all",
            autoSave: true,
            qolWeight: [60],
            affordabilityThreshold: [30],
            outlierSensitivity: "medium",
            currency: "USD",
            normalization: "min-max",
            rounding: "2",
            minCompleteness: [85],
            excludeIncomplete: true,
            showReliability: true,
            exportFormat: "csv",
            includeMetadata: true
        };
    };

    const initialSettings = loadSettings();

    // 1. Profile
    const [name, setName] = useState(user?.name || "");
    const [role, setRole] = useState(initialSettings.role);
    const [timezone, setTimezone] = useState(initialSettings.timezone);
    const [language, setLanguage] = useState(initialSettings.language);

    // 2. Appearance
    const [theme, setTheme] = useState(initialSettings.theme);
    const [density, setDensity] = useState(initialSettings.density);
    const [fontSize, setFontSize] = useState(initialSettings.fontSize);
    const [colorBlindMode, setColorBlindMode] = useState(initialSettings.colorBlindMode);

    // 3. Dashboard
    const [defaultLanding, setDefaultLanding] = useState(initialSettings.defaultLanding);
    const [defaultRegion, setDefaultRegion] = useState(initialSettings.defaultRegion);
    const [autoSave, setAutoSave] = useState(initialSettings.autoSave);

    // 4. Analytics Configuration
    const [qolWeight, setQolWeight] = useState(initialSettings.qolWeight);
    const [affordabilityThreshold, setAffordabilityThreshold] = useState(initialSettings.affordabilityThreshold);
    const [outlierSensitivity, setOutlierSensitivity] = useState(initialSettings.outlierSensitivity);

    // 5. Metric Calculation
    const [currency, setCurrency] = useState(initialSettings.currency);
    const [normalization, setNormalization] = useState(initialSettings.normalization);
    const [rounding, setRounding] = useState(initialSettings.rounding);

    // 6. Data Scope & Quality
    const [minCompleteness, setMinCompleteness] = useState(initialSettings.minCompleteness);
    const [excludeIncomplete, setExcludeIncomplete] = useState(initialSettings.excludeIncomplete);
    const [showReliability, setShowReliability] = useState(initialSettings.showReliability);

    // 7. Export
    const [exportFormat, setExportFormat] = useState(initialSettings.exportFormat);
    const [includeMetadata, setIncludeMetadata] = useState(initialSettings.includeMetadata);

    // Initial Load & Sync
    useEffect(() => {
        if (user) setName(user.name);
        // Sync Theme
        const isDark = document.documentElement.classList.contains("dark");
        setTheme(isDark ? "dark" : "light");
    }, [user]);

    // Handlers
    const handleSaveProfile = () => {
        if (!name.trim()) return;
        updateProfile(name);
        toast({ title: "Profile Saved", description: "User details updated successfully." });
    };

    const toggleTheme = (val: string) => {
        setTheme(val);
        if (val === "dark") document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
    };

    const resetSettings = () => {
        // Reset Logic Mock
        setDensity("comfortable");
        setFontSize("medium");
        setQolWeight([60]);
        toast({ title: "Settings Reset", description: "Restored default configuration.", variant: "destructive" });
    };

    const saveAllSettings = () => {
        const settings = {
            role, timezone, language,
            theme, density, fontSize, colorBlindMode,
            defaultLanding, defaultRegion, autoSave,
            qolWeight, affordabilityThreshold, outlierSensitivity,
            currency, normalization, rounding,
            minCompleteness, excludeIncomplete, showReliability,
            exportFormat, includeMetadata
        };
        localStorage.setItem("urban_pulse_settings", JSON.stringify(settings));
        toast({ title: "Configuration Saved", description: "All preferences have been saved to local storage." });
    };

    const triggerManualRefresh = () => {
        toast({ title: "Data Refresh Initiated", description: "Fetching latest datasets from source..." });
        setTimeout(() => toast({ title: "Data Updated", description: "Dashboard is now using real-time data.", className: "bg-green-500 text-white" }), 2000);
    };

    return (
        <div className="container max-w-7xl py-6 space-y-8 h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
                        <p className="text-muted-foreground">Advanced analytics and application preferences.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={resetSettings}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Reset Defaults
                    </Button>
                    <Button onClick={saveAllSettings}>
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                </div>
            </div>

            {/* Main Layout: Sidebar Tabs + Content */}
            <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-8 h-full">

                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <TabsList className="flex flex-col h-auto w-full items-stretch bg-transparent space-y-1 p-0">
                        <TabsTrigger value="profile" className="justify-start px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary mb-1">
                            <User className="mr-2 h-4 w-4" /> Profile
                        </TabsTrigger>
                        <TabsTrigger value="appearance" className="justify-start px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary mb-1">
                            <Palette className="mr-2 h-4 w-4" /> Appearance
                        </TabsTrigger>
                        <TabsTrigger value="dashboard" className="justify-start px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary mb-1">
                            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="justify-start px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary mb-1">
                            <BarChart3 className="mr-2 h-4 w-4" /> Analytics Engine
                        </TabsTrigger>
                        <TabsTrigger value="calculation" className="justify-start px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary mb-1">
                            <Monitor className="mr-2 h-4 w-4" /> Metrics & Calc
                        </TabsTrigger>
                        <TabsTrigger value="data" className="justify-start px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary mb-1">
                            <Database className="mr-2 h-4 w-4" /> Data Scope
                        </TabsTrigger>
                        <TabsTrigger value="export" className="justify-start px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary mb-1">
                            <FileDown className="mr-2 h-4 w-4" /> Export & Reports
                        </TabsTrigger>
                        <TabsTrigger value="security" className="justify-start px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary mb-1">
                            <Shield className="mr-2 h-4 w-4" /> Security
                        </TabsTrigger>
                        <TabsTrigger value="system" className="justify-start px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary mb-1">
                            <SettingsIcon className="mr-2 h-4 w-4" /> System
                        </TabsTrigger>
                        <TabsTrigger value="methodology" className="justify-start px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary mb-1">
                            <BookOpen className="mr-2 h-4 w-4" /> Methodology
                        </TabsTrigger>
                    </TabsList>
                </aside>

                {/* Content Area */}
                <div className="flex-1 pb-20">
                    {/* 1. PROFILE */}
                    <TabsContent value="profile" className="space-y-6 mt-0">
                        <Card>
                            <CardHeader><CardTitle>User Profile</CardTitle><CardDescription>Manage your identity and regional preferences.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Display Name</Label>
                                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input value={user?.email || ""} disabled className="bg-muted" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Organization Role</Label>
                                        <Select value={role} onValueChange={setRole}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Senior Analyst">Senior Analyst</SelectItem>
                                                <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                                                <SelectItem value="Viewer">Viewer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Timezone</Label>
                                        <Select value={timezone} onValueChange={setTimezone}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                                                <SelectItem value="EST">EST (GMT-5)</SelectItem>
                                                <SelectItem value="IST">IST (GMT+5:30)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Preferred Language</Label>
                                        <Select value={language} onValueChange={setLanguage}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="English (US)">English (US)</SelectItem>
                                                <SelectItem value="Spanish">Spanish</SelectItem>
                                                <SelectItem value="French">French</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button onClick={handleSaveProfile} className="mt-4">Update Profile</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 2. APPEARANCE */}
                    <TabsContent value="appearance" className="space-y-6 mt-0">
                        <Card>
                            <CardHeader><CardTitle>UI Preferences</CardTitle><CardDescription>Customize the visual interface.</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5"><Label>Theme Mode</Label><p className="text-sm text-muted-foreground">Toggle between Light and Dark interfaces.</p></div>
                                    <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg">
                                        <Button variant={theme === "light" ? "default" : "ghost"} size="sm" onClick={() => toggleTheme("light")}>Light</Button>
                                        <Button variant={theme === "dark" ? "default" : "ghost"} size="sm" onClick={() => toggleTheme("dark")}>Dark</Button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Layout Density</Label>
                                        <RadioGroup value={density} onValueChange={setDensity} className="flex gap-4">
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="comfortable" id="r1" /><Label htmlFor="r1">Comfortable</Label></div>
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="compact" id="r2" /><Label htmlFor="r2">Compact</Label></div>
                                        </RadioGroup>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5"><Label>Color-Blind Friendly Palette</Label><p className="text-sm text-muted-foreground">Adjust chart colors for accessibility.</p></div>
                                    <Switch checked={colorBlindMode} onCheckedChange={setColorBlindMode} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 3. DASHBOARD */}
                    <TabsContent value="dashboard" className="space-y-6 mt-0">
                        <Card>
                            <CardHeader><CardTitle>Dashboard Defaults</CardTitle><CardDescription>Set your starting view state.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Default Landing Page</Label>
                                        <Select value={defaultLanding} onValueChange={setDefaultLanding}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="overview">City Overview</SelectItem>
                                                <SelectItem value="comparison">Comparison Tool</SelectItem>
                                                <SelectItem value="trends">Global Trends</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Default Region Filter</Label>
                                        <Select value={defaultRegion} onValueChange={setDefaultRegion}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Global (All Regions)</SelectItem>
                                                <SelectItem value="emea">EMEA</SelectItem>
                                                <SelectItem value="apac">APAC</SelectItem>
                                                <SelectItem value="americas">Americas</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4">
                                    <div className="space-y-0.5"><Label>Auto-Save Layout</Label><p className="text-sm text-muted-foreground">Remember widget positions and filters.</p></div>
                                    <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 4. ANALYTICS */}
                    <TabsContent value="analytics" className="space-y-6 mt-0">
                        <Card>
                            <CardHeader><CardTitle>Algorithm Tuning</CardTitle><CardDescription>Adjust the sensitivity of analytical models.</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <Label>Default QoL Index Weighting (%)</Label>
                                    <div className="flex items-center gap-4">
                                        <Slider value={qolWeight} onValueChange={setQolWeight} max={100} step={5} className="flex-1" />
                                        <span className="w-12 text-sm font-mono">{qolWeight}%</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Higher weight prioritizes Quality of Life over Cost of Living.</p>
                                </div>
                                <div className="space-y-4">
                                    <Label>Affordability Stress Threshold (%)</Label>
                                    <div className="flex items-center gap-4">
                                        <Slider value={affordabilityThreshold} onValueChange={setAffordabilityThreshold} max={100} step={1} className="flex-1" />
                                        <span className="w-12 text-sm font-mono">{affordabilityThreshold}%</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Income portion spent on rent before flagging as "High Stress".</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Outlier Sensitivity</Label>
                                    <Select value={outlierSensitivity} onValueChange={setOutlierSensitivity}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low (Ignore minor deviations)</SelectItem>
                                            <SelectItem value="medium">Medium (Standard Z-Score)</SelectItem>
                                            <SelectItem value="high">High (Strict flagging)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 5. METRIC CALCULATION */}
                    <TabsContent value="calculation" className="space-y-6 mt-0">
                        <Card>
                            <CardHeader><CardTitle>Metrics & Formulas</CardTitle><CardDescription>Define how data creates insights.</CardDescription></CardHeader>
                            <CardContent className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Preferred Currency</Label>
                                    <Select value={currency} onValueChange={setCurrency}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD ($)</SelectItem>
                                            <SelectItem value="EUR">EUR (€)</SelectItem>
                                            <SelectItem value="GBP">GBP (£)</SelectItem>
                                            <SelectItem value="JPY">JPY (¥)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Normalization Method</Label>
                                    <Select value={normalization} onValueChange={setNormalization}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="min-max">Min-Max Scaling</SelectItem>
                                            <SelectItem value="z-score">Z-Score Standardization</SelectItem>
                                            <SelectItem value="percentile">Percentile Ranking</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Rounding Precision</Label>
                                    <Select value={rounding} onValueChange={setRounding}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Whole Numbers</SelectItem>
                                            <SelectItem value="2">2 Decimal Places</SelectItem>
                                            <SelectItem value="4">4 Decimal Places (Scientific)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>


                    {/* 6. DATA SCOPE */}
                    <TabsContent value="data" className="space-y-6 mt-0">
                        <Card>
                            <CardHeader><CardTitle>Data Governance</CardTitle><CardDescription>Control quality and inclusion rules.</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5"><Label>Exclude Incomplete Datasets</Label><p className="text-sm text-muted-foreground">Hide cities missing &gt;20% of core metrics.</p></div>
                                    <Switch checked={excludeIncomplete} onCheckedChange={setExcludeIncomplete} />
                                </div>
                                <div className="space-y-4">
                                    <Label>Minimum Completeness Threshold (%)</Label>
                                    <div className="flex items-center gap-4">
                                        <Slider value={minCompleteness} onValueChange={setMinCompleteness} max={100} step={5} className="flex-1" />
                                        <span className="w-12 text-sm font-mono">{minCompleteness}%</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5"><Label>Show Reliability Scores</Label><p className="text-sm text-muted-foreground">Display confidence badges on charts.</p></div>
                                    <Switch checked={showReliability} onCheckedChange={setShowReliability} />
                                </div>
                                <div className="pt-4 border-t">
                                    <Button variant="outline" onClick={triggerManualRefresh} className="w-full sm:w-auto">
                                        <RefreshCw className="mr-2 h-4 w-4" /> Trigger Manual Data Refresh
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 7. EXPORT */}
                    <TabsContent value="export" className="space-y-6 mt-0">
                        <Card>
                            <CardHeader><CardTitle>Reporting Standards</CardTitle><CardDescription>Configure default export formats.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Default Format</Label>
                                    <Select value={exportFormat} onValueChange={setExportFormat}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="csv">CSV (Raw Data)</SelectItem>
                                            <SelectItem value="pdf">PDF (Report View)</SelectItem>
                                            <SelectItem value="json">JSON (API Schema)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5"><Label>Include Metadata headers</Label><p className="text-sm text-muted-foreground">Add timestamp and source strings to files.</p></div>
                                    <Switch checked={includeMetadata} onCheckedChange={setIncludeMetadata} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 8. SECURITY */}
                    <TabsContent value="security" className="space-y-6 mt-0">
                        <Card>
                            <CardHeader><CardTitle>Access Control</CardTitle><CardDescription>Manage session and security preferences.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <Button variant="outline" className="w-full justify-start">Change Password</Button>
                                <Button variant="outline" className="w-full justify-start">View Active Sessions</Button>
                                <Button variant="destructive" onClick={() => { logout(); navigate("/login"); }} className="w-full justify-start">
                                    <LogOut className="mr-2 h-4 w-4" /> Log out of all devices
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 9. SYSTEM */}
                    <TabsContent value="system" className="space-y-6 mt-0">
                        <Card>
                            <CardHeader><CardTitle>System & Experimental</CardTitle><CardDescription>App-level configurations.</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5"><Label>Enable Experimental Features</Label><p className="text-sm text-muted-foreground">Access beta analytics widgets.</p></div>
                                    <Switch />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5"><Label>Verbose Explanations</Label><p className="text-sm text-muted-foreground">Show detailed tooltips for metrics.</p></div>
                                    <Switch defaultChecked />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 10. METHODOLOGY */}
                    <TabsContent value="methodology" className="space-y-6 mt-0">
                        <Card>
                            <CardHeader><CardTitle>Methodology & Attribution</CardTitle><CardDescription>Transparency in calculation.</CardDescription></CardHeader>
                            <CardContent className="space-y-4 text-sm text-muted-foreground">
                                <p><strong>Source Data:</strong> Aggregated from global census bureaus, real-time API feeds, and partner satellite imagery.</p>
                                <p><strong>QoL Formula:</strong> <code>(Safety * 0.3) + (Healthcare * 0.2) + (PurchasingPower * 0.5)</code></p>
                                <p><strong>Version:</strong> v2.4.0-stable</p>
                                <div className="pt-2">
                                    <Button variant="link" className="px-0">Download Whitepaper</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
