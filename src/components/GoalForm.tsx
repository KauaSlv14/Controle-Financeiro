import { useState, useEffect } from "react";
import { Target, Link, Image as ImageIcon, Upload, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Goal } from "@/types/database";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Goal;
  onSubmit: (data: {
    name: string;
    targetAmount: number;
    productLink?: string;
    imageUrl?: string;
  }) => Promise<void>;
}

export function GoalForm({ open, onOpenChange, initialData, onSubmit }: GoalFormProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [productLink, setProductLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [imageSource, setImageSource] = useState<'url' | 'upload'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // uploading state kept for compatibility/UI feedback, though base64 conversion is fast
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open && initialData) {
      setName(initialData.name);
      setTargetAmount(initialData.target_amount.toString());
      setProductLink(initialData.product_link || "");
      setImageUrl(initialData.image_url || "");
      setImageSource('url'); // Default to showing the URL if it exists
    } else if (open && !initialData) {
      // Reset form
      setName("");
      setTargetAmount("");
      setProductLink("");
      setImageUrl("");
      setSelectedFile(null);
      setImageSource('url');
    }
  }, [open, initialData]);

  // Update preview
  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (imageUrl) {
      setPreviewUrl(imageUrl);
    } else if (name) {
      setPreviewUrl(`https://source.unsplash.com/400x300/?${encodeURIComponent(name)},product`);
    } else {
      setPreviewUrl(null);
    }
  }, [imageUrl, name, selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || parseFloat(targetAmount) <= 0) return;

    setLoading(true);
    try {
      let finalImageUrl = imageUrl;

      if (imageSource === 'upload' && selectedFile) {
        // Convert to Base64 instead of uploading to bucket
        try {
          // Simulate "uploading" state for user feedback
          setUploading(true);
          const base64Data = await convertFileToBase64(selectedFile);
          finalImageUrl = base64Data;
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Erro ao processar imagem",
            description: "Não foi possível converter a imagem."
          });
          setLoading(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      await onSubmit({
        name,
        targetAmount: parseFloat(targetAmount),
        productLink: productLink || undefined,
        imageUrl: finalImageUrl || undefined,
      });

      if (!initialData) {
        setName("");
        setTargetAmount("");
        setProductLink("");
        setImageUrl("");
        setSelectedFile(null);
        setPreviewUrl(null);
      }
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
            <span className="font-display">{initialData ? "Editar Meta" : "Nova Meta"}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Image Preview */}
          {previewUrl && (
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-xl overflow-hidden bg-secondary border-2 border-primary/20 shadow-lg flex items-center justify-center relative group">
                <img
                  src={previewUrl}
                  alt="Preview"
                  id="preview-img"
                  className="w-full h-full object-cover"
                  onError={() => {
                    const img = document.querySelector('#preview-img') as HTMLImageElement;
                    if (img) img.style.display = 'none';
                  }}
                  onLoad={() => {
                    const img = document.querySelector('#preview-img') as HTMLImageElement;
                    if (img) img.style.display = 'block';
                  }}
                />

                {/* Remove Image Button (if creating) */}
                {(imageUrl || selectedFile) && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl("");
                      setSelectedFile(null);
                    }}
                    className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}

                {/* Fallback for preview */}
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground p-4 text-center text-xs"
                  style={{ zIndex: 0 }}>
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="w-8 h-8 opacity-50" />
                    <span>Preview</span>
                  </div>
                </div>
                <style>{`
                    #preview-img { z-index: 1; position: relative; background: var(--background); }
                 `}</style>
              </div>
            </div>
          )}

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

          {/* Image Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Imagem da meta
            </Label>
            <Tabs value={imageSource} onValueChange={(v) => setImageSource(v as 'url' | 'upload')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url">URL da Imagem</TabsTrigger>
                <TabsTrigger value="upload">Upload de Arquivo</TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="mt-2">
                <Input
                  type="url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setSelectedFile(null); // Clear file if typing URL
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Cole o link de uma imagem da internet.
                </p>
              </TabsContent>
              <TabsContent value="upload" className="mt-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer file:cursor-pointer file:text-primary"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Selecione uma imagem do seu dispositivo (será salva diretamente).
                </p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={loading || uploading || !name || !targetAmount}>
            {(loading || uploading) ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {uploading ? "Processando imagem..." : "Salvando..."}
              </span>
            ) : (
              initialData ? "Salvar Alterações" : "Criar Meta"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
