import { useState } from 'react';
import { StatCard } from '../components/StatCard';
import { ExpenseRow } from '../features/expenses/components/ExpenseRow';
import { AddExpenseModal } from '../features/expenses/components/AddExpenseModal';
import { useExpenses } from '../features/expenses/hooks/useExpenses';
import { Plus, CreditCard, Receipt, BarChart3, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function Expenses() {
    const now = new Date();
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [showModal, setShowModal] = useState(false);

    const { expenses, createExpense, deleteExpense } = useExpenses(selectedYear, selectedMonth);

    const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const categoryMap = expenses.reduce<Record<string, number>>((acc, e) => {
        acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount);
        return acc;
    }, {});
    const categoryTotals = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .map(([category, total]) => ({ category, total }));

    const handleAdd = async (amount: number, category: string, date: string, note: string) => {
        await createExpense({ amount, category, date, note });
    };

    const nextMonth = () => {
        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear(y => y + 1);
        } else {
            setSelectedMonth(m => m + 1);
        }
    };

    const prevMonth = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12);
            setSelectedYear(y => y - 1);
        } else {
            setSelectedMonth(m => m - 1);
        }
    };

    return (
        <>
            <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Expenses</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>
                                <CalendarDays size={16} />
                                {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button className="btn btn-ghost" style={{ padding: '0.25rem', borderRadius: '6px' }} onClick={prevMonth}><ChevronLeft size={16} /></button>
                                <button className="btn btn-ghost" style={{ padding: '0.25rem', borderRadius: '6px' }} onClick={nextMonth}><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    </div>
                    <button id="add-expense-btn" className="btn btn-purple" onClick={() => setShowModal(true)} style={{ padding: '0.75rem 1.25rem' }}>
                        <Plus size={18} strokeWidth={3} />
                        New Expense
                    </button>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                    <StatCard title="Total Spent" value={`₹${totalAmount.toLocaleString()}`} icon={CreditCard} accent="purple" />
                    <StatCard title="Transactions" value={expenses.length} icon={Receipt} accent="amber" />
                    <StatCard title="Top Category" value={categoryTotals[0]?.category ?? 'None'} icon={BarChart3} accent="green" />
                </div>

                {/* Main Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                    {/* List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <h2 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Transactions
                        </h2>
                        {expenses.length > 0 ? (
                            expenses.map((expense) => (
                                <ExpenseRow key={expense.id} expense={expense} onDelete={deleteExpense} />
                            ))
                        ) : (
                            <div className="card" style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed', backgroundColor: 'transparent' }}>
                                <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>No transactions found for this period.</p>
                            </div>
                        )}
                    </div>

                    {/* Category Breakdown */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <h2 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Breakdown
                        </h2>
                        {categoryTotals.length > 0 ? (
                            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {categoryTotals.map((c) => {
                                    const pct = totalAmount > 0 ? (c.total / totalAmount) * 100 : 0;
                                    return (
                                        <div key={c.category}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{c.category}</span>
                                                <span style={{ fontWeight: 800, color: 'var(--color-accent-purple)' }}>₹{c.total.toLocaleString()}</span>
                                            </div>
                                            <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'oklch(1 0 0 / 0.05)', overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%',
                                                    borderRadius: '3px',
                                                    background: 'linear-gradient(90deg, var(--color-accent-purple-dim), var(--color-accent-purple))',
                                                    width: `${pct}%`,
                                                    transition: 'width 800ms cubic-bezier(0.4, 0, 0.2, 1)'
                                                }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="card" style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed', backgroundColor: 'transparent' }}>
                                <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Log expenses to see breakdown.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Close the animate-slide-up div here so the modal is outside its transform context */}
            </div>

            {showModal && <AddExpenseModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
        </>
    );
}
