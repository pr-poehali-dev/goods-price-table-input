import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  quantity: string;
  price: string;
  sum: number;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: '', quantity: '', price: '', sum: 0 }
  ]);

  const addRow = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: '',
      quantity: '',
      price: '',
      sum: 0
    };
    setProducts([...products, newProduct]);
  };

  const removeRow = (id: string) => {
    if (products.length === 1) {
      toast({
        title: "Невозможно удалить",
        description: "Должна остаться хотя бы одна строка",
        variant: "destructive"
      });
      return;
    }
    setProducts(products.filter(p => p.id !== id));
  };

  const updateProduct = (id: string, field: keyof Product, value: string) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const updated = { ...p, [field]: value };
        
        if (field === 'quantity' || field === 'price') {
          const qty = parseFloat(field === 'quantity' ? value : updated.quantity) || 0;
          const price = parseFloat(field === 'price' ? value : updated.price) || 0;
          updated.sum = qty * price;
        }
        
        return updated;
      }
      return p;
    }));
  };

  const getTotalSum = () => {
    return products.reduce((acc, p) => acc + p.sum, 0);
  };

  const exportToCSV = () => {
    const headers = ['Наименование', 'Количество', 'Цена', 'Сумма'];
    const rows = products.map(p => [
      p.name || '-',
      p.quantity || '0',
      p.price || '0',
      p.sum.toFixed(2)
    ]);
    
    rows.push(['', '', 'ИТОГО:', getTotalSum().toFixed(2)]);
    
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n');
    
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `товары_${new Date().toLocaleDateString('ru-RU')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Экспорт выполнен",
      description: "Файл готов для импорта в 1С"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Учёт товаров
          </h1>
          <p className="text-slate-600">
            Заполните таблицу и экспортируйте в 1С
          </p>
        </div>

        <Card className="p-6 shadow-lg">
          <div className="mb-4 flex justify-between items-center">
            <Button
              onClick={addRow}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить строку
            </Button>
            
            <Button
              onClick={exportToCSV}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              <Icon name="Download" size={18} className="mr-2" />
              Экспорт в CSV для 1С
            </Button>
          </div>

          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold text-slate-700 w-[40%]">
                    Наименование товара
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 w-[15%]">
                    Количество
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 w-[15%]">
                    Цена
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 w-[20%]">
                    Сумма
                  </TableHead>
                  <TableHead className="w-[10%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <Input
                        value={product.name}
                        onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                        placeholder="Введите название"
                        className="border-slate-200 focus:border-primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={product.quantity}
                        onChange={(e) => updateProduct(product.id, 'quantity', e.target.value)}
                        placeholder="0"
                        className="border-slate-200 focus:border-primary"
                        min="0"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={product.price}
                        onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                        placeholder="0.00"
                        className="border-slate-200 focus:border-primary"
                        min="0"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-700 px-3 py-2">
                        {product.sum.toFixed(2)} ₽
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(product.id)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Icon name="Trash2" size={18} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                <TableRow className="bg-slate-100 font-bold">
                  <TableCell colSpan={3} className="text-right text-slate-700">
                    ИТОГО:
                  </TableCell>
                  <TableCell className="text-slate-800 text-lg">
                    {getTotalSum().toFixed(2)} ₽
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
