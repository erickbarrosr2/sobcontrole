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
  const currency = t('budget.currency');
  const balance = monthlyIncome - totalExpenses;
  const isPositive = balance >= 0;

  // 50/30/20 rule calculations
  const needsLimit = monthlyIncome * 0.5;
  const wantsLimit = monthlyIncome * 0.2;
  const savingsGoal = monthlyIncome * 0.3;

  const needsPercentage = (needsExpenses / needsLimit) * 100;
  const wantsPercentage = (wantsExpenses / wantsLimit) * 100;
  const savingsPercentage = (savingsAmount / savingsGoal) * 100;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <Card>
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            {t('budget.income')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-sm sm:text-xl lg:text-2xl font-bold text-success break-all">
            {currency}{monthlyIncome.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            {t('budget.remaining')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className={`text-sm sm:text-xl lg:text-2xl font-bold break-all ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? '+' : ''}{currency}{balance.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            {t('budget.expenses')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-sm sm:text-xl lg:text-2xl font-bold text-destructive break-all">
            -{currency}{totalExpenses.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            {t('budget.savings')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-sm sm:text-xl lg:text-2xl font-bold text-primary break-all">
            {currency}{savingsAmount.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      {/* 50/30/20 Budget Rule */}
      <Card className="col-span-2 lg:col-span-4">
        <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-3 sm:pb-4">
          <CardTitle className="text-sm sm:text-base lg:text-lg">50/20/30 {t('budget.budgetRule')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm mb-2 gap-1">
                <span className="font-medium">{t('budget.needs')} (50%)</span>
                <span className="text-muted-foreground break-all">
                  {currency}{needsExpenses.toFixed(2)} / {currency}{needsLimit.toFixed(2)}
                </span>
              </div>
              <Progress 
                value={Math.min(needsPercentage, 100)} 
                className="h-2"
                style={{
                  background: needsPercentage > 100 ? 'hsl(var(--destructive))' : 'hsl(var(--budget-needs))'
                }}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {needsPercentage.toFixed(1)}% {t('budget.used')}
              </div>
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm mb-2 gap-1">
                <span className="font-medium">{t('budget.wants')} (20%)</span>
                <span className="text-muted-foreground break-all">
                  {currency}{wantsExpenses.toFixed(2)} / {currency}{wantsLimit.toFixed(2)}
                </span>
              </div>
              <Progress 
                value={Math.min(wantsPercentage, 100)} 
                className="h-2"
                style={{
                  background: wantsPercentage > 100 ? 'hsl(var(--destructive))' : 'hsl(var(--budget-wants))'
                }}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {wantsPercentage.toFixed(1)}% {t('budget.used')}
              </div>
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm mb-2 gap-1">
                <span className="font-medium">{t('budget.savings')} (30%)</span>
                <span className="text-muted-foreground break-all">
                  {currency}{savingsAmount.toFixed(2)} / {currency}{savingsGoal.toFixed(2)}
                </span>
              </div>
              <Progress 
                value={Math.min(savingsPercentage, 100)} 
                className="h-2"
                style={{
                  background: 'hsl(var(--budget-savings))'
                }}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {savingsPercentage.toFixed(1)}% {t('budget.achieved')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};