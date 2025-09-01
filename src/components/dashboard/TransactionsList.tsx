import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Trash2, TrendingUp, TrendingDown, CheckSquare, X } from "lucide-react";
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
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const currency = t('budget.currency');

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

  const handleBulkDelete = async () => {
    if (selectedTransactions.size === 0) return;
    
    setBulkDeleting(true);
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .in("id", Array.from(selectedTransactions));

      if (error) throw error;

      toast({
        title: t('toast.success'),
        description: t('toast.bulkTransactionsDeleted', { count: selectedTransactions.size }),
      });
      
      setSelectedTransactions(new Set());
      setIsSelectionMode(false);
      onTransactionUpdated();
    } catch (error: any) {
      toast({
        title: t('toast.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleSelectTransaction = (id: string) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTransactions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTransactions.size === transactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(transactions.map(t => t.id)));
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedTransactions(new Set());
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
        <div className="flex items-center justify-between">
          <CardTitle>{t('dashboard.recentTransactions')}</CardTitle>
          <div className="flex items-center gap-2">
            {transactions.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectionMode}
                  className="flex items-center gap-2"
                >
                  {isSelectionMode ? (
                    <>
                      <X className="h-4 w-4" />
                      {t('transaction.cancelSelection')}
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-4 w-4" />
                      {t('transaction.selectMultiple')}
                    </>
                  )}
                </Button>
                {isSelectionMode && selectedTransactions.size > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={bulkDeleting}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        {t('transaction.deleteSelected', { count: selectedTransactions.size })}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('transaction.bulkDelete')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('transaction.bulkDeleteConfirm', { count: selectedTransactions.size })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('transaction.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleBulkDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {bulkDeleting ? t('transaction.deleting') : t('transaction.delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </>
            )}
          </div>
        </div>
        {isSelectionMode && transactions.length > 0 && (
          <div className="flex items-center gap-2 mt-4">
            <Checkbox
              checked={selectedTransactions.size === transactions.length}
              onCheckedChange={handleSelectAll}
              id="select-all"
            />
            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
              {t('transaction.selectAll')} ({selectedTransactions.size}/{transactions.length})
            </label>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg border bg-card gap-3 sm:gap-4 ${
                selectedTransactions.has(transaction.id) ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {isSelectionMode && (
                  <Checkbox
                    checked={selectedTransactions.has(transaction.id)}
                    onCheckedChange={() => handleSelectTransaction(transaction.id)}
                  />
                )}
                <div className={`p-2 rounded-full shrink-0 ${
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
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base truncate">{transaction.description}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                    <span>{format(new Date(transaction.created_at), "MMM dd, yyyy")}</span>
                    <Badge variant="outline" className="text-xs w-fit">
                      {t(`transaction.categories.${transaction.category}`)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                <span className={`font-semibold text-sm sm:text-base break-all ${
                  transaction.type === "income" ? "text-success" : "text-destructive"
                }`}>
                  {transaction.type === "income" ? "+" : "-"}{currency}{transaction.amount.toFixed(2)}
                </span>
                
                {!isSelectionMode && (
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-10 w-10 sm:h-8 sm:w-8 p-0"
                      onClick={() => {
                        setEditingTransaction(transaction);
                        setEditModalOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4 sm:h-3 sm:w-3" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-10 w-10 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive"
                          disabled={deletingId === transaction.id}
                        >
                          <Trash2 className="h-4 w-4 sm:h-3 sm:w-3" />
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
                )}
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