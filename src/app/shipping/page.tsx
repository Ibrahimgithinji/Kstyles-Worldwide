export default function ShippingPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white">Shipping</h1>
        <p className="mt-2 text-[#a0a0a0]">Delivery information and policies.</p>
        <div className="mt-12 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-white">Shipping Methods</h2>
            <div className="mt-4 space-y-4">
              <div className="rounded-md border border-[#2a2a2a] bg-[#111] p-4"><h3 className="font-semibold text-white">Standard</h3><p className="mt-1 text-sm text-[#a0a0a0]">5-7 business days &middot; Free on orders over $200</p></div>
              <div className="rounded-md border border-[#2a2a2a] bg-[#111] p-4"><h3 className="font-semibold text-white">Express</h3><p className="mt-1 text-sm text-[#a0a0a0]">2-3 business days &middot; $15 flat rate</p></div>
              <div className="rounded-md border border-[#2a2a2a] bg-[#111] p-4"><h3 className="font-semibold text-white">International</h3><p className="mt-1 text-sm text-[#a0a0a0]">10-14 business days &middot; Calculated at checkout</p></div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Tracking</h2>
            <p className="mt-2 text-[#a0a0a0]">Once your order ships, you&apos;ll receive a confirmation email with a tracking number. You can also track your order from your account dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
}