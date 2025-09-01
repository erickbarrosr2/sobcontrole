import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MonthNavigatorProps {
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
}

export const MonthNavigator = ({ currentMonth, currentYear, onMonthChange }: MonthNavigatorProps) => {
  const { t } = useTranslation();
  
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const monthNamesEn = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const isPortuguese = t('language.portuguese') === 'Português';
  const displayMonthNames = isPortuguese ? monthNames : monthNamesEn;

  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      onMonthChange(12, currentYear - 1);
    } else {
      onMonthChange(currentMonth - 1, currentYear);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      onMonthChange(1, currentYear + 1);
    } else {
      onMonthChange(currentMonth + 1, currentYear);
    }
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    onMonthChange(now.getMonth() + 1, now.getFullYear());
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return currentMonth === now.getMonth() + 1 && currentYear === now.getFullYear();
  };

  return (
    <div className="flex items-center justify-between mb-6 bg-card p-4 rounded-lg border">
      <Button
        variant="outline"
        size="sm"
        onClick={goToPreviousMonth}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">{t('dashboard.previousMonth')}</span>
      </Button>

      <div className="flex items-center gap-3">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg sm:text-xl font-semibold">
          {displayMonthNames[currentMonth - 1]} {currentYear}
        </h2>
        {!isCurrentMonth() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goToCurrentMonth}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {t('dashboard.currentMonth')}
          </Button>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={goToNextMonth}
        className="flex items-center gap-2"
      >
        <span className="hidden sm:inline">{t('dashboard.nextMonth')}</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};