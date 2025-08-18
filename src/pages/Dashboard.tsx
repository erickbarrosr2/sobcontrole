import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BudgetOverview } from "@/components/dashboard/BudgetOverview";
import { TransactionModal } from "@/components/dashboard/TransactionModal";
import { TransactionsList } from "@/components/dashboard/TransactionsList";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Settings } from "lucide-react";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  created_at: string;
}

interface Profile {
  monthly_income: number;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile>({ monthly_income: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchData();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUser(user);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setMonthlyIncome(profileData.monthly_income.toString());
      }

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (transactionsData) {
        setTransactions(transactionsData);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMonthlyIncome = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          monthly_income: parseFloat(monthlyIncome),
        });

      if (error) throw error;

      setProfile({ monthly_income: parseFloat(monthlyIncome) });
      setSettingsOpen(false);
      toast({
        title: "Success",
        description: "Monthly income updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Calculate budget data
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.created_at);
    const currentDate = new Date();
    return transactionDate.getMonth() === currentDate.getMonth() && 
           transactionDate.getFullYear() === currentDate.getFullYear();
  });

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  // Categorize expenses for 50/30/20 rule
  const needsCategories = ["housing", "food", "utilities", "healthcare", "transportation"];
  const savingsCategories = ["savings"];
  
  const needsExpenses = currentMonthTransactions
    .filter(t => t.type === "expense" && needsCategories.includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsExpenses = currentMonthTransactions
    .filter(t => t.type === "expense" && savingsCategories.includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);

  const wantsExpenses = totalExpenses - needsExpenses - savingsExpenses;
  const savingsAmount = totalIncome - totalExpenses;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">ExpenseManager</h1>
          <div className="flex items-center gap-2">
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Account Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="income">Monthly Income</Label>
                    <Input
                      id="income"
                      type="number"
                      step="0.01"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      placeholder="Enter your monthly income"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={updateMonthlyIncome}>
                      Save
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <BudgetOverview
          monthlyIncome={profile.monthly_income}
          totalExpenses={totalExpenses}
          needsExpenses={needsExpenses}
          wantsExpenses={wantsExpenses}
          savingsAmount={savingsAmount}
        />

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Transactions</h2>
              <TransactionModal onTransactionAdded={fetchData} />
            </div>
            <TransactionsList 
              transactions={transactions} 
              onTransactionUpdated={fetchData}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;