export default function FAQPage() {
  const faqs = [
    { q: "What is your return policy?", a: "We accept returns within 30 days of delivery. Items must be unworn with tags attached. Return shipping is free on all domestic orders." },
    { q: "How long does shipping take?", a: "Standard shipping takes 5-7 business days. Express shipping is available at checkout (2-3 business days). International orders may take 10-14 business days." },
    { q: "Do you ship internationally?", a: "Yes, we ship to over 50 countries worldwide. Duties and taxes are calculated at checkout." },
    { q: "How do I find my size?", a: "Refer to our size guide on each product page. If you're between sizes, we recommend sizing up for an oversized fit." },
    { q: "Can I cancel my order?", a: "Orders can be cancelled within 1 hour of placement. After that, your order enters processing and cannot be modified." },
    { q: "Do you offer exchanges?", a: "Yes, we offer free size exchanges within 30 days. Contact our support team to initiate an exchange." },
  ];
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white">FAQ</h1>
        <p className="mt-2 text-[#a0a0a0]">Frequently asked questions.</p>
        <div className="mt-12 space-y-8">
          {faqs.map((f, i) => (
            <div key={i} className="border-b border-[#2a2a2a] pb-6">
              <h3 className="text-lg font-semibold text-white">{f.q}</h3>
              <p className="mt-2 text-[#a0a0a0]">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}