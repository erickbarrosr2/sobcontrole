-- Create monthly_incomes table for variable monthly income
CREATE TABLE public.monthly_incomes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2000),
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month, year)
);

-- Enable Row Level Security
ALTER TABLE public.monthly_incomes ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own monthly incomes" 
ON public.monthly_incomes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own monthly incomes" 
ON public.monthly_incomes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly incomes" 
ON public.monthly_incomes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly incomes" 
ON public.monthly_incomes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_monthly_incomes_updated_at
BEFORE UPDATE ON public.monthly_incomes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();