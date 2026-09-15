import React from 'react';

interface BarChartProps {
    data: Array<{ label: string; value: number }>;
    color?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, color = '#3b82f6' }) => {
    const maxValue = Math.max(...data.map(d => d.value), 10);

    return (
        <div className="h-64 flex items-end gap-2 px-2">
            {data.map((item, i) => (
                <div
                    key={i}
                    className="flex-1 bg-blue-100 dark:bg-blue-900/30 rounded-t-lg relative group transition-all hover:brightness-90"
                    style={{
                        height: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: i === data.length - 1 ? color : undefined
                    }}
                >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {item.label}: {item.value}
                    </div>
                </div>
            ))}
        </div>
    );
};

interface TrendChartProps {
    data: Array<{ label: string; deposits: number; payouts: number }>;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
    const maxVal = Math.max(...data.map(d => Math.max(d.deposits, d.payouts)), 1000);

    return (
        <div className="h-64 flex items-end gap-3 px-2">
            {data.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end gap-1 h-full">
                    <div
                        className="w-full bg-green-500 rounded-t-sm relative group transition-all"
                        style={{ height: `${(item.deposits / maxVal) * 100}%` }}
                    >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            Deposits: ₹{item.deposits}
                        </div>
                    </div>
                    <div
                        className="w-full bg-red-500 rounded-t-sm relative group transition-all"
                        style={{ height: `${(item.payouts / maxVal) * 100}%` }}
                    >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            Payouts: ₹{item.payouts}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
