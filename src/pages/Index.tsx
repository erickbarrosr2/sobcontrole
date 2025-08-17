import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { TrendingUp, Shield, PieChart } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate("/dashboard");
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">ExpenseManager</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/register")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Simple Expense Tracking
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Take control of your finances with our minimalist expense manager. 
            Track your spending, follow the 50/30/20 rule, and achieve your financial goals.
          </p>
          <Button size="lg" onClick={() => navigate("/register")} className="mr-4">
            Start Tracking
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
            Sign In
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="h-12 w-12 mx-auto text-primary mb-4" />
              <CardTitle>Track Everything</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Easily add and categorize your income and expenses with our simple interface.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <PieChart className="h-12 w-12 mx-auto text-primary mb-4" />
              <CardTitle>50/30/20 Rule</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Follow the proven budgeting strategy: 50% needs, 30% wants, 20% savings.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 mx-auto text-primary mb-4" />
              <CardTitle>Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your financial data is encrypted and secure. Only you have access to your information.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to take control?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of users who have simplified their financial tracking.
          </p>
          <Button size="lg" onClick={() => navigate("/register")}>
            Create Your Account
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;
