import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import { formatCurrency } from "../../utils/formatters";

export default function TopServicesBarChart({ data, title }) {
    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                    <YAxis type="category" dataKey="descricao" width={100} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="valor" fill="#3b82f6" name="Valor Total" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}