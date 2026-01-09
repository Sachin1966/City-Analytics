import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Activity, User, Lock, Globe, Mail, Shield, Headphones } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function Login() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [activeDialog, setActiveDialog] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password || (!isLogin && !name)) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        // Determine Display Name
        let displayName = name;
        if (!displayName) {
            const lowerEmail = email.toLowerCase();
            if (lowerEmail.includes("sachin")) {
                displayName = "Sachin";
            } else {
                // Fallback: Use capitalized email prefix
                const prefix = email.split('@')[0];
                displayName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
            }
        }

        // Trigger Login Action
        login(email, displayName);

        toast({
            title: isLogin ? `Welcome back, ${displayName}!` : "Account Created!",
            description: isLogin ? "Logging you into the dashboard..." : "Welcome to Urban Pulse! redirecting...",
        });

        setTimeout(() => navigate("/"), 800);
    };

    const dialogContent = {
        contact: {
            title: "Contact Us",
            icon: <Mail className="h-6 w-6 text-primary mb-2" />,
            content: "For enterprise inquiries or partnership opportunities, please reach out to our team at hello@urbanpulse.ai. We typically respond within 24 hours.",
        },
        support: {
            title: "Help & Support",
            icon: <Headphones className="h-6 w-6 text-primary mb-2" />,
            content: "Need assistance? Our support team is available 24/7. Visit our Help Center documentation or email support@urbanpulse.ai for direct assistance.",
        },
        privacy: {
            title: "Privacy Policy",
            icon: <Shield className="h-6 w-6 text-primary mb-2" />,
            content: "Your data security is our top priority. We use industry-standard encryption to protect your information. We do not sell your personal data to third parties.",
        }
    };

    const activeContent = activeDialog ? dialogContent[activeDialog as keyof typeof dialogContent] : null;

    return (
        <div className="flex min-h-screen bg-background w-full">
            {/* LEFT SIDE: LOGIN FORM */}
            <div className="flex-1 flex items-center justify-center p-8 bg-card/40 backdrop-blur-sm relative z-10 w-full md:w-1/2 lg:w-1/3">
                <div className="w-full max-w-sm space-y-8">
                    <div className="flex items-center gap-2 mb-8">
                        <Activity className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold tracking-tight">Urban Pulse</span>
                    </div>

                    <div className="text-center md:text-left mb-8">
                        <h2 className="text-2xl font-bold tracking-tight">{isLogin ? "Welcome Back!" : "Create Credentials"}</h2>
                        <p className="text-sm text-muted-foreground mt-2">{isLogin ? "Log in to access city analytics dashboard" : "Join thousands of analysts optimizing urban life"}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Full Name"
                                        className="pl-9 bg-background/50"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Email"
                                    className="pl-9 bg-background/50"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    className="pl-9 bg-background/50"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            {isLogin && (
                                <div className="flex items-center justify-end">
                                    <button type="button" onClick={() => setActiveDialog("support")} className="text-xs text-muted-foreground hover:text-primary">Forgot password?</button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="remember" />
                            <label
                                htmlFor="remember"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                            >
                                Remember me
                            </label>
                        </div>

                        <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white shadow-lg">
                            {isLogin ? "Log In" : "Sign Up"}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-muted-foreground mt-6">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button type="button" onClick={() => setIsLogin(!isLogin)} className="font-semibold text-primary hover:underline">
                            {isLogin ? "Sign Up" : "Log In"}
                        </button>
                    </div>

                    <div className="flex justify-center gap-4 mt-8 text-xs text-muted-foreground">
                        <button type="button" onClick={() => setActiveDialog("contact")}>Contact Us</button>
                        <button type="button" onClick={() => setActiveDialog("support")}>Support</button>
                        <button type="button" onClick={() => setActiveDialog("privacy")}>Privacy</button>
                    </div>
                    <p className="text-center text-[10px] text-muted-foreground mt-2">© 2026 Urban Pulse Analytics</p>
                </div>
            </div>

            {/* Dialogs for Static Pages */}
            <Dialog open={!!activeDialog} onOpenChange={() => setActiveDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            {activeContent?.icon}
                            <DialogTitle>{activeContent?.title}</DialogTitle>
                        </div>
                        <DialogDescription className="pt-4">
                            {activeContent?.content}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={() => setActiveDialog(null)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* RIGHT SIDE: HERO / ANALYTICS VISUAL */}
            <div className="hidden lg:flex flex-1 relative bg-slate-50 dark:bg-slate-950 items-center justify-center p-12 overflow-hidden">
                {/* Z-0: Background Map */}
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-multiply dark:mix-blend-screen" style={{
                    backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover'
                }} />

                {/* Z-10: Gradient Overlay */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-background/20 via-transparent to-transparent" />

                {/* Z-20: Content Layer */}
                <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                            Enhance Urban Insights
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
                            Analyze, Compare, Decide. Unlock quality of life and affordability data across global cities.
                        </p>
                    </div>

                    {/* Feature Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        <Card className="p-4 bg-background/50 backdrop-blur-sm border-white/10 hover:bg-background/60 transition-colors text-center">
                            <Globe className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                            <h3 className="font-semibold text-sm">Global Coverage</h3>
                            <p className="text-xs text-muted-foreground mt-1">Data from 500+ cities worldwide</p>
                        </Card>
                        <Card className="p-4 bg-background/50 backdrop-blur-sm border-white/10 hover:bg-background/60 transition-colors text-center">
                            <Activity className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                            <h3 className="font-semibold text-sm">Real-time Stats</h3>
                            <p className="text-xs text-muted-foreground mt-1">Live updates on critical metrics</p>
                        </Card>
                        <Card className="p-4 bg-background/50 backdrop-blur-sm border-white/10 hover:bg-background/60 transition-colors text-center">
                            <Shield className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
                            <h3 className="font-semibold text-sm">Secure Data</h3>
                            <p className="text-xs text-muted-foreground mt-1">Enterprise-grade encryption</p>
                        </Card>
                    </div>

                    {/* Analytics Stack - Single Column for Safety */}
                    <div className="flex flex-col gap-6 w-full max-w-md">
                        <div className="grid grid-cols-2 gap-6">
                            <Card className="p-6 bg-background/60 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl flex flex-col items-center justify-center text-center transition-all hover:shadow-2xl hover:bg-background/80">
                                <div className="p-3 bg-primary/10 rounded-full mb-3">
                                    <Globe className="h-6 w-6 text-primary" />
                                </div>
                                <div className="text-2xl font-bold tabular-nums">100+</div>
                                <div className="text-xs text-muted-foreground mt-1">Cities</div>
                            </Card>
                            <Card className="p-6 bg-background/60 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl flex flex-col items-center justify-center text-center transition-all hover:shadow-2xl hover:bg-background/80">
                                <div className="p-3 bg-emerald-500/10 rounded-full mb-3">
                                    <Activity className="h-6 w-6 text-emerald-500" />
                                </div>
                                <div className="text-2xl font-bold tabular-nums text-emerald-500">98%</div>
                                <div className="text-xs text-muted-foreground mt-1">Uptime</div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
