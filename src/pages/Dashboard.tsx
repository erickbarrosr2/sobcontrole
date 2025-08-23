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
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  first_name?: string;
  last_name?: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile>({ monthly_income: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        setFirstName(profileData.first_name || "");
        setLastName(profileData.last_name || "");
      }

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (transactionsData) {
        setTransactions(transactionsData as Transaction[]);
      }
    } catch (error: any) {
      toast({
        title: t('toast.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          monthly_income: parseFloat(monthlyIncome),
          first_name: firstName,
          last_name: lastName,
        });

      if (error) throw error;

      setProfile({ 
        monthly_income: parseFloat(monthlyIncome),
        first_name: firstName,
        last_name: lastName,
      });
      setSettingsOpen(false);
      toast({
        title: t('toast.success'),
        description: t('toast.profileUpdated'),
      });
    } catch (error: any) {
      toast({
        title: t('toast.error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return t('dashboard.user');
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
          <div className="animate-pulse text-lg">{t('dashboard.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t('app.title')}</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  {t('dashboard.settings')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('dashboard.settings')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('dashboard.firstName')}</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder={t('dashboard.firstName')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('dashboard.lastName')}</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder={t('dashboard.lastName')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="income">{t('dashboard.monthlyIncome')}</Label>
                    <Input
                      id="income"
                      type="number"
                      step="0.01"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      placeholder={t('dashboard.monthlyIncome')}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                      {t('dashboard.close')}
                    </Button>
                    <Button onClick={updateProfile}>
                      {t('dashboard.update')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              {t('dashboard.signOut')}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('dashboard.greeting', { name: getUserDisplayName() })}
          </h1>
          <p className="text-muted-foreground">{t('dashboard.welcomeBack')}</p>
        </div>

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
              <h2 className="text-xl font-semibold">{t('dashboard.recentTransactions')}</h2>
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