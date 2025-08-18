import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";

interface BudgetOverviewProps {
  monthlyIncome: number;
  totalExpenses: number;
  needsExpenses: number;
  wantsExpenses: number;
  savingsAmount: number;
}

export const BudgetOverview = ({
  monthlyIncome,
  totalExpenses,
  needsExpenses,
  wantsExpenses,
  savingsAmount,
}: BudgetOverviewProps) => {
  const { t } = useTranslation();
  const balance = monthlyIncome - totalExpenses;
  const isPositive = balance >= 0;

  // 50/30/20 rule calculations
  const needsLimit = monthlyIncome * 0.5;
  const wantsLimit = monthlyIncome * 0.3;
  const savingsGoal = monthlyIncome * 0.2;

  const needsPercentage = (needsExpenses / needsLimit) * 100;
  const wantsPercentage = (wantsExpenses / wantsLimit) * 100;
  const savingsPercentage = (savingsAmount / savingsGoal) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('budget.income')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            ${monthlyIncome.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('budget.remaining')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? '+' : ''}${balance.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('budget.expenses')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            -${totalExpenses.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('budget.savings')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            ${savingsAmount.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      {/* 50/30/20 Budget Rule */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">50/30/20 Budget Rule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{t('budget.needs')} (50%)</span>
                <span>${needsExpenses.toFixed(2)} / ${needsLimit.toFixed(2)}</span>
              </div>
              <Progress 
                value={Math.min(needsPercentage, 100)} 
                className="h-2"
                style={{
                  background: needsPercentage > 100 ? 'hsl(var(--destructive))' : 'hsl(var(--budget-needs))'
                }}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {needsPercentage.toFixed(1)}% used
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{t('budget.wants')} (30%)</span>
                <span>${wantsExpenses.toFixed(2)} / ${wantsLimit.toFixed(2)}</span>
              </div>
              <Progress 
                value={Math.min(wantsPercentage, 100)} 
                className="h-2"
                style={{
                  background: wantsPercentage > 100 ? 'hsl(var(--destructive))' : 'hsl(var(--budget-wants))'
                }}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {wantsPercentage.toFixed(1)}% used
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{t('budget.savings')} (20%)</span>
                <span>${savingsAmount.toFixed(2)} / ${savingsGoal.toFixed(2)}</span>
              </div>
              <Progress 
                value={Math.min(savingsPercentage, 100)} 
                className="h-2"
                style={{
                  background: 'hsl(var(--budget-savings))'
                }}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {savingsPercentage.toFixed(1)}% achieved
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};