import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MonthlyIncomeModalProps {
  month: number;
  year: number;
  currentIncome: number;
  onIncomeUpdated: () => void;
}

export const MonthlyIncomeModal = ({ month, year, currentIncome, onIncomeUpdated }: MonthlyIncomeModalProps) => {
  const [open, setOpen] = useState(false);
  const [income, setIncome] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
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

  useEffect(() => {
    if (open) {
      setIncome(currentIncome.toString());
    }
  }, [open, currentIncome]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("monthly_incomes")
        .upsert({
          user_id: user.id,
          month,
          year,
          amount: parseFloat(income),
        });

      if (error) throw error;

      toast({
        title: t('toast.success'),
        description: t('toast.monthlyIncomeUpdated'),
      });

      setOpen(false);
      onIncomeUpdated();
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">{t('dashboard.setMonthlyIncome')}</span>
          <span className="sm:hidden">Receita</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t('dashboard.monthlyIncomeFor', { month: displayMonthNames[month - 1] + ' ' + year })}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="income">{t('dashboard.monthlyIncome')}</Label>
            <Input
              id="income"
              type="number"
              step="0.01"
              min="0"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              required
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('dashboard.close')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? `${t('dashboard.update')}...` : t('dashboard.update')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};