import { useState } from "react";
import { Target, Link, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    targetAmount: number;
    productLink?: string;
    imageUrl?: string;
  }) => Promise<void>;
}

export function GoalForm({ open, onOpenChange, onSubmit }: GoalFormProps) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [productLink, setProductLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || parseFloat(targetAmount) <= 0) return;

    setLoading(true);
    try {
      await onSubmit({
        name,
        targetAmount: parseFloat(targetAmount),
        productLink: productLink || undefined,
        imageUrl: imageUrl || undefined,
      });
      setName("");
      setTargetAmount("");
      setProductLink("");
      setImageUrl("");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display">Nova Meta</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do item</Label>
            <Input
              id="name"
              placeholder="Ex: iPhone 15, Moto G, Viagem..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Target Amount */}
          <div className="space-y-2">
            <Label htmlFor="targetAmount">Valor da meta</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="targetAmount"
                type="number"
                step="0.01"
                min="1"
                placeholder="0,00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="pl-10 text-lg font-semibold"
                required
              />
            </div>
          </div>

          {/* Product Link */}
          <div className="space-y-2">
            <Label htmlFor="productLink" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Link do produto (opcional)
            </Label>
            <Input
              id="productLink"
              type="url"
              placeholder="https://..."
              value={productLink}
              onChange={(e) => setProductLink(e.target.value)}
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              URL da imagem (opcional)
            </Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Se não informar, buscaremos uma imagem automaticamente.
            </p>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={loading || !name || !targetAmount}>
            {loading ? "Criando..." : "Criar Meta"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
