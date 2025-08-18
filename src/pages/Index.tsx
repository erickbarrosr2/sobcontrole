import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Shield, PieChart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/LanguageToggle";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
          <h1 className="text-2xl font-bold text-primary">{t('app.title')}</h1>
          <div className="flex gap-2 items-center">
            <LanguageToggle />
            <Button variant="outline" onClick={() => navigate("/login")}>
              {t('auth.signIn')}
            </Button>
            <Button onClick={() => navigate("/register")}>
              {t('landing.getStarted')}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            {t('landing.title')}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('landing.subtitle')}
          </p>
          <Button size="lg" onClick={() => navigate("/register")} className="mr-4">
            {t('landing.startTracking')}
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
            {t('auth.signIn')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="h-12 w-12 mx-auto text-primary mb-4" />
              <CardTitle>{t('landing.features.trackEverything.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t('landing.features.trackEverything.description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <PieChart className="h-12 w-12 mx-auto text-primary mb-4" />
              <CardTitle>{t('landing.features.budgetRule.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t('landing.features.budgetRule.description')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 mx-auto text-primary mb-4" />
              <CardTitle>{t('landing.features.securePrivate.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t('landing.features.securePrivate.description')}
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('landing.readyToTakeControl')}</h2>
          <p className="text-muted-foreground mb-6">
            {t('landing.joinThousands')}
          </p>
          <Button size="lg" onClick={() => navigate("/register")}>
            {t('landing.createAccount')}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;
