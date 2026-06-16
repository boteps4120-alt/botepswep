import { TossSuccessClient } from "./success-client";

type SearchParams = {
  paymentKey?: string;
  orderId?: string;
  amount?: string;
};

export default async function TossSuccessPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <TossSuccessClient
      paymentKey={params.paymentKey}
      orderId={params.orderId}
      amount={params.amount}
    />
  );
}
