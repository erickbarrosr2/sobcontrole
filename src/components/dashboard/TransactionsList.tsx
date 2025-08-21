import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { EditTransactionModal } from "./EditTransactionModal";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  created_at: string;
}

interface TransactionsListProps {
  transactions: Transaction[];
  onTransactionUpdated: () => void;
}

export const TransactionsList = ({ transactions, onTransactionUpdated }: TransactionsListProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: t('toast.success'),
        description: t('toast.transactionDeleted'),
      });
      onTransactionUpdated();
    } catch (error: any) {
      toast({
        title: t('toast.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground mb-4">{t('dashboard.noTransactions')}</p>
          <p className="text-sm text-muted-foreground">
            {t('dashboard.startAdding')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.recentTransactions')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  transaction.type === "income" 
                    ? "bg-income-bg text-income-text" 
                    : "bg-expense-bg text-expense-text"
                }`}>
                  {transaction.type === "income" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{format(new Date(transaction.created_at), "MMM dd, yyyy")}</span>
                    <Badge variant="outline" className="text-xs">
                      {t(`transaction.categories.${transaction.category}`)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${
                  transaction.type === "income" ? "text-success" : "text-destructive"
                }`}>
                  {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                </span>
                
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      setEditingTransaction(transaction);
                      setEditModalOpen(true);
                    }}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        disabled={deletingId === transaction.id}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('transaction.delete')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('transaction.deleteConfirm')} {t('transaction.deleteDescription')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('transaction.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(transaction.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {t('transaction.delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <EditTransactionModal
        transaction={editingTransaction}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onTransactionUpdated={onTransactionUpdated}
      />
    </Card>
  );
};