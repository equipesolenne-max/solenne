import { useMemo, useState } from "react";
import { useAdminCollection } from "../../hooks/useAdminCollection";
import type { CustomerRecord } from "../../types/admin";

export default function AdminCustomers() {
  const [query, setQuery] = useState("");
  const { data: customers, loading, error } = useAdminCollection<CustomerRecord>("users");

  const filteredCustomers = useMemo(() => {
    if (!query) return customers;
    const lowerQuery = query.toLowerCase();
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(lowerQuery) ||
      customer.email.toLowerCase().includes(lowerQuery) ||
      (customer.phone && customer.phone.toLowerCase().includes(lowerQuery))
    );
  }, [customers, query]);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-midnight tracking-tight">Clientele</h1>
          <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/40 mt-1">Directory of Solenne patrons and accounts</p>
        </div>
        <div className="relative w-full sm:w-72">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search patrons..."
            className="w-full bg-white border border-line rounded-2xl px-5 py-2.5 text-xs font-sans focus:ring-1 focus:ring-gold/30 outline-none transition-all shadow-sm"
          />
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-midnight/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-line p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-line text-midnight/40">
                <th className="pb-4 pl-2 font-sans text-[9px] tracking-[0.2em] uppercase">Patron</th>
                <th className="pb-4 font-sans text-[9px] tracking-[0.2em] uppercase">Contact Details</th>
                <th className="pb-4 font-sans text-[9px] tracking-[0.2em] uppercase">Registration</th>
                <th className="pb-4 font-sans text-[9px] tracking-[0.2em] uppercase text-center">History</th>
                <th className="pb-4 pr-2 font-sans text-[9px] tracking-[0.2em] uppercase text-right">Lifetime Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="group hover:bg-ivory-warm/10 transition-colors">
                  <td className="py-5 pl-2">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-full bg-ivory-warm flex items-center justify-center font-display text-sm text-midnight/40 border border-line/50">
                          {customer.name.charAt(0)}
                       </div>
                       <div className="font-display text-[15px] text-midnight">{customer.name}</div>
                    </div>
                  </td>
                  <td className="py-5">
                    <div className="font-sans text-[12px] text-midnight/60 lowercase">{customer.email}</div>
                    <div className="font-sans text-[9px] text-midnight/30 uppercase tracking-tighter mt-0.5">{customer.phone ?? "No phone"}</div>
                  </td>
                  <td className="py-5 font-sans text-[12px] text-midnight/60">{customer.joined_at ?? "Legacy"}</td>
                  <td className="py-5 text-center">
                    <span className="font-sans text-[10px] font-bold px-2 py-1 rounded bg-ivory-warm/50 text-midnight/60 border border-line/30">
                       {customer.order_count ?? 0} { (customer.order_count ?? 0) === 1 ? 'Order' : 'Orders' }
                    </span>
                  </td>
                  <td className="py-5 pr-2 text-right font-sans text-sm text-midnight font-medium">
                    {(customer.total_spent ?? 0).toLocaleString("fr-FR")} <span className="text-[10px] text-midnight/30 uppercase ml-1">DZD</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && filteredCustomers.length === 0 && (
            <div className="p-20 flex flex-col items-center justify-center text-midnight/20">
              <div className="animate-spin w-8 h-8 border-t-2 border-midnight rounded-full mb-4" />
              <p className="font-voice italic">Reviewing guest list...</p>
            </div>
          )}

          {!loading && filteredCustomers.length === 0 && (
            <div className="p-20 text-center text-midnight/30 font-voice italic">
              No patrons match your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

