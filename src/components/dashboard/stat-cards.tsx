'use client';

import type { FC } from 'react';
import { useMemo } from 'react';
import type { Sale } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Car, MapPin } from 'lucide-react';

interface StatCardsProps {
  data: Sale[];
}

const StatCards: FC<StatCardsProps> = ({ data }) => {
  const { totalSales, topModel, topRegion } = useMemo(() => {
    if (!data.length) {
      return { totalSales: 0, topModel: 'N/A', topRegion: 'N/A' };
    }

    const totalSales = data.reduce((sum, item) => sum + item.quantity, 0);

    const modelSales = data.reduce((acc, item) => {
      const key = `${item.manufacturer} ${item.model}`;
      acc[key] = (acc[key] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);

    let topModel = 'N/A';
    let maxModelSales = 0;
    for (const model in modelSales) {
      if (modelSales[model] > maxModelSales) {
        maxModelSales = modelSales[model];
        topModel = model;
      }
    }
    
    const regionSales = data.reduce((acc, item) => {
      const key = item.city ? `${item.city}, ${item.state}` : item.state;
      acc[key] = (acc[key] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);

    let topRegion = 'N/A';
    let maxRegionSales = 0;
    for (const region in regionSales) {
        if(regionSales[region] > maxRegionSales) {
            maxRegionSales = regionSales[region];
            topRegion = region;
        }
    }

    return { totalSales, topModel, topRegion };
  }, [data]);

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSales.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Total units sold in period</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Best-Selling Model</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{topModel}</div>
          <p className="text-xs text-muted-foreground">Top model by sales volume</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Sales Region</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{topRegion}</div>
          <p className="text-xs text-muted-foreground">Region with highest sales</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatCards;
