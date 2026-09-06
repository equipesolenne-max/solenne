interface OrderStatusTrackerProps {
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";
}

export default function OrderStatusTracker({ status }: OrderStatusTrackerProps) {
  if (status === "cancelled" || status === "returned") {
    return (
      <div className="border border-red-200 bg-red-50/50 p-4 text-center">
        <span className="font-sans text-[11px] tracking-[0.15em] uppercase text-red-900 font-medium">
          Order Status: {status.toUpperCase()}
        </span>
      </div>
    );
  }

  const steps = [
    { key: "pending", label: "Order Placed" },
    { key: "confirmed", label: "Confirmed" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ];

  const getStepIndex = (st: string) => {
    switch (st) {
      case "pending":
        return 0;
      case "confirmed":
      case "processing":
        return 1;
      case "shipped":
        return 2;
      case "delivered":
        return 3;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(status);

  return (
    <div className="py-6 px-4 bg-ivory-warm/40 border border-line">
      <div className="relative flex items-center justify-between">
        {/* Background Connecting Line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-line z-0" />
        {/* Active Progress Line */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-[2px] bg-gold z-0 transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 80 + 10}%` }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-sans transition-all ${
                  isCompleted
                    ? "bg-gold text-midnight font-bold"
                    : isCurrent
                    ? "bg-midnight text-ivory ring-4 ring-gold/20"
                    : "bg-ivory border border-line text-midnight/40"
                }`}
              >
                {isCompleted ? "✓" : idx + 1}
              </div>
              <span
                className={`mt-2 font-sans text-[10px] sm:text-[11px] tracking-[0.12em] uppercase text-center ${
                  isCurrent
                    ? "text-midnight font-semibold"
                    : isCompleted
                    ? "text-midnight/80"
                    : "text-midnight/40"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
